import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AFFILIATION_ELIGIBLE_BADGES = ['official', 'supreme', 'officiel', 'suprême'];
const AFFILIATION_VERIFICATION_ORDER = ['verified', 'certified', 'pro', 'official', 'supreme'];
const AFFILIATION_BADGE_LEVEL = {
  verified: 1,
  certified: 2,
  pro: 3,
  official: 4,
  supreme: 5,
};

const normalize = (value) => String(value || '').trim().toLowerCase();
const canonicalVerification = (value) => {
  const normalized = normalize(value);
  if (['supreme', 'suprême'].includes(normalized)) return 'supreme';
  if (['official', 'officiel'].includes(normalized)) return 'official';
  if (normalized === 'pro') return 'pro';
  if (['certified', 'certifié'].includes(normalized)) return 'certified';
  if (['verified', 'vérifié', 'verifie', 'verif'].includes(normalized)) return 'verified';
  return normalized;
};
const includesAny = (values = [], candidates = []) => {
  const normalizedValues = values.map(normalize);
  return candidates.some((candidate) => normalizedValues.includes(normalize(candidate)));
};
const getHighestVerification = (values = []) => {
  const normalized = values.map(canonicalVerification);
  for (let i = AFFILIATION_VERIFICATION_ORDER.length - 1; i >= 0; i -= 1) {
    const badge = AFFILIATION_VERIFICATION_ORDER[i];
    if (normalized.includes(badge)) return badge;
  }
  return null;
};
const retainHighestVerificationBadge = (values = []) => {
  const highest = getHighestVerification(values);
  return highest ? [highest] : [];
};
const filterKnownVerifications = (values = []) => {
  return values.filter((value) => AFFILIATION_VERIFICATION_ORDER.includes(canonicalVerification(value)));
};
const buildPrimaryVerificationSet = (values = [], forceCertified = false) => {
  if (forceCertified) return ['certified'];
  return retainHighestVerificationBadge(filterKnownVerifications(values));
};

const getHighestBadgeLevel = (user = {}) => {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const all = [...verifications, ...badges].map(normalize);

  if (includesAny(all, ['supreme', 'suprême'])) return AFFILIATION_BADGE_LEVEL.supreme;
  if (includesAny(all, ['official', 'officiel'])) return AFFILIATION_BADGE_LEVEL.official;
  if (includesAny(all, ['pro'])) return AFFILIATION_BADGE_LEVEL.pro;
  if (includesAny(all, ['certified', 'certifié'])) return AFFILIATION_BADGE_LEVEL.certified;
  if (includesAny(all, ['verified', 'vérifié', 'verifie', 'verif'])) return AFFILIATION_BADGE_LEVEL.verified;
  return 0;
};

const isEligibleOrg = (user = {}) => {
  const verifications = Array.isArray(user?.verifications) ? user.verifications : [];
  const badges = Array.isArray(user?.badges) ? user.badges : [];
  return includesAny(verifications, AFFILIATION_ELIGIBLE_BADGES) || includesAny(badges, AFFILIATION_ELIGIBLE_BADGES);
};

