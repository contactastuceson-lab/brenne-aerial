import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEventEmail, getAdminEmails } from '../../shared/eventEmails.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { event_id } = body || {};
    if (!event_id) return Response.json({ error: 'event_id requis' }, { status: 400 });

    const event = await base44.asServiceRole.entities.Event.get(event_id);
    if (!event) return Response.json({ error: 'Événement introuvable' }, { status: 404 });
    if (event.status === 'cancelled')
      return Response.json({ error: 'Événement annulé' }, { status: 400 });

    const now = Date.now();
    const end = event.end_date ? new Date(event.end_date).getTime() : 0;
    if (end && end < now)
      return Response.json({ error: 'Événement terminé' }, { status: 400 });

    if (event.capacity > 0 && (event.attendees_count || 0) >= event.capacity)
      return Response.json({ error: 'Événement complet' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.EventRegistration.filter(
      { event_id, user_id: user.id, status: 'registered' }, '-created_date', 50
    );
    if (existing && existing.length > 0)
      return Response.json({ error: 'Vous êtes déjà inscrit' }, { status: 400 });

    const credits = Number(event.price_credits || 0);
    const balance = Number(user.referral_credits || 0);
    if (credits > 0 && balance < credits)
      return Response.json({ error: `Crédits Eza insuffisants (${balance}/${credits})` }, { status: 400 });

    if (credits > 0) {
      await base44.asServiceRole.entities.User.update(user.id, {
        referral_credits: balance - credits,
      });
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: user.id, type: 'boutique_spend', amount: -credits,
        note: `Inscription événement : ${event.title}`, status: 'completed',
      });
    }

    await base44.entities.EventRegistration.create({
      event_id,
      event_title: event.title || '',
      event_image_url: event.image_url || '',
      event_start_date: event.start_date || '',
      event_city: event.city || '',
      user_id: user.id,
      user_email: user.email || '',
      user_name: user.full_name || '',
      user_username: user.username || '',
      credits_paid: credits,
      status: 'registered',
      registered_at: new Date().toISOString(),
    });

    const newIds = [...(event.registered_ids || []), user.id];
    await base44.asServiceRole.entities.Event.update(event_id, {
      registered_ids: newIds,
      attendees_count: (event.attendees_count || 0) + 1,
    });

    // ── Emails branded ──
    const evCtx = {
      event_id, event_title: event.title || '', event_date: event.start_date || '',
      event_city: event.city || '', event_format: event.format, credits,
    };
    try {
      await sendEventEmail(base44, 'registration_confirmed', evCtx, user.email);
      const adminEmails = await getAdminEmails(base44);
      if (adminEmails.length)
        await sendEventEmail(base44, 'new_registration',
          { ...evCtx, user_name: user.full_name || '', user_email: user.email || '' }, adminEmails);
    } catch {}

    return Response.json({ ok: true, credits_paid: credits, new_balance: balance - credits });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}