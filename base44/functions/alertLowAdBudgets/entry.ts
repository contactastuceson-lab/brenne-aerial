import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne : alerte les annonceurs dont la campagne pub active
// arrive bientôt à court de crédits (≈ 3 jours de budget restant OU ≤ 80% du budget
// initial consommé). Email + notification in-app pour inviter à recharger.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const active = await base44.asServiceRole.entities.AdCampaign.filter(
      { status: 'active' },
      '-created_date',
      500
    ).catch(() => []);

    if (!active || !active.length) {
      await logAutomation(base44, { automation_name: 'alert_low_ad_budgets', label: 'Alerte budget pub faible', category: 'ads', status: 'success', summary: 'Aucune campagne active', count: 0 });
      return Response.json({ ok: true, processed: 0, alerted: 0 });
    }

    let alerted = 0;
    for (const c of active) {
      const daily = Number(c.daily_budget) || 0;
      const remaining = Number(c.credits_remaining) || 0;
      const budget = Number(c.budget_credits) || 0;
      if (daily <= 0 || remaining <= 0) continue;

      const low = remaining <= daily * 3 || (budget > 0 && remaining <= budget * 0.8);
      if (!low) continue;

      try {
        const owner = await base44.asServiceRole.entities.User.get(c.owner_id).catch(() => null);
        if (!owner || !owner.email) continue;

        await sendEzaEmail(base44, {
          to: owner.email,
          subject: '⚠️ Votre campagne Eza Ads arrive bientôt à court de crédits',
          title: 'Budget pub faible',
          body: `Bonjour **${owner.display_name || owner.username || ''}**,\n\nVotre campagne **${c.title}** n'a plus beaucoup de crédits :\n\n- **Crédits restants :** ${remaining}\n- **Budget journalier :** ${daily} crédits/jour\n\nPensez à recharger votre campagne pour éviter une mise en pause automatique.\n\n— L'équipe eza`,
          tagline: 'Eza Ads',
        }).catch(() => {});

        await base44.asServiceRole.entities.Notification.create({
          user_email: owner.email,
          type: 'system',
          title: '⚠️ Budget pub faible',
          content: `La campagne "${c.title}" ne dispose plus que de ${remaining} crédits.`,
          sender_name: 'Eza Ads',
        }).catch(() => {});

        alerted++;
      } catch {}
    }

    await logAutomation(base44, {
      automation_name: 'alert_low_ad_budgets', label: 'Alerte budget pub faible', category: 'ads',
      status: alerted > 0 ? 'warning' : 'success',
      summary: alerted > 0 ? `${alerted} campagne(s) alertées (budget faible)` : 'Aucune campagne à risque',
      count: alerted,
    });

    return Response.json({ ok: true, processed: active.length, alerted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}