export const AFFILIATION_ELIGIBLE_BADGES = ['official', 'supreme', 'officiel', 'suprême'];
export const AFFILIATION_BADGE_HIERARCHY = [
  'verified', 'donor', 'beta', 'early_supporter', 'contributor', 'certified', 'pro', 'urgency',
  'pioneer', 'translator', 'official', 'moderator', 'government', 'supreme',
  'ambassador', 'developer', 'mentor', 'scholar', 'advocate', 'organizer', 'protector', 'innovator',
];
export const AFFILIATION_BADGE_LEVEL = {
  verified: 1,
  certified: 2,
  pro: 3,
  official: 4,
  supreme: 5,
  government: 5,
  urgency: 3,
  moderator: 4,
  beta: 2,
  donor: 1,
  ambassador: 4,
  developer: 4,
  translator: 2,
  mentor: 3,
  scholar: 4,
  pioneer: 3,
  advocate: 3,
  organizer: 3,
  contributor: 2,
  early_supporter: 2,
  protector: 4,
  innovator: 4,
};

const normalizeBadge = (value) => String(value || '').toLowerCase();
const AFFILIATION_VERIFICATION_ORDER = [
  'verified', 'donor', 'early_supporter', 'beta', 'contributor', 'certified', 'pro', 'urgency',
  'pioneer', 'translator', 'official', 'moderator', 'ambassador', 'developer', 'mentor',
  'scholar', 'advocate', 'organizer', 'protector', 'innovator', 'government', 'supreme',
];
const canonicalVerificationBadge = (value) => {
  const normalized = normalizeBadge(value);
  if (['supreme', 'suprême'].includes(normalized)) return 'supreme';
  if (['official', '! officiel', 'officiel'].includes(normalized)) return 'official';
  if (['government', 'gouvernement', 'gouvernemental', 'multilateral', 'multilatéral'].includes(normalized)) return 'government';
  if (normalized === 'pro') return 'pro';
  if (['certified', 'certifié'].includes(normalized)) return 'certified';
  if (['verified', 'vérifié', 'verifie', 'verif'].includes(normalized)) return 'verified';
  return normalized;
};
const includesAny = (values = [], candidates = []) => {
  const normalized = values.map(normalizeBadge);
  return candidates.some((candidate) => normalized.includes(normalizeBadge(candidate)));
};

export function getHighestVerificationBadge(values = []) {
  const normalized = (Array.isArray(values) ? values : []).map(canonicalVerificationBadge);
  for (let i = AFFILIATION_VERIFICATION_ORDER.length - 1; i >= 0; i -= 1) {
    const badge = AFFILIATION_VERIFICATION_ORDER[i];
    if (normalized.includes(badge)) return badge;
  }
  return null;
}

export function isAffiliationEligibleOrganization(user = {}) {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  return includesAny(verifications, AFFILIATION_ELIGIBLE_BADGES)
    || includesAny(badges, AFFILIATION_ELIGIBLE_BADGES);
}

export function canManageAffiliations(user = {}) {
  return isAffiliationEligibleOrganization(user);
}

export function getVisibleAffiliation(affiliations = []) {
  return affiliations.find((affiliation) => affiliation?.status === 'accepted' && affiliation?.visibility === 'public') || null;
}

export function getOrganizationBadge(user = {}) {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const normalizedVerifications = verifications.map(normalizeBadge);

  if (normalizedVerifications.includes('supreme') || normalizedVerifications.includes('suprême')) return 'supreme';
  if (normalizedVerifications.includes('official') || normalizedVerifications.includes('officiel')) return 'official';
  if (badges.some((value) => normalizeBadge(value) === 'suprême')) return '! suprême';
  if (badges.some((value) => normalizeBadge(value) === 'officiel')) return 'official';
  return null;
}

export function getHighestBadgeLevel(user = {}) {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const normalized = [...verifications, ...badges].map(normalizeBadge);

  if (includesAny(normalized, ['supreme', 'suprême'])) return AFFILIATION_BADGE_LEVEL.supreme;
  if (includesAny(normalized, ['official', 'officiel'])) return AFFILIATION_BADGE_LEVEL.official;
  if (includesAny(normalized, ['pro'])) return AFFILIATION_BADGE_LEVEL.pro;
  if (includesAny(normalized, ['certified', 'certifié'])) return AFFILIATION_BADGE_LEVEL.certified;
  if (includesAny(normalized, ['verified', 'vérifié', 'verifie', 'verif'])) return AFFILIATION_BADGE_LEVEL.verified;
  return 0;
}