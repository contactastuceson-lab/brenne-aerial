import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { REWARD_EFFECTS } from '../../shared/rewardEffects.ts';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

const ADMIN_EMAIL = 'contact.astuceson@gmail.com';

async function getNextFounderNumber(base44: any): Promise<number> {
  try {
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    let max = 0;
    for (const u of users || []) {
      const n = u?.perks?.founder_number;
      if (typeof n === 'number' && n > max) max = n;
    }
    return max + 1;
  } catch {
    return Date.now() % 10000;
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const { rewardId, rewardLabel, rewardCategory, cost } = body || {};
    if (!rewardId || !cost) return Response.json({ error: 'Récompense invalide' }, { status: 400 });

    const effect = REWARD_EFFECTS[rewardId];
    if (!effect) return Response.json({ error: 'Récompense inconnue' }, { status: 400 });

    const currentCredits = user.referral_credits || 0;
    if (currentCredits < cost) {
      return Response.json({ error: 'Crédits insuffisants', needed: cost, available: currentCredits }, { status: 400 });
    }

    // Vérifier l'éligibilité aux badges
    if (effect.type === 'auto' && effect.apply?.verifications && user.badges_eligible === false) {
      return Response.json({ error: 'Votre profil est non-éligible aux badges' }, { status: 403 });
    }

    // Déduire les crédits
    const newCredits = currentCredits - cost;
    await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newCredits });

    const now = new Date();
    const isoNow = now.toISOString();
    let redemptionStatus = 'pending';
    let tokenType: string | null = null;
    let tokenCount = 0;
    let appliedAt: string | null = null;
    let successMsg = 'Récompense réclamée !';

    if (effect.type === 'auto') {
      const perks = { ...(user.perks || {}) };
      const verifs = [...(user.verifications || [])];
      let verifsChanged = false;
      let setVerifiedStatus = false;

      if (effect.apply?.verifications) {
        for (const v of effect.apply.verifications) {
          if (!verifs.includes(v)) { verifs.push(v); verifsChanged = true; }
        }
        if (effect.apply.verifications.includes('verified')) setVerifiedStatus = true;
      }

      if (effect.apply?.perks) {
        for (const [key, days] of Object.entries(effect.apply.perks)) {
          if (key === 'founder_number') {
            perks.founder_number = await getNextFounderNumber(base44);
            perks.founder_at = isoNow;
          } else if (days === null) {
            perks[key] = true;
          } else if (typeof days === 'number') {
            const existing = perks[key];
            let baseDate: Date;
            if (existing && new Date(existing) > now) baseDate = new Date(existing);
            else baseDate = new Date(now);
            baseDate.setDate(baseDate.getDate() + days);
            perks[key] = baseDate.toISOString();
          }
        }
      }

      const updateData: any = { perks };
      if (verifsChanged) updateData.verifications = verifs;
      if (setVerifiedStatus) updateData.verified_status = 'yes';

      await base44.asServiceRole.entities.User.update(user.id, updateData);
      redemptionStatus = 'fulfilled';
      appliedAt = isoNow;
      successMsg = effect.apply?.verifications ? 'Badge attribué instantanément !' : 'Avantage activé instantanément !';

    } else if (effect.type === 'token') {
      const perks = { ...(user.perks || {}) };
      const tokens = { ...(perks.tokens || {}) };
      const tk = effect.token!;
      tokens[tk.key] = (tokens[tk.key] || 0) + tk.count;
      perks.tokens = tokens;
      await base44.asServiceRole.entities.User.update(user.id, { perks });
      redemptionStatus = 'fulfilled';
      tokenType = tk.key;
      tokenCount = tk.count;
      appliedAt = isoNow;
      successMsg = `${tk.count} token(s) « ${tk.label} » ajouté(s) !`;
    } else {
      successMsg = 'Demande enregistrée — notre équipe vous contactera.';
    }

    // Créer la réclamation
    await base44.entities.RewardRedemption.create({
      user_email: user.email,
      user_id: user.id,
      user_name: user.display_name || user.full_name || user.username,
      item_id: rewardId,
      item_label: rewardLabel,
      item_category: rewardCategory || 'autre',
      cost,
      fulfillment_type: effect.type,
      token_type: tokenType,
      token_count: tokenCount,
      status: redemptionStatus,
      applied_at: appliedAt,
    });

    // Notifier admin (uniquement pour manuel)
    if (effect.type === 'manual') {
      waitUntil(
        base44.asServiceRole.entities.Notification.create({
          user_email: ADMIN_EMAIL,
          type: 'system',
          title: '🎁 Récompense réclamée (action requise)',
          content: `${user.display_name || user.username} (${user.email}) a réclamé : ${rewardLabel} pour ${cost} crédits. Type: manuel. Crédits restants : ${newCredits}.`,
          sender_name: user.display_name || user.username,
        }).catch(() => {})
      );
    }

    // Email confirmation — branded eza template
    waitUntil(
      sendEzaEmail(base44, {
        to: user.email,
        title: effect.type === 'auto' ? 'Récompense activée' : effect.type === 'token' ? 'Tokens ajoutés' : 'Récompense réclamée',
        subject: effect.type === 'auto' ? '✅ Votre récompense Eza est active' : effect.type === 'token' ? '🎫 Tokens ajoutés sur Eza' : '🎁 Récompense réclamée sur Eza',
        body: `Bonjour **${user.display_name || user.username}**,\n\nVous avez échangé **${cost} crédits** contre :\n\n**${rewardLabel}**\n\n${
          effect.type === 'auto'
            ? 'Votre avantage a été **activé automatiquement** et est disponible dès maintenant sur votre compte.'
            : effect.type === 'token'
              ? `**${tokenCount} token(s)** ont été ajoutés à votre compte. Rendez-vous sur la **Boutique** pour les utiliser sur vos publications.`
              : 'Votre demande est en cours de traitement par notre équipe. Vous recevrez une notification dès qu\'elle sera active.'
        }\n\n- **Crédits restants :** ${newCredits}\n- **Type :** ${effect.type === 'auto' ? 'Instantané' : effect.type === 'token' ? 'Token' : 'Manuel'}\n\nMerci de votre confiance,\n— L'équipe eza`,
        tagline: 'Boutique & Récompenses',
      }).catch(() => {})
    );

    return Response.json({ success: true, remainingCredits: newCredits, message: successMsg, fulfillmentType: effect.type, tokenType, tokenCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}