import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();

    if (adminUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { donorEmail, hasBadge } = await req.json();

    if (!donorEmail) {
      return Response.json({ error: 'Missing donorEmail' }, { status: 400 });
    }

    // Récupérer l'utilisateur à mettre à jour
    const donorUsers = await base44.asServiceRole.entities.User.filter({ email: donorEmail });
    
    if (!donorUsers || donorUsers.length === 0) {
      return Response.json({ error: 'User not found', email: donorEmail }, { status: 404 });
    }
    
    const targetUser = donorUsers[0];

    const badges = targetUser.badges || [];
    let newBadges;

    if (hasBadge) {
      // Retirer le badge
      newBadges = badges.filter(b => b !== 'Donateur');
    } else {
      // Ajouter le badge
      newBadges = badges.includes('Donateur') ? badges : [...badges, 'Donateur'];
    }

    await base44.asServiceRole.entities.User.update(targetUser.id, { badges: newBadges });

    return Response.json({ success: true, badges: newBadges });
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});