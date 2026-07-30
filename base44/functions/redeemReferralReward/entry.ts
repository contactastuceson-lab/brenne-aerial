import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

const ADMIN_EMAIL = 'contact.astuceson@gmail.com';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const { rewardId, rewardLabel, rewardCategory, cost } = body || {};
    if (!rewardId || !cost) return Response.json({ error: 'Récompense invalide' }, { status: 400 });

    const currentCredits = user.referral_credits || 0;
    if (currentCredits < cost) {
      return Response.json({ error: 'Crédits insuffisants', needed: cost, available: currentCredits }, { status: 400 });
    }

    // Deduct credits (service role for atomicity)
    const newCredits = currentCredits - cost;
    await base44.asServiceRole.entities.User.update(user.id, {
      referral_credits: newCredits,
    });

    // Create redemption record (user context — RLS allows self create)
    await base44.entities.RewardRedemption.create({
      user_email: user.email,
      user_name: user.display_name || user.full_name || user.username,
      item_id: rewardId,
      item_label: rewardLabel,
      item_category: rewardCategory || 'autre',
      cost,
      status: 'pending',
    });

    // Notify admin
    waitUntil(
      base44.asServiceRole.entities.Notification.create({
        user_email: ADMIN_EMAIL,
        type: 'system',
        title: '🎁 Récompense réclamée',
        content: `${user.display_name || user.username} (${user.email}) a réclamé : ${rewardLabel} pour ${cost} crédits. Crédits restants : ${newCredits}.`,
        sender_name: user.display_name || user.username,
      }).catch(() => {})
    );

    // Email confirmation to user
    waitUntil(
      base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🎁 Récompense réclamée !',
        body: `Bonjour ${user.display_name || user.username},\n\nVous avez échangé ${cost} crédits contre : ${rewardLabel}.\n\nVotre demande est en cours de traitement par notre équipe. Vous serez notifié(e) dès qu'elle sera active.\n\nCrédits restants : ${newCredits}\n\n— L'équipe Eza`,
      }).catch(() => {})
    );

    return Response.json({ success: true, remainingCredits: newCredits });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}