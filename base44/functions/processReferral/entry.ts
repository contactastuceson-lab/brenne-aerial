import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

const CREDITS_PER_REFERRAL = 50;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const referralCode = body?.referralCode;
    if (!referralCode) return Response.json({ error: 'Code de parrainage manquant' }, { status: 400 });

    // Cannot refer yourself
    if (user.username === referralCode) {
      return Response.json({ error: 'Vous ne pouvez pas vous parrainer vous-même' }, { status: 400 });
    }

    // Find referrer by username (referral code = username)
    const referrers = await base44.asServiceRole.entities.User.filter({ username: referralCode });
    if (!referrers || referrers.length === 0) {
      return Response.json({ error: 'Code de parrainage invalide' }, { status: 404 });
    }
    const referrer = referrers[0];

    // Check if this user already has a referral record from this referrer
    const existing = await base44.asServiceRole.entities.Referral.filter({
      referred_email: user.email,
      referrer_email: referrer.email,
    });
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Parrainage déjà traité', alreadyProcessed: true });
    }

    // Create referral record (signup milestone already credited)
    await base44.asServiceRole.entities.Referral.create({
      referrer_email: referrer.email,
      referrer_name: referrer.display_name || referrer.full_name || referrer.username,
      referral_code: referralCode,
      referred_name: user.display_name || user.full_name || user.username,
      referred_email: user.email,
      referred_user_id: user.id,
      credits_earned: CREDITS_PER_REFERRAL,
      milestones_rewarded: ['signup'],
      status: 'validated',
    });

    // Award credits to referrer
    const newCredits = (referrer.referral_credits || 0) + CREDITS_PER_REFERRAL;
    await base44.asServiceRole.entities.User.update(referrer.id, {
      referral_credits: newCredits,
    });

    // Notify referrer via email (registered user)
    waitUntil(
      base44.integrations.Core.SendEmail({
        to: referrer.email,
        subject: '🎉 Votre filleul a rejoint Eza !',
        body: `Félicitations !\n\n${user.display_name || user.username} s'est inscrit sur Eza avec votre code de parrainage.\n\nVous avez gagné ${CREDITS_PER_REFERRAL} crédits Eza.\n\nTotal de vos crédits : ${newCredits}\n\nContinuez à parrainer pour débloquer plus de récompenses.\n\n— L'équipe Eza`,
      }).catch(() => {})
    );

    return Response.json({
      success: true,
      creditsAwarded: CREDITS_PER_REFERRAL,
      referrerName: referrer.display_name || referrer.username,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}