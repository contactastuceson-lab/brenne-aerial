import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ALLOWED_ROLES = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin', 'event_manager'];

function shortId(id: string) {
  if (!id) return '';
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role))
      return Response.json({ error: 'Permission refusée — scanner réservé aux organisateurs' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { reg_id, ticket_code, event_id } = body || {};

    let reg: any = null;
    if (reg_id) {
      reg = await base44.asServiceRole.entities.EventRegistration.get(reg_id);
    } else if (ticket_code) {
      const code = String(ticket_code).trim().toUpperCase().replace(/^EZA-/, '');
      const found = await base44.asServiceRole.entities.EventRegistration.filter(
        { status: 'registered' }, '-created_date', 500
      );
      reg = (found || []).find((r: any) => shortId(r.id) === code) || null;
    }

    if (!reg)
      return Response.json({ ok: false, error: 'Billet introuvable' }, { status: 404 });

    if (event_id && reg.event_id !== event_id)
      return Response.json({
        ok: false,
        error: `Ce billet ne correspond pas à cet événement (${reg.event_title || ''})`,
        registration: reg,
      }, { status: 400 });

    if (reg.status !== 'registered')
      return Response.json({
        ok: false,
        error: `Inscription non valide — statut : ${reg.status}`,
        registration: reg,
      }, { status: 400 });

    if (reg.checked_in)
      return Response.json({
        ok: false,
        already: true,
        error: 'Billet déjà validé',
        registration: reg,
      }, { status: 409 });

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.EventRegistration.update(reg.id, {
      checked_in: true,
      checked_in_at: now,
    });

    return Response.json({
      ok: true,
      registration: {
        ...reg,
        checked_in: true,
        checked_in_at: now,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}