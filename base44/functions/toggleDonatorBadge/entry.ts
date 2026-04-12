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
    const users = await base44.entities.User.list();
    const donorUser = users.find(u => u.email === donorEmail);

    if (!donorUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const badges = donorUser.badges || [];
    let newBadges;

    if (hasBadge) {
      // Retirer le badge
      newBadges = badges.filter(b => b !== 'Donateur');
    } else {
      // Ajouter le badge
      newBadges = badges.includes('Donateur') ? badges : [...badges, 'Donateur'];
    }

    await base44.entities.User.update(donorUser.id, { badges: newBadges });

    return Response.json({ success: true, badges: newBadges });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});