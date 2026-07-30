import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

const ADMIN_ROLES = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role)) {
      return Response.json({ error: 'Accès refusé — admin requis' }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const { redemptionId, action, adminNotes, refundCredits, redemptionIds } = body || {};

    // Bulk actions
    if (action === 'bulk_fulfill' && Array.isArray(redemptionIds)) {
      const results = [];
      for (const id of redemptionIds) {
        try {
          const r = await base44.asServiceRole.entities.RewardRedemption.get(id);
          if (!r || r.status !== 'pending') continue;
          await base44.asServiceRole.entities.RewardRedemption.update(id, {
            status: 'fulfilled',
            applied_at: new Date().toISOString(),
            admin_notes: adminNotes || 'Honorée (action groupée)',
          });
          waitUntil(
            base44.integrations.Core.SendEmail({
              to: r.user_email,
              subject: '✅ Votre récompense a été honorée',
              body: `Bonjour ${r.user_name},\n\nVotre récompense « ${r.item_label} » a été honorée par notre équipe.\n\n— L'équipe Eza`,
            }).catch(() => {})
          );
          results.push(id);
        } catch {}
      }
      return Response.json({ success: true, count: results.length, message: `${results.length} récompense(s) honorée(s)` });
    }

    if (action === 'bulk_reject' && Array.isArray(redemptionIds)) {
      const results = [];
      for (const id of redemptionIds) {
        try {
          const r = await base44.asServiceRole.entities.RewardRedemption.get(id);
          if (!r || r.status !== 'pending') continue;
          await base44.asServiceRole.entities.RewardRedemption.update(id, {
            status: 'rejected',
            admin_notes: adminNotes || 'Refusée (action groupée)',
          });
          // Refund
          if (refundCredits !== false && r.user_id) {
            try {
              const tu = await base44.asServiceRole.entities.User.get(r.user_id);
              if (tu) {
                const nc = (tu.referral_credits || 0) + (r.cost || 0);
                await base44.asServiceRole.entities.User.update(tu.id, { referral_credits: nc });
              }
            } catch {}
          }
          waitUntil(
            base44.integrations.Core.SendEmail({
              to: r.user_email,
              subject: '❌ Récompense refusée',
              body: `Bonjour ${r.user_name},\n\nVotre demande « ${r.item_label} » n'a pas pu être honorée.${refundCredits !== false ? ` Vos ${r.cost} crédits ont été remboursés.` : ''}\n\n— L'équipe Eza`,
            }).catch(() => {})
          );
          results.push(id);
        } catch {}
      }
      return Response.json({ success: true, count: results.length, message: `${results.length} récompense(s) refusée(s) et remboursées` });
    }

    // Single actions
    if (!redemptionId || !action) return Response.json({ error: 'Paramètres manquants' }, { status: 400 });

    const redemption = await base44.asServiceRole.entities.RewardRedemption.get(redemptionId);
    if (!redemption) return Response.json({ error: 'Réclamation introuvable' }, { status: 404 });

    if (action === 'fulfill') {
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        status: 'fulfilled',
        applied_at: new Date().toISOString(),
        admin_notes: adminNotes ?? redemption.admin_notes ?? '',
      });
      waitUntil(
        base44.integrations.Core.SendEmail({
          to: redemption.user_email,
          subject: '✅ Votre récompense a été honorée',
          body: `Bonjour ${redemption.user_name},\n\nVotre récompense « ${redemption.item_label} » a été honorée par notre équipe.${adminNotes ? `\n\nNote : ${adminNotes}` : ''}\n\n— L'équipe Eza`,
        }).catch(() => {})
      );
      return Response.json({ success: true, message: 'Récompense honorée — email envoyé' });

    } else if (action === 'reject') {
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        status: 'rejected',
        admin_notes: adminNotes || 'Refusée par l\'administration',
      });
      if (refundCredits !== false && redemption.user_id) {
        try {
          const tu = await base44.asServiceRole.entities.User.get(redemption.user_id);
          if (tu) {
            const nc = (tu.referral_credits || 0) + (redemption.cost || 0);
            await base44.asServiceRole.entities.User.update(tu.id, { referral_credits: nc });
          }
        } catch {}
      }
      waitUntil(
        base44.integrations.Core.SendEmail({
          to: redemption.user_email,
          subject: '❌ Récompense refusée',
          body: `Bonjour ${redemption.user_name},\n\nVotre demande « ${redemption.item_label} » n'a pas pu être honorée.${refundCredits !== false ? ` Vos ${redemption.cost} crédits ont été remboursés.` : ''}${adminNotes ? `\n\nRaison : ${adminNotes}` : ''}\n\n— L'équipe Eza`,
        }).catch(() => {})
      );
      return Response.json({ success: true, message: refundCredits !== false ? 'Refusée + crédits remboursés + email envoyé' : 'Refusée + email envoyé' });

    } else if (action === 'refund') {
      if (redemption.user_id) {
        try {
          const tu = await base44.asServiceRole.entities.User.get(redemption.user_id);
          if (tu) {
            const nc = (tu.referral_credits || 0) + (redemption.cost || 0);
            await base44.asServiceRole.entities.User.update(tu.id, { referral_credits: nc });
          }
        } catch {}
      }
      return Response.json({ success: true, message: `${redemption.cost} crédits remboursés à ${redemption.user_name}` });

    } else if (action === 'note') {
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        admin_notes: adminNotes || '',
      });
      return Response.json({ success: true, message: 'Note enregistrée' });

    } else if (action === 'reset') {
      // Reset to pending (reopen)
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        status: 'pending',
        applied_at: null,
        admin_notes: adminNotes || '',
      });
      return Response.json({ success: true, message: 'Récompense rouverte (pending)' });

    } else {
      return Response.json({ error: 'Action inconnue' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}