import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { REWARD_EFFECTS, reverseRewardEffect } from '../../shared/rewardEffects.ts';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

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

    // ── Bulk actions ──
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
            sendEzaEmail(base44, {
              to: r.user_email,
              title: 'Récompense honorée',
              subject: '✅ Votre récompense Eza a été honorée',
              body: `Bonjour **${r.user_name}**,\n\nVotre récompense **${r.item_label}** a été honorée par notre équipe.\n\nElle est désormais active sur votre compte.\n\n— L'équipe eza`,
              tagline: 'Boutique & Récompenses',
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
          // Reverse effects
          if (r.item_id) waitUntil(reverseRewardEffect(base44, r.user_id, r.item_id).catch(() => {}));
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
            sendEzaEmail(base44, {
              to: r.user_email,
              title: 'Récompense refusée',
              subject: '❌ Récompense Eza refusée',
              body: `Bonjour **${r.user_name}**,\n\nVotre demande **${r.item_label}** n'a pas pu être honorée.${refundCredits !== false ? `\n\nVos **${r.cost} crédits** ont été remboursés sur votre compte.` : ''}\n\nSi vous avez des questions, contactez notre équipe.\n\n— L'équipe eza`,
              tagline: 'Boutique & Récompenses',
            }).catch(() => {})
          );
          results.push(id);
        } catch {}
      }
      return Response.json({ success: true, count: results.length, message: `${results.length} refusée(s) + effets retirés + crédits remboursés` });
    }

    // ── Single actions ──
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
        sendEzaEmail(base44, {
          to: redemption.user_email,
          title: 'Récompense honorée',
          subject: '✅ Votre récompense Eza a été honorée',
          body: `Bonjour **${redemption.user_name}**,\n\nVotre récompense **${redemption.item_label}** a été honorée par notre équipe.\n\nElle est désormais pleinement active sur votre compte.${adminNotes ? `\n\n**Note de l'équipe :** ${adminNotes}` : ''}\n\n- **Récompense :** ${redemption.item_label}\n- **Coût :** ${redemption.cost} crédits\n\nMerci de votre confiance,\n— L'équipe eza`,
          tagline: 'Boutique & Récompenses',
        }).catch(() => {})
      );
      return Response.json({ success: true, message: 'Récompense honorée — email envoyé' });

    } else if (action === 'reject') {
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        status: 'rejected',
        admin_notes: adminNotes || 'Refusée par l\'administration',
      });
      // Reverse the reward effects (badges, perks, tokens)
      let reversalInfo = '';
      if (redemption.item_id) {
        try {
          const rev = await reverseRewardEffect(base44, redemption.user_id, redemption.item_id);
          reversalInfo = rev.details;
        } catch (e) {
          reversalInfo = 'Erreur reversal: ' + (e?.message || 'unknown');
        }
      }
      // Refund credits
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
        sendEzaEmail(base44, {
          to: redemption.user_email,
          title: 'Récompense refusée',
          subject: '❌ Récompense Eza refusée',
          body: `Bonjour **${redemption.user_name}**,\n\nVotre demande de récompense **${redemption.item_label}** n'a pas pu être honorée par notre équipe.\n\n${
            refundCredits !== false ? `- **Crédits :** Vos **${redemption.cost} crédits** ont été remboursés.\n` : ''
          }- **Effets :** Les avantages éventuellement accordés ont été retirés de votre compte.\n${adminNotes ? `\n**Raison :** ${adminNotes}\n` : ''}\nSi vous pensez qu'il s'agit d'une erreur, contactez notre équipe.\n\n— L'équipe eza`,
          tagline: 'Boutique & Récompenses',
        }).catch(() => {})
      );
      return Response.json({
        success: true,
        message: `Refusée${refundCredits !== false ? ' + crédits remboursés' : ''} + effets retirés (${reversalInfo})`,
        reversal: reversalInfo,
      });

    } else if (action === 'revoke') {
      // Revoke without changing status — just reverse effects + refund
      let reversalInfo = '';
      if (redemption.item_id) {
        try {
          const rev = await reverseRewardEffect(base44, redemption.user_id, redemption.item_id);
          reversalInfo = rev.details;
        } catch (e) {
          reversalInfo = 'Erreur: ' + (e?.message || 'unknown');
        }
      }
      if (refundCredits !== false && redemption.user_id) {
        try {
          const tu = await base44.asServiceRole.entities.User.get(redemption.user_id);
          if (tu) {
            const nc = (tu.referral_credits || 0) + (redemption.cost || 0);
            await base44.asServiceRole.entities.User.update(tu.id, { referral_credits: nc });
          }
        } catch {}
      }
      await base44.asServiceRole.entities.RewardRedemption.update(redemptionId, {
        status: 'rejected',
        admin_notes: (adminNotes || 'Révoquée par l\'admin') + (reversalInfo ? ` | ${reversalInfo}` : ''),
      });
      waitUntil(
        sendEzaEmail(base44, {
          to: redemption.user_email,
          title: 'Récompense révoquée',
          subject: '⚠️ Récompense révoquée sur Eza',
          body: `Bonjour **${redemption.user_name}**,\n\nVotre récompense **${redemption.item_label}** a été **révoquée** par l'administration.\n\n- **Effets retirés :** ${reversalInfo || 'aucun effet actif'}\n- **Crédits :** ${refundCredits !== false ? `${redemption.cost} crédits remboursés` : 'non remboursés'}\n${adminNotes ? `\n**Note :** ${adminNotes}\n` : ''}\nPour toute question, contactez notre équipe.\n\n— L'équipe eza`,
          tagline: 'Boutique & Récompenses',
        }).catch(() => {})
      );
      return Response.json({ success: true, message: `Révoquée — ${reversalInfo}`, reversal: reversalInfo });

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