import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { registration_id } = body || {};
    if (!registration_id)
      return Response.json({ error: 'registration_id requis' }, { status: 400 });

    const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
    if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
    if (reg.user_id !== user.id)
      return Response.json({ error: 'Permission refusée' }, { status: 403 });
    if (reg.status === 'refunded')
      return Response.json({ error: 'Inscription déjà annulée' }, { status: 400 });
    if (reg.status === 'cancelled')
      return Response.json({ error: 'Inscription déjà annulée' }, { status: 400 });

    // remboursement des crédits
    if (reg.credits_paid > 0) {
      const bal = Number(user.referral_credits || 0);
      await base44.asServiceRole.entities.User.update(user.id, {
        referral_credits: bal + reg.credits_paid,
      });
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: user.id,
        type: 'reward',
        amount: reg.credits_paid,
        note: `Annulation inscription : ${reg.event_title || ''}`,
        status: 'completed',
      });
    }

    await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
      status: 'refunded',
      cancelled_at: new Date().toISOString(),
      refund_note: 'Annulation par l\'utilisateur',
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

    return Response.json({ ok: true, refunded: reg.credits_paid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}