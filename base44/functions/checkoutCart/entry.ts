import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { REWARD_EFFECTS } from '../../shared/rewardEffects.ts';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { sendEventEmail, getOrganizerEmails } from '../../shared/eventEmails.ts';

// Validation d'un panier : débite le total une fois, inscrit aux événements,
// applique les récompenses (réplique de registerForEvent + redeemReferralReward),
// marque le panier checked_out, envoie un email récap.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: 'Non connecté' }, { status: 401 });
    if (user.bank_frozen)
      return Response.json({ ok: false, error: 'Compte bancaire gelé — paiement impossible' }, { status: 403 });

    const carts = await base44.entities.Cart.filter({ owner_id: user.id, status: 'active' });
    const cart = (carts || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0)
      return Response.json({ ok: false, error: 'Panier vide' }, { status: 400 });

    const items = cart.items;
    const total = items.reduce((s, it) => s + (Number(it.price_credits) || 0) * (Number(it.qty) || 1), 0);
    const balance = Number(user.referral_credits || 0);
    if (total > balance)
      return Response.json({ ok: false, error: `Crédits insuffisants (${balance}/${total})` }, { status: 400 });

    const eventItems = items.filter((it) => it.kind === 'event');
    const rewardItems = items.filter((it) => it.kind === 'reward');

    // Pré-vérifications événements
    for (const it of eventItems) {
      const ev = await base44.asServiceRole.entities.Event.get(it.ref_id);
      if (!ev) return Response.json({ ok: false, error: `Événement introuvable : ${it.label}` }, { status: 400 });
      if (ev.status === 'cancelled') return Response.json({ ok: false, error: `Événement annulé : ${it.label}` }, { status: 400 });
      const end = ev.end_date ? new Date(ev.end_date).getTime() : 0;
      if (end && end < Date.now()) return Response.json({ ok: false, error: `Événement terminé : ${it.label}` }, { status: 400 });
      if (ev.capacity > 0 && (ev.attendees_count || 0) >= ev.capacity)
        return Response.json({ ok: false, error: `Complet : ${it.label}` }, { status: 400 });
      const existing = await base44.asServiceRole.entities.EventRegistration.filter(
        { event_id: it.ref_id, user_id: user.id, status: 'registered' }
      );
      if (existing && existing.length > 0)
        return Response.json({ ok: false, error: `Déjà inscrit : ${it.label}` }, { status: 400 });
    }

    // Pré-vérifications récompenses
    for (const it of rewardItems) {
      const eff = REWARD_EFFECTS[it.ref_id];
      if (!eff) return Response.json({ ok: false, error: `Récompense inconnue : ${it.label}` }, { status: 400 });
      if (eff.type === 'auto' && eff.apply?.verifications && user.badges_eligible === false)
        return Response.json({ ok: false, error: `Profil non éligible aux badges : ${it.label}` }, { status: 403 });
    }

    // Débiter le total
    const newBalance = balance - total;
    await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newBalance });
    if (total > 0) {
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: user.id, type: 'boutique_spend', amount: -total,
        note: `Checkout panier (${items.length} article(s))`, status: 'completed',
      });
    }

    const results = { events: 0, rewards: 0 };

    // ── Événements ──
    for (const it of eventItems) {
      const ev = await base44.asServiceRole.entities.Event.get(it.ref_id);
      const reg = await base44.entities.EventRegistration.create({
        event_id: it.ref_id,
        event_title: ev.title || it.label,
        event_image_url: ev.image_url || '',
        event_start_date: ev.start_date || '',
        event_city: ev.city || '',
        user_id: user.id,
        user_email: user.email || '',
        user_name: user.full_name || '',
        user_username: user.username || '',
        credits_paid: Number(it.price_credits) || 0,
        status: 'registered',
        registered_at: new Date().toISOString(),
      });
      await base44.asServiceRole.entities.Event.update(it.ref_id, {
        registered_ids: [...(ev.registered_ids || []), user.id],
        attendees_count: (ev.attendees_count || 0) + 1,
      });
      try {
        const shortCode = (reg.id || '').replace(/-/g, '').slice(0, 8).toUpperCase();
        await base44.asServiceRole.entities.EventRegistration.update(reg.id, { ticket_code: `EZA-${shortCode}` });
      } catch {}
      results.events++;
      const evCtx = {
        event_id: it.ref_id, event_title: ev.title || '', event_date: ev.start_date || '',
        event_city: ev.city || '', event_format: ev.format, credits: Number(it.price_credits) || 0,
      };
      waitUntil((async () => {
        try {
          await sendEventEmail(base44, 'registration_confirmed', evCtx, user.email);
          const orgEmails = await getOrganizerEmails(base44, ev);
          if (orgEmails.length)
            await sendEventEmail(base44, 'new_registration',
              { ...evCtx, user_name: user.full_name || '', user_email: user.email || '' }, orgEmails);
        } catch {}
      })());
    }

    // ── Récompenses (crédits déjà débités globalement) ──
    const now = new Date();
    const isoNow = now.toISOString();
    for (const it of rewardItems) {
      const eff = REWARD_EFFECTS[it.ref_id];
      let redemptionStatus = 'pending';
      let tokenType = null, tokenCount = 0, appliedAt = null;

      if (eff.type === 'auto') {
        // recharger le user frais pour perks/verifs à jour
        const fresh = await base44.asServiceRole.entities.User.filter({ email: user.email });
        const u0 = (fresh && fresh[0]) || user;
        const perks = { ...(u0.perks || {}) };
        const verifs = [...(u0.verifications || [])];
        let verifsChanged = false, setVerifiedStatus = false;
        if (eff.apply?.verifications) {
          for (const v of eff.apply.verifications) { if (!verifs.includes(v)) { verifs.push(v); verifsChanged = true; } }
          if (eff.apply.verifications.includes('verified')) setVerifiedStatus = true;
        }
        if (eff.apply?.perks) {
          for (const [key, days] of Object.entries(eff.apply.perks)) {
            if (days === null) perks[key] = true;
            else if (typeof days === 'number') {
              const existing = perks[key];
              let baseDate = (existing && new Date(existing) > now) ? new Date(existing) : new Date(now);
              baseDate.setDate(baseDate.getDate() + days);
              perks[key] = baseDate.toISOString();
            }
          }
        }
        const updateData = { perks };
        if (verifsChanged) updateData.verifications = verifs;
        if (setVerifiedStatus) updateData.verified_status = 'yes';
        await base44.asServiceRole.entities.User.update(u0.id, updateData);
        redemptionStatus = 'fulfilled'; appliedAt = isoNow;
      } else if (eff.type === 'token') {
        const fresh = await base44.asServiceRole.entities.User.filter({ email: user.email });
        const u0 = (fresh && fresh[0]) || user;
        const perks = { ...(u0.perks || {}) };
        const tokens = { ...(perks.tokens || {}) };
        tokens[eff.token.key] = (tokens[eff.token.key] || 0) + eff.token.count;
        perks.tokens = tokens;
        await base44.asServiceRole.entities.User.update(u0.id, { perks });
        redemptionStatus = 'fulfilled'; tokenType = eff.token.key; tokenCount = eff.token.count; appliedAt = isoNow;
      }

      await base44.entities.RewardRedemption.create({
        user_email: user.email, user_id: user.id,
        user_name: user.display_name || user.full_name || user.username,
        item_id: it.ref_id, item_label: it.label, item_category: it.category || 'autre',
        cost: Number(it.price_credits) || 0,
        fulfillment_type: eff.type, token_type: tokenType, token_count: tokenCount,
        status: redemptionStatus, applied_at: appliedAt,
      });
      results.rewards++;
    }

    await base44.asServiceRole.entities.Cart.update(cart.id, {
      status: 'checked_out', total_credits: total, checked_out_at: isoNow,
    });

    waitUntil(sendEzaEmail(base44, {
      to: user.email,
      subject: '🛒 Panier validé sur eza',
      title: 'Panier validé',
      body: `Bonjour **${user.display_name || user.username}**,\n\nVotre panier a été validé : **${results.events}** inscription(s) et **${results.rewards}** récompense(s) pour **${total} crédits**.\n\nCrédits restants : ${newBalance}.\n\n— L'équipe eza`,
      tagline: 'eza',
    }).catch(() => {}));

    return Response.json({ ok: true, ...results, new_balance: newBalance, total });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}