import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, amount, stripeSessionId, isAnonymous } = await req.json();

    if (!userEmail || !amount) {
      return Response.json({ error: 'Missing userEmail or amount' }, { status: 400 });
    }

    // Créer l'enregistrement Donation
    await base44.asServiceRole.entities.Donation.create({
      donor_email: userEmail,
      donor_name: userName || 'Bienfaiteur',
      amount: amount,
      status: 'completed',
      stripe_session_id: stripeSessionId || '',
      is_anonymous: isAnonymous || false,
      has_badge: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});