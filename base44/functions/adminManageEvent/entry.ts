import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_ROLES = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ADMIN_ROLES.includes(user.role))
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action } = body || {};

    if (action === 'refund_registration') {
      const { registration_id, note } = body;
      if (!registration_id)
        return Response.json({ error: 'registration_id requis' }, { status: 400 });

      const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
      if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
      if (reg.status === 'refunded')
        return Response.json({ error: 'Inscription déjà remboursée' }, { status: 400 });

      // remboursement des crédits
      if (reg.credits_paid > 0) {
        const u = await base44.asServiceRole.entities.User.get(reg.user_id);
        const bal = Number(u?.referral_credits || 0);
        await base44.asServiceRole.entities.User.update(reg.user_id, {
          referral_credits: bal + reg.credits_paid,
        });
        await base44.asServiceRole.entities.CreditTransaction.create({
          owner_id: reg.user_id,
          type: 'reward',
          amount: reg.credits_paid,
          note: `Remboursement inscription : ${reg.event_title || ''}`,
          status: 'completed',
        });
      }

      await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
        status: 'refunded',
        cancelled_at: new Date().toISOString(),
        refund_note: note || '',
        refunded_by: user.email || '',
      });

      // décrémenter l'événement
      const ev = await base44.asServiceRole.entities.Event.get(reg.event_id);
      if (ev) {
        const newIds = (ev.registered_ids || []).filter((id) => id !== reg.user_id);
        await base44.asServiceRole.entities.Event.update(reg.event_id, {
          registered_ids: newIds,
          attendees_count: Math.max(0, (ev.attendees_count || 0) - 1),
        });
      }

      return Response.json({ ok: true });
    }

    if (action === 'cancel_event') {
      const { event_id, reason } = body;
      if (!event_id)
        return Response.json({ error: 'event_id requis' }, { status: 400 });

      const ev = await base44.asServiceRole.entities.Event.get(event_id);
      if (!ev) return Response.json({ error: 'Événement introuvable' }, { status: 404 });
      if (ev.status === 'cancelled')
        return Response.json({ error: 'Événement déjà annulé' }, { status: 400 });

      // rembourser toutes les inscriptions actives
      const regs = await base44.asServiceRole.entities.EventRegistration.filter(
        { event_id, status: 'registered' }, '-created_date', 500
      );
      let refundedCount = 0;
      for (const reg of regs) {
        if (reg.credits_paid > 0) {
          const u = await base44.asServiceRole.entities.User.get(reg.user_id);
          const bal = Number(u?.referral_credits || 0);
          await base44.asServiceRole.entities.User.update(reg.user_id, {
            referral_credits: bal + reg.credits_paid,
          });
          await base44.asServiceRole.entities.CreditTransaction.create({
            owner_id: reg.user_id,
            type: 'reward',
            amount: reg.credits_paid,
            note: `Remboursement (annulation événement) : ${ev.title || ''}`,
            status: 'completed',
          });
        }
        await base44.asServiceRole.entities.EventRegistration.update(reg.id, {
          status: 'refunded',
          cancelled_at: new Date().toISOString(),
          refund_note: reason || 'Événement annulé',
          refunded_by: user.email || '',
        });
        refundedCount++;
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