import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();

    if (adminUser?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { donationId, hasBadge } = await req.json();

    if (!donationId) {
      return Response.json({ error: 'Missing donationId' }, { status: 400 });
    }

    const donation = await base44.asServiceRole.entities.Donation.get(donationId);
    
    if (!donation) {
      return Response.json({ error: 'Donation not found' }, { status: 404 });
    }

    const newHasBadge = !hasBadge;
    await base44.asServiceRole.entities.Donation.update(donationId, { has_badge: newHasBadge });

    // Mettre à jour les badges de l'utilisateur
    let allUsers = [];
    let page = 0;
    let hasMore = true;
    
    while (hasMore) {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 100, page * 100);
      allUsers = allUsers.concat(users);
      hasMore = users.length === 100;
      page++;
    }
    
    const donorUser = allUsers.find(u => u.email === donation.donor_email);
    
    if (donorUser) {
      const badges = donorUser.badges || [];
      let newBadges;
      
      if (newHasBadge) {
        // Ajouter le badge
        newBadges = badges.includes('Donateur') ? badges : [...badges, 'Donateur'];
      } else {
        // Retirer le badge
        newBadges = badges.filter(b => b !== 'Donateur');
      }
      
      await base44.asServiceRole.entities.User.update(donorUser.id, { badges: newBadges });
    }

    return Response.json({ success: true, has_badge: newHasBadge });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});