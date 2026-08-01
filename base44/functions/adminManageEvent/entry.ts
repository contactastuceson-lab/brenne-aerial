import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEventEmail, getAdminEmails } from '../../shared/eventEmails.ts';

const ADMIN_ROLES = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'];

async function refundReg(base44, reg, note, adminEmail) {
  if (reg.credits_paid > 0) {
    const u = await base44.asServiceRole.entities.User.get(reg.user_id);
    const bal = Number(u?.referral_credits || 0);
    await base44.asServiceRole.entities.User.update(reg.user_id, {
      referral_credits: bal + reg.credits_paid,
    });
    await base44.asServiceRole.entities.CreditTransaction.create({
      owner_id: reg.user_id, type: 'reward', amount: reg.credits_paid,
      note: `Remboursement inscription : ${reg.event_title || ''}`, status: 'completed',
    });
  }
  await base44.asServiceRole.entities.EventRegistration.update(reg.id, {
    status: 'refunded',
    cancelled_at: new Date().toISOString(),
    refund_note: note || '',
    refunded_by: adminEmail || '',
  });
  const ev = await base44.asServiceRole.entities.Event.get(reg.event_id);
  if (ev) {
    const newIds = (ev.registered_ids || []).filter((id) => id !== reg.user_id);
    await base44.asServiceRole.entities.Event.update(reg.event_id, {
      registered_ids: newIds,
      attendees_count: Math.max(0, (ev.attendees_count || 0) - 1),
    });
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role))
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action } = body || {};
    const adminEmail = user.email || '';

    // ── Approuver une demande d'annulation (rembourse + notifie) ──
    if (action === 'approve_cancellation') {
      const { registration_id, note } = body;
      if (!registration_id) return Response.json({ error: 'registration_id requis' }, { status: 400 });
      const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
      if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
      if (reg.cancel_request_status !== 'pending')
        return Response.json({ error: 'Aucune demande en attente' }, { status: 400 });
      await refundReg(base44, reg, note || 'Demande d\'annulation approuvée', adminEmail);
      await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
        cancel_request_status: 'approved',
        cancel_decision_note: note || '',
        cancel_decided_at: new Date().toISOString(),
        cancel_decided_by: adminEmail,
      });
      try {
        await sendEventEmail(base44, 'cancellation_approved', {
          event_id: reg.event_id, event_title: reg.event_title || '',
          event_date: reg.event_start_date || '', event_city: reg.event_city || '',
          refund_amount: reg.credits_paid || 0, note: note || '',
        }, reg.user_email);
      } catch {}
      return Response.json({ ok: true, refunded: reg.credits_paid || 0 });
    }

    // ── Rejeter une demande d'annulation (garde inscrit + notifie) ──
    if (action === 'reject_cancellation') {
      const { registration_id, note } = body;
      if (!registration_id) return Response.json({ error: 'registration_id requis' }, { status: 400 });
      const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
      if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
      if (reg.cancel_request_status !== 'pending')
        return Response.json({ error: 'Aucune demande en attente' }, { status: 400 });
      await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
        cancel_request_status: 'rejected',
        cancel_request_reason: reg.cancel_request_reason || '',
        cancel_decision_note: note || '',
        cancel_decided_at: new Date().toISOString(),
        cancel_decided_by: adminEmail,
      });
      try {
        await sendEventEmail(base44, 'cancellation_rejected', {
          event_id: reg.event_id, event_title: reg.event_title || '',
          event_date: reg.event_start_date || '', event_city: reg.event_city || '',
          note: note || '',
        }, reg.user_email);
      } catch {}
      return Response.json({ ok: true });
    }

    // ── Rembourser une inscription (admin direct) ──
    if (action === 'refund_registration') {
      const { registration_id, note } = body;
      if (!registration_id) return Response.json({ error: 'registration_id requis' }, { status: 400 });
      const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
      if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
      if (reg.status === 'refunded') return Response.json({ error: 'Inscription déjà remboursée' }, { status: 400 });
      await refundReg(base44, reg, note || '', adminEmail);
      try {
        await sendEventEmail(base44, 'admin_refund', {
          event_id: reg.event_id, event_title: reg.event_title || '',
          event_date: reg.event_start_date || '', event_city: reg.event_city || '',
          refund_amount: reg.credits_paid || 0, note: note || '',
        }, reg.user_email);
      } catch {}
      return Response.json({ ok: true });
    }

    // ── Désinscrire sans remboursement (admin direct) ──
    if (action === 'cancel_registration') {
      const { registration_id, note } = body;
      if (!registration_id) return Response.json({ error: 'registration_id requis' }, { status: 400 });
      const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
      if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
      if (reg.status !== 'registered') return Response.json({ error: 'Inscription non active' }, { status: 400 });
      await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        refund_note: note || 'Désinscription admin (sans remboursement)',
        refunded_by: adminEmail,
      });
      const ev = await base44.asServiceRole.entities.Event.get(reg.event_id);
      if (ev) {
        const newIds = (ev.registered_ids || []).filter((id) => id !== reg.user_id);
        await base44.asServiceRole.entities.Event.update(reg.event_id, {
          registered_ids: newIds,
          attendees_count: Math.max(0, (ev.attendees_count || 0) - 1),
        });
      }
      try {
        await sendEventEmail(base44, 'admin_cancel_registration', {
          event_id: reg.event_id, event_title: reg.event_title || '',
          event_date: reg.event_start_date || '', event_city: reg.event_city || '',
          refund_amount: 0, note: note || '',
        }, reg.user_email);
      } catch {}
      return Response.json({ ok: true });
    }

    // ── Inscrire un utilisateur (admin) ──
    if (action === 'admin_register') {
      const { event_id, user_id, charge_credits } = body;
      if (!event_id || !user_id) return Response.json({ error: 'event_id et user_id requis' }, { status: 400 });
      const ev = await base44.asServiceRole.entities.Event.get(event_id);
      if (!ev) return Response.json({ error: 'Événement introuvable' }, { status: 404 });
      if (ev.status === 'cancelled') return Response.json({ error: 'Événement annulé' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.EventRegistration.filter(
        { event_id, user_id, status: 'registered' }, '-created_date', 50
      );
      if (existing && existing.length > 0)
        return Response.json({ error: 'Utilisateur déjà inscrit' }, { status: 400 });
      const u = await base44.asServiceRole.entities.User.get(user_id);
      if (!u) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      const credits = charge_credits ? Number(ev.price_credits || 0) : 0;
      if (credits > 0) {
        const bal = Number(u.referral_credits || 0);
        if (bal < credits)
          return Response.json({ error: `Crédits insuffisants (${bal}/${credits})` }, { status: 400 });
        await base44.asServiceRole.entities.User.update(user_id, { referral_credits: bal - credits });
        await base44.asServiceRole.entities.CreditTransaction.create({
          owner_id: user_id, type: 'boutique_spend', amount: -credits,
          note: `Inscription admin : ${ev.title || ''}`, status: 'completed',
        });
      }
      const newReg = await base44.asServiceRole.entities.EventRegistration.create({
        event_id, event_title: ev.title || '', event_image_url: ev.image_url || '',
        event_start_date: ev.start_date || '', event_city: ev.city || '',
        user_id, user_email: u.email || '', user_name: u.full_name || '',
        user_username: u.username || '', credits_paid: credits, status: 'registered',
        registered_at: new Date().toISOString(),
      });
      try {
        const shortCode = (newReg.id || '').replace(/-/g, '').slice(0, 8).toUpperCase();
        await base44.asServiceRole.entities.EventRegistration.update(newReg.id, {
          ticket_code: `EZA-${shortCode}`,
        });
      } catch {}
      const newIds = [...(ev.registered_ids || []), user_id];
      await base44.asServiceRole.entities.Event.update(event_id, {
        registered_ids: newIds, attendees_count: (ev.attendees_count || 0) + 1,
      });
      try {
        await sendEventEmail(base44, 'admin_registered', {
          event_id, event_title: ev.title || '', event_date: ev.start_date || '',
          event_city: ev.city || '', event_format: ev.format, credits,
        }, u.email);
      } catch {}
      return Response.json({ ok: true, credits_paid: credits });
    }

    // ── Annuler un événement (rembourse tous + notifie) ──
    if (action === 'cancel_event') {
      const { event_id, reason } = body;
      if (!event_id) return Response.json({ error: 'event_id requis' }, { status: 400 });
      const ev = await base44.asServiceRole.entities.Event.get(event_id);
      if (!ev) return Response.json({ error: 'Événement introuvable' }, { status: 404 });
      if (ev.status === 'cancelled') return Response.json({ error: 'Événement déjà annulé' }, { status: 400 });
      const regs = await base44.asServiceRole.entities.EventRegistration.filter(
        { event_id, status: 'registered' }, '-created_date', 500
      );
      let refundedCount = 0;
      for (const reg of regs) {
        await refundReg(base44, reg, reason || 'Événement annulé', adminEmail);
        refundedCount++;
        try {
          await sendEventEmail(base44, 'event_cancelled', {
            event_id, event_title: ev.title || '', event_date: ev.start_date || '',
            event_city: ev.city || '', refund_amount: reg.credits_paid || 0, reason: reason || '',
          }, reg.user_email);
        } catch {}
      }
      await base44.asServiceRole.entities.Event.update(event_id, {
        status: 'cancelled',
        cancel_reason: reason || '',
        cancelled_at: new Date().toISOString(),
        registered_ids: [],
        attendees_count: 0,
      });
      return Response.json({ ok: true, refunded: refundedCount });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}