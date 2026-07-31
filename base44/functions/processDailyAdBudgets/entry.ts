import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

// Tâche planifiée quotidienne : déduit le budget journalier (daily_budget) de chaque
// campagne active. Quand credits_remaining devient insuffisant (< daily_budget),
// la campagne est mise en pause automatiquement et le propriétaire est notifié
// par email + notification in-app pour l'inviter à recharger.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Récupérer toutes les campagnes actives
    const active = await base44.asServiceRole.entities.AdCampaign.filter(
      { status: 'active' },
      '-created_date',
      500
    );

    if (!active || active.length === 0) {
      return Response.json({ success: true, processed: 0, paused: 0 });
    }

    let processed = 0;
    let paused = 0;
    const pauses = [];

    for (const campaign of active) {
      const daily = Number(campaign.daily_budget) || 0;
      const remaining = Number(campaign.credits_remaining) || 0;

      // Vérifier les dates de validité
      const now = new Date();
      if (campaign.starts_at && new Date(campaign.starts_at) > now) continue;
      if (campaign.ends_at && new Date(campaign.ends_at) < now) {
        // Campaign ended — mark as ended
        await base44.asServiceRole.entities.AdCampaign.update(campaign.id, { status: 'ended' });
        processed++;
        continue;
      }

      if (daily <= 0) {
        // Pas de budget journalier défini — on ne déduit rien
        continue;
      }

      if (remaining < daily) {
        // Pas assez de crédits pour la journée → mise en pause auto
        await base44.asServiceRole.entities.AdCampaign.update(campaign.id, {
          status: 'paused',
          auto_paused_reason: 'credits_insufficient',
          credits_remaining: Math.max(0, remaining),
        });
        paused++;
        pauses.push({ campaign, remaining });

        // Récupérer le propriétaire pour notification
        try {
          const owner = await base44.asServiceRole.entities.User.get(campaign.owner_id);
          if (owner) {
            // Notification in-app
            waitUntil(
              base44.asServiceRole.entities.Notification.create({
                user_email: owner.email,
                type: 'system',
                title: '⏸️ Campagne mise en pause — crédits épuisés',
                content: `Votre campagne "${campaign.title}" a été mise en pause automatiquement. Solde restant : ${remaining} crédits (budget journalier : ${daily}). Rechargez votre campagne pour la remettre en ligne.`,
                sender_name: 'Eza Ads',
              }).catch(() => {})
            );
            // Email
            waitUntil(
              sendEzaEmail(base44, {
                to: owner.email,
                title: 'Campagne en pause — rechargez vos crédits',
                subject: '⏸️ Votre campagne Eza Ads a été mise en pause',
                body: `Bonjour **${owner.display_name || owner.username}**,\n\nVotre campagne publicitaire **${campaign.title}** a été **mise en pause automatiquement** car son solde de crédits est insuffisant.\n\n- **Crédits restants :** ${remaining}\n- **Budget journalier requis :** ${daily} crédits/jour\n\nPour relancer votre diffusion, rechargez votre campagne depuis votre espace business.\n\n— L'équipe eza`,
                tagline: 'Eza Ads',
              }).catch(() => {})
            );
          }
        } catch {}
      } else {
        // Déduire le budget journalier
        const newRemaining = remaining - daily;
        await base44.asServiceRole.entities.AdCampaign.update(campaign.id, {
          credits_remaining: newRemaining,
        });
      }
      processed++;
    }

    return Response.json({ success: true, processed, paused, pauses: pauses.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}