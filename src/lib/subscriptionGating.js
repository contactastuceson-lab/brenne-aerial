// Central subscription gating logic for Eza.
// Imports a perks object (user.perks) and exposes helpers used across pages
// to gate features by Premium / Business / Enterprise tiers.

function isPerkActive(perks, key) {
  if (!perks) return false;
  const v = perks[key];
  if (v === true || v === null) return true;
  if (typeof v === 'string') return new Date(v).getTime() > Date.now();
  return false;
}

export function hasPremium(perks = {}) {
  return isPerkActive(perks, 'premium_until')
    || isPerkActive(perks, 'business_until')
    || isPerkActive(perks, 'enterprise_until')
    || isPerkActive(perks, 'vip_until');
}

export function hasBusiness(perks = {}) {
  return isPerkActive(perks, 'business_until')
    || isPerkActive(perks, 'enterprise_until')
    || isPerkActive(perks, 'vip_until');
}

export function hasEnterprise(perks = {}) {
  return isPerkActive(perks, 'enterprise_until') || isPerkActive(perks, 'vip_until');
}

export function hasEarlyAccess(perks = {}) {
  return isPerkActive(perks, 'early_access_until') || hasEnterprise(perks);
}

export function hasScheduledPostsUnlimited(perks = {}) {
  return isPerkActive(perks, 'scheduled_posts_until') || hasPremium(perks);
}

export function hasAdvancedAnalytics(perks = {}) {
  return isPerkActive(perks, 'analytics_until') || hasBusiness(perks);
}

// Number of sponsored posts a user can publish for free per month.
export function getSponsoredPostsQuota(perks = {}) {
  if (hasEnterprise(perks)) return Infinity;
  if (hasBusiness(perks)) return 2;
  return 0;
}

export function getScheduledPostsLimit(perks = {}) {
  if (hasScheduledPostsUnlimited(perks)) return Infinity;
  return 5;
}

export function getStorageQuotaBytes(perks = {}) {
  if (hasEnterprise(perks)) return 50 * 1024 * 1024 * 1024; // 50 GB
  if (isPerkActive(perks, 'storage_until') || hasBusiness(perks)) return 5 * 1024 * 1024 * 1024; // 5 GB
  if (hasPremium(perks)) return 2 * 1024 * 1024 * 1024; // 2 GB
  return 500 * 1024 * 1024; // 500 MB free
}

// Numeric tier rank for sort priority (enterprise > vip > business > premium > 0)
export function getTierRank(perks = {}) {
  if (hasEnterprise(perks)) return 4;
  if (isPerkActive(perks, 'vip_until')) return 3;
  if (hasBusiness(perks)) return 2;
  if (hasPremium(perks)) return 1;
  return 0;
}

export const TIER_LABELS = {
  premium: 'Premium',
  business: 'Business',
  enterprise: 'Enterprise',
  vip: 'VIP',
};

export function getActiveTierLabel(perks = {}) {
  if (hasEnterprise(perks)) return 'Enterprise';
  if (isPerkActive(perks, 'vip_until')) return 'VIP';
  if (hasBusiness(perks)) return 'Business';
  if (hasPremium(perks)) return 'Premium';
  return null;
}