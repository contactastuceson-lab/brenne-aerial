import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@^15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    // Vérifier la signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        sig,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Gérer les événements de paiement
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Récupérer les métadonnées du paiement
      const metadata = session.metadata || {};
      const donorEmail = metadata.donor_email || session.customer_email;
      const donorName = metadata.donor_name || 'Anonyme';
      const amount = session.amount_total / 100; // Convertir en euros

      if (!donorEmail) {
        return Response.json({ error: 'Missing donor email' }, { status: 400 });
      }

      // Créer l'enregistrement Donation
      const existing = await base44.asServiceRole.entities.Donation.filter({
        stripe_session_id: session.id,
      });

      if (existing.length === 0) {
        await base44.asServiceRole.entities.Donation.create({
          donor_email: donorEmail,
          donor_name: donorName,
          amount: amount,
          status: 'completed',
          stripe_session_id: session.id,
          has_badge: true,
          is_anonymous: metadata.is_anonymous === 'true',
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});