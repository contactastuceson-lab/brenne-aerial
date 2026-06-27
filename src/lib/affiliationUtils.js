export const AFFILIATION_ELIGIBLE_BADGES = ['official', 'supreme', 'officiel', 'suprême'];

export function isAffiliationEligibleOrganization(user = {}) {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const normalizedVerifications = verifications.map((value) => String(value || '').toLowerCase());
  const normalizedBadges = badges.map((value) => String(value || '').toLowerCase());

  return normalizedVerifications.some((value) => AFFILIATION_ELIGIBLE_BADGES.includes(value))
    || normalizedBadges.some((value) => AFFILIATION_ELIGIBLE_BADGES.includes(value));
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
  const normalizedVerifications = verifications.map((value) => String(value || '').toLowerCase());
  if (normalizedVerifications.includes('supreme')) return 'supreme';
  if (normalizedVerifications.includes('official')) return 'official';
  if (badges.some((value) => String(value || '').toLowerCase() === 'suprême')) return 'supreme';
  if (badges.some((value) => String(value || '').toLowerCase() === 'officiel')) return 'official';
  return 'official';
}
