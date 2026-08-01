import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

const ALLOWED_ROLES = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin', 'event_manager'];

function shortId(id: string) {
  if (!id) return '';
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role))
      return Response.json({ ok: false, error: 'Permission refusée — scanner réservé aux organisateurs' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { reg_id, ticket_code, event_id } = body || {};

    // Résolution de l'inscription : par reg_id (QR JSON) ou par ticket_code (saisie manuelle / QR EZA-)
    let reg: any = null;

    if (reg_id) {
      try {
        reg = await base44.asServiceRole.entities.EventRegistration.get(reg_id);
      } catch { reg = null; }
    }

    // Si pas trouvé par reg_id, on tente par ticket_code (code court EZA-XXXXXXXX)
    if (!reg && (ticket_code || reg_id)) {
      const raw = String(ticket_code || reg_id).trim().toUpperCase().replace(/^EZA-/, '');
      // Accepte aussi un reg_id complet passé comme ticket_code
      const all = await base44.asServiceRole.entities.EventRegistration.list('-created_date', 500);
      reg = (all || []).find((r: any) => {
        if (!r) return false;
        if (String(r.id || '').replace(/-/g, '').toUpperCase() === raw) return true;
        if (String(r.ticket_code || '').toUpperCase().replace(/^EZA-/, '') === raw) return true;
        return false;
      }) || null;
    }

    if (!reg)
      return Response.json({ ok: false, error: 'Billet introuvable — code non reconnu' });

    if (event_id && reg.event_id !== event_id)
      return Response.json({
        ok: false,
        error: `Ce billet correspond à un autre événement : ${reg.event_title || ''}`,
        registration: reg,
      });

    if (reg.status !== 'registered')
      return Response.json({
        ok: false,
        error: `Inscription non valide (statut : ${reg.status})`,
        registration: reg,
      });

    if (reg.checked_in)
      return Response.json({
        ok: false,
        already: true,
        error: 'Billet déjà validé',
        registration: reg,
      });

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.EventRegistration.update(reg.id, {
      checked_in: true,
      checked_in_at: now,
    });

    // Push + notification de bienvenue au participant (non bloquant)
    waitUntil(
      (async () => {
        try {
          if (reg.user_email) {
            await base44.asServiceRole.entities.Notification.create({
              user_email: reg.user_email,
              type: 'system',
              title: `🎟️ Bienvenue à ${reg.event_title || "l'événement"} !`,
              content: 'Votre billet a été validé. Bon événement !',
              sender_name: 'Eza Events',
            }).catch(() => {});
            await base44.functions.invoke('sendWebPush', {
              user_email: reg.user_email,
              title: `Bienvenue à ${reg.event_title || "l'événement"} !`,
              body: 'Votre billet a été validé. Bon événement !',
              url: '/espace',
              tag: 'event-checkin',
            }).catch(() => {});
          }
        } catch {}
      })()
    );

    return Response.json({
      ok: true,
      registration: {
        ...reg,
        checked_in: true,
        checked_in_at: now,
      },
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}