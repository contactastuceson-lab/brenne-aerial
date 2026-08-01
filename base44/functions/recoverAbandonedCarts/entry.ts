import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

// Récupération des paniers abandonnés : paniers 'active' non modifiés
// depuis > 24h, sans notification de récupération déjà envoyée.
// Envoie un email + une notification in-app au propriétaire, marque
// recovery_notified=true et status='abandoned'. (Pas de web push ici
// pour rester fiable en contexte planifié.)

const HOURS = 24;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const carts = await base44.asServiceRole.entities.Cart.filter({ status: 'active' }).catch(() => []);
    const cutoff = Date.now() - HOURS * 3600 * 1000;
    let notified = 0;

    for (const c of (carts || [])) {
      const updated = c.updated_date
        ? new Date(c.updated_date).getTime()
        : c.created_date ? new Date(c.created_date).getTime() : 0;
      if (updated === 0 || updated > cutoff) continue;
      if (c.recovery_notified) continue;

      const items = Array.isArray(c.items) ? c.items : [];
      const total = items.reduce((s, it) => s + (Number(it.price_credits) || 0) * (Number(it.qty) || 1), 0);
      const labels = items.map((it) => `• ${it.label} (${(Number(it.price_credits) || 0)} cr)`).join('\n');

      waitUntil((async () => {
        try {
          if (c.owner_email) {
            await sendEzaEmail(base44, {
              to: c.owner_email,
              subject: '🛒 Vous avez oublié votre panier sur eza',
              title: 'Votre panier vous attend',
              body: `Bonjour,\n\nVotre panier n'a pas été finalisé :\n\n${labels}\n\nTotal : **${total} crédits**.\n\nReprenez votre commande quand vous voulez sur eza.\n\n— L'équipe eza`,
              tagline: 'eza',
            }).catch(() => {});
            await base44.asServiceRole.entities.Notification.create({
              user_email: c.owner_email,
              type: 'system',
              title: '🛒 Votre panier vous attend',
              content: `${items.length} article(s) — ${total} crédits. Reprenez votre commande.`,
              link: '/panier',
              sender_name: 'eza',
            }).catch(() => {});
          }
        } catch {}
      })());

      await base44.asServiceRole.entities.Cart.update(c.id, {
        recovery_notified: true, status: 'abandoned',
      }).catch(() => {});
      notified++;
    }

    return Response.json({ ok: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}