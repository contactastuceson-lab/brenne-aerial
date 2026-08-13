import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    // Auth: shared secret via x-api-key header (called by mail.ezagroup.fr)
    const apiKey = req.headers.get('x-api-key') || req.headers.get('X-Api-Key');
    const expected = secrets.get('EZA_MAIL_API_KEY');
    if (!expected || apiKey !== expected) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Body JSON invalide' }, { status: 400 }); }
    const address = (body?.address || body?.email || body?.eza_mail || '').toString().toLowerCase().trim();
    if (!address) return Response.json({ error: 'address requis' }, { status: 400 });

    const base44 = createClientFromRequest(req);

    // Find users whose eza_mail matches the deleted address
    let users = [];
    try {
      users = await base44.asServiceRole.entities.User.filter({ eza_mail: address });
    } catch (e) {
      return Response.json({ error: 'Recherche utilisateur échouée', detail: e.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return Response.json({ synced: true, found: false, updated: 0 });
    }

    // Clear the eza_mail field on each matching user (single updates — bulk update on User is blocked)
    let updated = 0;
    for (const u of users) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, { eza_mail: '' });
        updated++;
      } catch (e) {}
    }

    return Response.json({ synced: true, found: users.length, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}