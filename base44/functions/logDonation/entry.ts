import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@^15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return Response.json({ error: 'Invalid or unpaid session' }, { status: 400 });
    }

    // Chercher le don pending
    const donations = await base44.asServiceRole.entities.Donation.filter({
      stripe_session_id: sessionId,
    });

    if (donations.length === 0) {
      return Response.json({ error: 'Donation not found' }, { status: 404 });
    }

    const donation = donations[0];

    // Mettre à jour en "completed" et ajouter le badge
    await base44.asServiceRole.entities.Donation.update(donation.id, {
      status: 'completed',
      has_badge: true,
    });

    return Response.json({ success: true, donation });
  } catch (error) {
    console.error('Log donation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});