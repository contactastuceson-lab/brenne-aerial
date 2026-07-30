import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

const ADMIN_EMAIL = 'contact.astuceson@gmail.com';
const DAY = 1;
const MONTH = 30;
const YEAR = 365;

// Catalogue des effets de récompenses (inline — les backends ne supportent pas les imports partagés)
type RewardEffect = {
  type: 'auto' | 'token' | 'manual';
  apply?: { verifications?: string[]; perks?: Record<string, number | null> };
  token?: { key: string; count: number; label: string };
};

const REWARD_EFFECTS: Record<string, RewardEffect> = {
  // ── Abonnements (auto — flags temporels) ──
  premium_1m:    { type: 'auto', apply: { perks: { premium_until: MONTH } } },
  premium_3m:   { type: 'auto', apply: { perks: { premium_until: 90 } } },
  premium_1y:   { type: 'auto', apply: { perks: { premium_until: YEAR } } },
  business_1m:  { type: 'auto', apply: { perks: { business_until: MONTH } } },
  business_3m:  { type: 'auto', apply: { perks: { business_until: 90 } } },
  enterprise_1m:{ type: 'auto', apply: { perks: { enterprise_until: MONTH } } },

  // ── Badges (auto — ajout aux verifications) ──
  badge_verified:    { type: 'auto', apply: { verifications: ['verified'] } },
  badge_pro:         { type: 'auto', apply: { verifications: ['pro'] } },
  badge_certified:   { type: 'auto', apply: { verifications: ['certified'] } },
  badge_official:    { type: 'auto', apply: { verifications: ['official'] } },
  badge_ambassador:  { type: 'auto', apply: { verifications: ['ambassador'] } },
  badge_scholar:     { type: 'auto', apply: { verifications: ['scholar'] } },
  badge_donor:       { type: 'auto', apply: { verifications: ['donor'] } },
  badge_beta:        { type: 'auto', apply: { verifications: ['beta_tester'] } },
  badge_mentor:      { type: 'auto', apply: { verifications: ['mentor'] } },

  // ── Boosts de profil (auto — dates d'expiration) ──
  profile_featured_7d:   { type: 'auto', apply: { perks: { featured_until: 7 } } },
  profile_featured_30d:  { type: 'auto', apply: { perks: { featured_until: 30 } } },
  top_explorer_30d:      { type: 'auto', apply: { perks: { top_explorer_until: 30 } } },

  // ── Boosts de posts (token — l'utilisateur choisit le post) ──
  boost_1:  { type: 'token', token: { key: 'boost', count: 1, label: 'Boost de publication' } },
  boost_3:  { type: 'token', token: { key: 'boost', count: 3, label: 'Boost de publication' } },
  boost_10: { type: 'token', token: { key: 'boost', count: 10, label: 'Boost de publication' } },
  post_pinned_24h: { type: 'token', token: { key: 'pin_24h', count: 1, label: 'Post épinglé 24h' } },
  post_pinned_7d:  { type: 'token', token: { key: 'pin_7d', count: 1, label: 'Post épinglé 7j' } },

  // ── Fonctionnalités (auto — flags/dates) ──
  analytics_adv:         { type: 'auto', apply: { perks: { analytics_until: MONTH } } },
  scheduled_posts:       { type: 'auto', apply: { perks: { scheduled_posts_until: MONTH } } },
  storage_5gb:           { type: 'auto', apply: { perks: { storage_until: MONTH } } },
  custom_colors:         { type: 'auto', apply: { perks: { custom_colors: null } } },
  custom_animated_badge: { type: 'auto', apply: { perks: { custom_animated_badge: null } } },
  custom_notif_sound:    { type: 'auto', apply: { perks: { custom_notif_sound: null } } },
  particle_effects:      { type: 'auto', apply: { perks: { particle_effects: null } } },
  custom_watermark:      { type: 'auto', apply: { perks: { custom_watermark: null } } },

  // ── Exclusivités ──
  vip_1m:         { type: 'auto', apply: { perks: { vip_until: MONTH } } },
  early_access:   { type: 'auto', apply: { perks: { early_access_until: YEAR } } },
  founder_cert:   { type: 'auto', apply: { perks: { founder_number: 0, founder_at: 0 } } },
  call_pdg:       { type: 'manual' },
  studio_visit:   { type: 'manual' },
  tshirt_eza:     { type: 'manual' },
  hoodie_eza:     { type: 'manual' },
  stickers_pack:  { type: 'manual' },
  feature_naming: { type: 'manual' },
  vip_playlist:   { type: 'manual' },

  // ── Communauté (token) ──
  vip_community:            { type: 'token', token: { key: 'community_premium_design', count: 1, label: 'Création communauté VIP' } },
  community_1k:             { type: 'token', token: { key: 'community_capacity', count: 1, label: 'Capacité 1000 membres' } },
  pin_community:            { type: 'token', token: { key: 'community_pin', count: 1, label: 'Épingler une communauté' } },
  sponsored_event:          { type: 'token', token: { key: 'sponsored_event', count: 1, label: 'Événement sponsorisé' } },
  community_premium_design: { type: 'token', token: { key: 'community_premium_design', count: 1, label: 'Design premium communauté' } },
  community_space:          { type: 'token', token: { key: 'community_space', count: 1, label: 'Space communautaire' } },
};

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

    // Email confirmation
    waitUntil(
      base44.integrations.Core.SendEmail({
        to: user.email,
        subject: effect.type === 'auto' ? '✅ Récompense activée !' : effect.type === 'token' ? '🎫 Tokens ajoutés !' : '🎁 Récompense réclamée',
        body: `Bonjour ${user.display_name || user.username},\n\nVous avez échangé ${cost} crédits contre : ${rewardLabel}.\n\n${
          effect.type === 'auto' ? 'Votre avantage a été activé automatiquement et est disponible dès maintenant.' :
          effect.type === 'token' ? `${tokenCount} token(s) ont été ajoutés à votre compte. Rendez-vous sur la boutique pour les utiliser.` :
          'Votre demande est en cours de traitement par notre équipe. Vous serez notifié(e) dès qu\'elle sera active.'
        }\n\nCrédits restants : ${newCredits}\n\n— L'équipe Eza`,
      }).catch(() => {})
    );

    return Response.json({ success: true, remainingCredits: newCredits, message: successMsg, fulfillmentType: effect.type, tokenType, tokenCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}