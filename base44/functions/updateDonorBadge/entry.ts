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

    return Response.json({ success: true, has_badge: newHasBadge });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});