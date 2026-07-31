// Shared reward-effect catalog + reversal logic.
// Imported by redeemReferralReward and adminManageRedemption so effect application
// and effect reversal stay in sync without duplicating logic.

export const DAY = 1;
export const MONTH = 30;
export const YEAR = 365;

type RewardEffect = {
  type: 'auto' | 'token' | 'manual';
  apply?: { verifications?: string[]; perks?: Record<string, number | null> };
  token?: { key: string; count: number; label: string };
};

export const REWARD_EFFECTS: Record<string, RewardEffect> = {
  // ── Abonnements Premium (bleu Verified OU vert Pro — plus cher) ──
  premium_1m:       { type: 'auto', apply: { verifications: ['verified'], perks: { premium_until: MONTH } } },
  premium_3m:       { type: 'auto', apply: { verifications: ['verified'], perks: { premium_until: 90 } } },
  premium_1y:       { type: 'auto', apply: { verifications: ['verified'], perks: { premium_until: YEAR } } },
  premium_pro_1m:   { type: 'auto', apply: { verifications: ['pro'], perks: { premium_until: MONTH } } },
  premium_pro_3m:   { type: 'auto', apply: { verifications: ['pro'], perks: { premium_until: 90 } } },
  premium_pro_1y:   { type: 'auto', apply: { verifications: ['pro'], perks: { premium_until: YEAR } } },
  // ── Abonnements Business (jaune Certifié OU violet Officiel — plus cher) ──
  business_1m:           { type: 'auto', apply: { verifications: ['certified'], perks: { business_until: MONTH } } },
  business_3m:           { type: 'auto', apply: { verifications: ['certified'], perks: { business_until: 90 } } },
  business_official_1m:  { type: 'auto', apply: { verifications: ['official'], perks: { business_until: MONTH } } },
  business_official_3m:  { type: 'auto', apply: { verifications: ['official'], perks: { business_until: 90 } } },
  // ── Enterprise (Officiel + perks — requiert preuves, géré par submitEnterpriseProofs) ──
  enterprise_1m: { type: 'auto', apply: { verifications: ['official', 'certified'], perks: { enterprise_until: MONTH } } },

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
  vip_1m:         { type: 'auto', apply: { verifications: ['official'], perks: { vip_until: MONTH } } },
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

// Community token keys that have a Community-entity effect to reverse
const COMMUNITY_TOKEN_KEYS = ['community_pin', 'community_capacity', 'community_premium_design'];

// Reverse a community-level effect (is_pinned, capacity_limit, is_premium) on all
// communities owned by the user. Called when revoking a community-type reward.
async function reverseCommunityEffect(base44: any, userId: string, tokenKey: string): Promise<string> {
  try {
    const communities = await base44.asServiceRole.entities.Community.filter({ owner_id: userId });
    if (!communities || communities.length === 0) return 'aucune communauté possédée';

    let patch: Record<string, any>;
    if (tokenKey === 'community_pin') patch = { is_pinned: false, pinned_until: null };
    else if (tokenKey === 'community_capacity') patch = { capacity_limit: 100 };
    else if (tokenKey === 'community_premium_design') patch = { is_premium: false };
    else return 'aucun effet communauté à inverser';

    let count = 0;
    for (const c of communities) {
      try { await base44.asServiceRole.entities.Community.update(c.id, patch); count++; } catch {}
    }
    return `${count} communauté(s) réinitialisée(s)`;
  } catch (e: any) {
    return 'erreur communauté: ' + (e?.message || 'unknown');
  }
}

// Reverse a reward's effects on the user (remove badges, perks, tokens) AND on
// community entities for community-type rewards.
// Called by adminManageRedemption when an admin rejects/revokes a reward.
export async function reverseRewardEffect(base44: any, userId: string, rewardId: string): Promise<{ reversed: boolean; details: string }> {
  const effect = REWARD_EFFECTS[rewardId];
  if (!effect) return { reversed: false, details: 'Effet inconnu — rien à inverser' };

  let user: any;
  try { user = await base44.asServiceRole.entities.User.get(userId); } catch {
    return { reversed: false, details: 'Utilisateur introuvable' };
  }
  if (!user) return { reversed: false, details: 'Utilisateur introuvable' };

  const perks = { ...(user.perks || {}) };
  const verifs = [...(user.verifications || [])];
  let verifsChanged = false;
  let verifiedStatusReset = false;
  const removed: string[] = [];

  if (effect.type === 'auto') {
    if (effect.apply?.verifications) {
      for (const v of effect.apply.verifications) {
        const idx = verifs.indexOf(v);
        if (idx >= 0) { verifs.splice(idx, 1); verifsChanged = true; removed.push(`badge ${v}`); }
      }
      if (effect.apply.verifications.includes('verified') && user.verified_status === 'yes') {
        verifiedStatusReset = true;
      }
    }
    if (effect.apply?.perks) {
      for (const key of Object.keys(effect.apply.perks)) {
        if (key in perks) { delete perks[key]; removed.push(key); }
      }
    }
  } else if (effect.type === 'token' && effect.token) {
    const tokens = { ...(perks.tokens || {}) };
    const tk = effect.token;
    const current = tokens[tk.key] || 0;
    tokens[tk.key] = Math.max(0, current - tk.count);
    if (tokens[tk.key] === 0) delete tokens[tk.key];
    perks.tokens = tokens;
    removed.push(`${tk.count} token(s) ${tk.key}`);
    // Community tokens also have a Community-entity effect to reverse
    if (COMMUNITY_TOKEN_KEYS.includes(tk.key)) {
      try {
        const commInfo = await reverseCommunityEffect(base44, userId, tk.key);
        removed.push(`effet communauté: ${commInfo}`);
      } catch (e: any) {
        removed.push(`erreur communauté: ${e?.message || 'unknown'}`);
      }
    }
  } else {
    return { reversed: false, details: 'Type manuel — aucun effet appliqué à inverser' };
  }

  const updateData: any = { perks };
  if (verifsChanged) updateData.verifications = verifs;
  if (verifiedStatusReset) updateData.verified_status = 'no';

  try {
    await base44.asServiceRole.entities.User.update(userId, updateData);
    return { reversed: true, details: removed.length > 0 ? `Effets retirés: ${removed.join(', ')}` : 'Aucun effet actif à retirer' };
  } catch (e: any) {
    return { reversed: false, details: 'Erreur: ' + (e?.message || 'unknown') };
  }
}