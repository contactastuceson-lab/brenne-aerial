import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PDG_EMAILS = ['thecommitteescp@gmail.com'];
const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];
const ADMIN_ROLES = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const isTopLevel = PDG_EMAILS.includes(user?.email) || PDG_ADJOINT_EMAILS.includes(user?.email) || ADMIN_ROLES.includes(user?.role);
    if (!user || !isTopLevel) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, affiliationId, patch, affiliation } = body;

    // ── LIST : renvoie toutes les affiliations enrichies (bypass RLS) ──
    if (!action || action === 'list') {
      const [affiliations, users] = await Promise.all([
        base44.asServiceRole.entities.OrganizationAffiliation.list('-created_date', 500),
        base44.asServiceRole.entities.User.list(),
      ]);
      const userMap = {};
      for (const u of users || []) {
        userMap[u.id] = u;
        if (u.email) userMap[u.email] = u;
      }
      const enriched = (affiliations || []).map((a) => {
        const org = userMap[a.organizationId];
        const aff = userMap[a.userId];
        return {
          ...a,
          organizationNameResolved: org?.display_name || org?.full_name || a.organizationName || 'Organisation supprimée',
          organizationAvatarResolved: org?.avatar_url || a.organizationAvatarUrl || '',
          organizationEmail: org?.email || '',
          affiliateName: aff?.display_name || aff?.full_name || 'Utilisateur supprimé',
          affiliateEmail: aff?.email || (typeof a.userId === 'string' && a.userId.includes('@') ? a.userId : ''),
          affiliateAvatar: aff?.avatar_url || '',
        };
      });
      return Response.json({ affiliations: enriched });
    }

    // ── CREATE ──
    if (action === 'create') {
      if (!affiliation?.organizationId || !affiliation?.userId) {
        return Response.json({ error: 'organizationId and userId are required' }, { status: 400 });
      }
      const created = await base44.asServiceRole.entities.OrganizationAffiliation.create(affiliation);
      return Response.json({ affiliation: created });
    }

    // ── UPDATE ──
    if (action === 'update') {
      if (!affiliationId || !patch) {
        return Response.json({ error: 'Missing affiliationId or patch' }, { status: 400 });
      }
      const updated = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, patch);
      return Response.json({ affiliation: updated });
    }

    // ── DELETE ──
    if (action === 'delete') {
      if (!affiliationId) {
        return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
      }
      await base44.asServiceRole.entities.OrganizationAffiliation.delete(affiliationId);
      return Response.json({ ok: true });
    }

    // ── APPROVE REMOVAL REQUEST ──
    if (action === 'approveRemoval') {
      if (!affiliationId) return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
      const now = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, {
        status: 'removed',
        removalRequestStatus: 'approved',
        removedAt: now,
        removalDecidedAt: now,
        removalDecidedBy: user?.id || user?.email || 'admin',
      });
      return Response.json({ affiliation: updated });
    }

    // ── REJECT REMOVAL REQUEST ──
    if (action === 'rejectRemoval') {
      if (!affiliationId) return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, {
        removalRequestStatus: 'rejected',
        removalDecidedAt: new Date().toISOString(),
        removalDecidedBy: user?.id || user?.email || 'admin',
      });
      return Response.json({ affiliation: updated });
    }

    // ── DIRECT REMOVAL (admin, with reason) ──
    if (action === 'removeDirect') {
      if (!affiliationId) return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
      const reason = String(body.reason || '').trim();
      const now = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, {
        status: 'removed',
        removalReason: reason,
        removalRequestStatus: 'approved',
        removedAt: now,
        removalDecidedAt: now,
        removalDecidedBy: user?.id || user?.email || 'admin',
      });
      return Response.json({ affiliation: updated });
    }

    // ── REMOVE ALL FOR USER (toutes les affiliations d'un utilisateur) ──
    if (action === 'removeAllForUser') {
      const targetUserId = body.userId;
      if (!targetUserId) return Response.json({ error: 'Missing userId' }, { status: 400 });
      const mode = body.mode === 'delete' ? 'delete' : 'remove';
      const actor = user?.id || user?.email || 'admin';
      if (mode === 'remove') {
        const now = new Date().toISOString();
        await base44.asServiceRole.entities.OrganizationAffiliation.updateMany(
          { userId: targetUserId },
          { $set: { status: 'removed', removedAt: now, removalDecidedAt: now, removalDecidedBy: actor, removalRequestStatus: 'approved' } }
        );
        return Response.json({ ok: true, mode: 'remove' });
      }
      await base44.asServiceRole.entities.OrganizationAffiliation.deleteMany({ userId: targetUserId });
      return Response.json({ ok: true, mode: 'delete' });
    }

    // ── CLEAR REMOVAL (retirer la mention de suppression) ──
    if (action === 'clearRemoval') {
      if (!affiliationId) return Response.json({ error: 'Missing affiliationId' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.OrganizationAffiliation.update(affiliationId, {
        status: 'accepted',
        removalRequestStatus: 'none',
        removalReason: '',
        removalRequestedAt: null,
        removedAt: null,
        removalDecidedAt: null,
        removalDecidedBy: '',
      });
      return Response.json({ affiliation: updated });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});