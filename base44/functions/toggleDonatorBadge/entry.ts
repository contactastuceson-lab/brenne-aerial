import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { donorEmail, hasBadge } = await req.json();

    if (!donorEmail) {
      return Response.json({ error: 'Missing donorEmail' }, { status: 400 });
    }

    // Récupérer l'utilisateur à mettre à jour
    const users = await base44.asServiceRole.entities.User.list();
    const donorUser = users.find(u => u.email === donorEmail);

    if (!donorUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const badges = donorUser.badges || [];

    if (hasBadge) {
      // Retirer le badge
      const filtered = badges.filter(b => b !== 'Donateur');
      await base44.asServiceRole.entities.User.update(donorUser.id, { badges: filtered });
    } else {
      // Ajouter le badge
      if (!badges.includes('Donateur')) {
        badges.push('Donateur');
        await base44.asServiceRole.entities.User.update(donorUser.id, { badges });
      }
    }

    return Response.json({ success: true, badges: hasBadge ? badges.filter(b => b !== 'Donateur') : badges });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});