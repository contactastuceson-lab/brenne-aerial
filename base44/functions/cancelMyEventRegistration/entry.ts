import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEventEmail, getOrganizerEmails } from '../../shared/eventEmails.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { registration_id, reason } = body || {};
    if (!registration_id)
      return Response.json({ error: 'registration_id requis' }, { status: 400 });

    const reg = await base44.asServiceRole.entities.EventRegistration.get(registration_id);
    if (!reg) return Response.json({ error: 'Inscription introuvable' }, { status: 404 });
    if (reg.user_id !== user.id)
      return Response.json({ error: 'Permission refusée' }, { status: 403 });
    if (reg.status !== 'registered')
      return Response.json({ error: 'Inscription non active' }, { status: 400 });
    if (reg.cancel_request_status === 'pending')
      return Response.json({ error: 'Une demande d\'annulation est déjà en cours' }, { status: 400 });

    // Création de la demande (sans remboursement immédiat — validation admin requise)
    await base44.asServiceRole.entities.EventRegistration.update(registration_id, {
      cancel_request_status: 'pending',
      cancel_request_reason: reason || '',
      cancel_requested_at: new Date().toISOString(),
    });

    // ── Emails branded ──
    const ev = await base44.asServiceRole.entities.Event.get(reg.event_id);
    const evCtx = {
      event_id: reg.event_id, event_title: reg.event_title || '',
      event_date: reg.event_start_date || '', event_city: reg.event_city || '',
      event_format: ev?.format, credits: reg.credits_paid || 0,
      reason: reason || '',
    };
    try {
      await sendEventEmail(base44, 'cancellation_request_received',
        { ...evCtx, user_name: user.full_name || '' }, user.email);
      const orgEmails = await getOrganizerEmails(base44, ev);
      if (orgEmails.length)
        await sendEventEmail(base44, 'cancellation_requested_admin',
          { ...evCtx, user_name: user.full_name || '', user_email: user.email || '' }, orgEmails);
    } catch {}

    return Response.json({ ok: true, status: 'pending' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}