const getUserByAffiliationTarget = async (base44, affiliationUserId) => {
  if (!affiliationUserId) return null;
  if (affiliationUserId.includes('@')) {
    const users = await base44.asServiceRole.entities.User.filter({ email: affiliationUserId });
    return Array.isArray(users) && users.length > 0 ? users[0] : null;
  }
  return base44.asServiceRole.entities.User.get(affiliationUserId).catch(() => null);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    const body = await req.json();
    const { action, affiliationId, patch, affiliation } = body;

    if (!action) {
      return Response.json({ error: 'Missing action' }, { status: 400 });
    }

    if (action === 'create') {
      if (!affiliation) {
        return Response.json({ error: 'Missing affiliation payload' }, { status: 400 });
      }
      if (!affiliation.organizationId || !affiliation.userId) {
        return Response.json({ error: 'organizationId and userId are required' }, { status: 400 });
      }

      const organization = await base44.asServiceRole.entities.User.get(affiliation.organizationId).catch(() => null);
      if (!organization) {
        return Response.json({ error: 'Organization not found' }, { status: 404 });
      }
      if (currentUser?.id !== organization.id) {
        return Response.json({ error: 'Forbidden: Only the organization owner can create this affiliation' }, { status: 403 });
      }

      const createdAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.create(affiliation);
      if (affiliation.status === 'accepted' && isEligibleOrg(organization)) {
        let affiliateUser = await getUserByAffiliationTarget(base44, affiliation.userId);
        if (affiliateUser) {
          const currentLevel = getHighestBadgeLevel(affiliateUser);
          const sources = Array.isArray(affiliateUser.certified_affiliation_sources) ? affiliateUser.certified_affiliation_sources : [];
          const affiliationSourceId = affiliation.organizationId;
          if (currentLevel < AFFILIATION_BADGE_LEVEL.certified) {
            const verifications = Array.isArray(affiliateUser.verifications) ? affiliateUser.verifications : [];
            const newVerifications = buildPrimaryVerificationSet(verifications, true);
            const newSources = sources.includes(affiliationSourceId)
              ? sources
              : [...sources, affiliationSourceId];
            if (JSON.stringify(newVerifications) !== JSON.stringify(affiliateUser.verifications)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                verifications: newVerifications,
                certified_affiliation_sources: newSources,
              });
              affiliateUser = await base44.asServiceRole.entities.User.get(affiliateUser.id).catch(() => affiliateUser);
            }
          } else {
            const normalized = Array.isArray(affiliateUser.verifications) ? affiliateUser.verifications.map(canonicalVerification) : [];
            const newVerifications = buildPrimaryVerificationSet(normalized, false);
            const newSources = sources.includes(affiliationSourceId)
              ? sources
              : [...sources, affiliationSourceId];
            if (JSON.stringify(newVerifications) !== JSON.stringify(normalized)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                verifications: newVerifications,
                certified_affiliation_sources: newSources,
              });
              affiliateUser = await base44.asServiceRole.entities.User.get(affiliateUser.id).catch(() => affiliateUser);
            } else if (!sources.includes(affiliationSourceId)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                certified_affiliation_sources: newSources,
              });
            }
          }
        }
      }

      return Response.json({ affiliation: createdAffiliation });
    }

    if (!affiliationId) {
      return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
    }

    const existingAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.get(affiliationId).catch(() => null);
    if (!existingAffiliation) {
      return Response.json({ error: 'Affiliation not found' }, { status: 404 });
    }

    // ── Action "respond" : l'affilié lui-même accepte/refuse ou change la visibilité ──
    if (action === 'respond') {
      if (!patch) return Response.json({ error: 'Missing patch' }, { status: 400 });

      // Vérifier que c'est bien l'affilié qui agit
      const isTheAffiliate =
        currentUser?.id === existingAffiliation.userId ||
        currentUser?.email === existingAffiliation.userId ||
        currentUser?.email === existingAffiliation.userEmail;

      if (!isTheAffiliate) {
        return Response.json({ error: 'Forbidden: Only the affiliated user can respond to this invitation' }, { status: 403 });
      }

      // Champs autorisés pour l'affilié : status (accepted/rejected) et visibility
      const allowedPatch = {};
      if (patch.status === 'accepted' || patch.status === 'rejected') allowedPatch.status = patch.status;
      if (patch.visibility === 'public' || patch.visibility === 'private') allowedPatch.visibility = patch.visibility;

      if (Object.keys(allowedPatch).length === 0) {
        return Response.json({ error: 'No allowed fields to update' }, { status: 400 });
      }

      const updatedAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, allowedPatch);

      // Si l'affilié accepte et que l'organisation est éligible → sync badge certified
      if (allowedPatch.status === 'accepted') {
        const organization = await base44.asServiceRole.entities.User.get(existingAffiliation.organizationId).catch(() => null);
        if (organization && isEligibleOrg(organization)) {
          const affiliateUser = await getUserByAffiliationTarget(base44, existingAffiliation.userId);
          if (affiliateUser) {
            const currentLevel = getHighestBadgeLevel(affiliateUser);
            const sources = Array.isArray(affiliateUser.certified_affiliation_sources) ? affiliateUser.certified_affiliation_sources : [];
            const affiliationSourceId = existingAffiliation.organizationId;
            if (currentLevel < AFFILIATION_BADGE_LEVEL.certified) {
              const verifications = Array.isArray(affiliateUser.verifications) ? affiliateUser.verifications : [];
              const newVerifications = buildPrimaryVerificationSet(verifications, true);
              const newSources = sources.includes(affiliationSourceId) ? sources : [...sources, affiliationSourceId];
              if (JSON.stringify(newVerifications) !== JSON.stringify(affiliateUser.verifications)) {
                await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                  verifications: newVerifications,
                  certified_affiliation_sources: newSources,
                });
              } else if (!sources.includes(affiliationSourceId)) {
                await base44.asServiceRole.entities.User.update(affiliateUser.id, { certified_affiliation_sources: newSources });
              }
            } else if (!sources.includes(affiliationSourceId)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                certified_affiliation_sources: [...sources, affiliationSourceId],
              });
            }
          }
        }
      }

      return Response.json({ affiliation: updatedAffiliation });
    }

    // Pour update/delete : seul l'owner de l'organisation est autorisé
    const organization = await base44.asServiceRole.entities.User.get(existingAffiliation.organizationId).catch(() => null);
    if (!organization) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    if (currentUser?.id !== organization.id) {
      return Response.json({ error: 'Forbidden: Only the organization owner can manage this affiliation' }, { status: 403 });
    }

    // ── Action "requestRemoval" : l'org demande la suppression (avec raison) ──
    if (action === 'requestRemoval') {
      const reason = String(body.reason || '').trim();
      if (reason.length < 10) {
        return Response.json({ error: 'Une raison d\'au moins 10 caractères est requise' }, { status: 400 });
      }
      const updatedAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, {
        removalRequestStatus: 'pending',
        removalReason: reason,
        removalRequestedAt: new Date().toISOString(),
      });
      return Response.json({ affiliation: updatedAffiliation });
    }

    if (action === 'update') {
      if (!patch) {
        return Response.json({ error: 'Missing patch' }, { status: 400 });
      }

      const updatedAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, patch);
      if (patch.status === 'accepted' && isEligibleOrg(organization)) {
        const affiliateUser = await getUserByAffiliationTarget(base44, existingAffiliation.userId);
        if (affiliateUser) {
          const currentLevel = getHighestBadgeLevel(affiliateUser);
          const sources = Array.isArray(affiliateUser.certified_affiliation_sources) ? affiliateUser.certified_affiliation_sources : [];
          const affiliationSourceId = existingAffiliation.organizationId;
          if (currentLevel < AFFILIATION_BADGE_LEVEL.certified) {
            const verifications = Array.isArray(affiliateUser.verifications) ? affiliateUser.verifications : [];
            const newVerifications = buildPrimaryVerificationSet(verifications, true);
            const newSources = sources.includes(affiliationSourceId)
              ? sources
              : [...sources, affiliationSourceId];
            if (JSON.stringify(newVerifications) !== JSON.stringify(affiliateUser.verifications)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                verifications: newVerifications,
                certified_affiliation_sources: newSources,
              });
            } else if (!sources.includes(affiliationSourceId)) {
              await base44.asServiceRole.entities.User.update(affiliateUser.id, {
                certified_affiliation_sources: newSources,
              });
            }
          } else if (!sources.includes(affiliationSourceId)) {
            const newSources = [...sources, affiliationSourceId];
            await base44.asServiceRole.entities.User.update(affiliateUser.id, {
              certified_affiliation_sources: newSources,
            });
          }
        }
      }

      return Response.json({ affiliation: updatedAffiliation });
    }

    if (action === 'delete') {
      const affiliateUser = await getUserByAffiliationTarget(base44, existingAffiliation.userId);
      const deletedAffiliation = await base44.asServiceRole.entities.OrganizationAffiliation.delete(affiliationId);

      if (existingAffiliation.status === 'accepted' && affiliateUser && isEligibleOrg(organization)) {
        const otherAccepted = await base44.asServiceRole.entities.OrganizationAffiliation.filter(
          { userId: existingAffiliation.userId, status: 'accepted' },
          '-createdAt',
          100
        );
        const remainingAccepted = Array.isArray(otherAccepted)
          ? otherAccepted.filter((row) => row.id !== affiliationId)
          : [];

        const currentLevel = getHighestBadgeLevel(affiliateUser);
        const normalized = Array.isArray(affiliateUser.verifications) ? affiliateUser.verifications.map(normalize) : [];
        const hasVerified = normalized.includes('verified') || normalized.includes('vérifié') || normalized.includes('verifie') || normalized.includes('verif');

        if (remainingAccepted.length === 0 && currentLevel === AFFILIATION_BADGE_LEVEL.certified && normalized.includes('certified')) {
          const sources = Array.isArray(affiliateUser.certified_affiliation_sources) ? affiliateUser.certified_affiliation_sources : [];
          const affiliationSourceId = existingAffiliation.organizationId;
          const remainingSources = sources.filter((source) => source !== affiliationSourceId);
          const newVerifications = affiliateUser.verifications.filter((value) => normalize(value) !== 'certified' && normalize(value) !== 'certifié');

          if (remainingSources.length === 0) {
            await base44.asServiceRole.entities.User.update(affiliateUser.id, {
              verifications: newVerifications,
              certified_affiliation_sources: remainingSources,
            });
          } else {
            await base44.asServiceRole.entities.User.update(affiliateUser.id, {
              certified_affiliation_sources: remainingSources,
            });
          }
        }
      }

      return Response.json({ affiliation: deletedAffiliation });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});