import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ajouter le badge "Donateur" s'il n'existe pas
    const currentBadges = user.badges || [];
    if (!currentBadges.includes('Donateur')) {
      currentBadges.push('Donateur');
      await base44.auth.updateMe({ badges: currentBadges });
    }

    return Response.json({ success: true, badges: currentBadges });
  } catch (error) {
    console.error('Error adding donator badge:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});