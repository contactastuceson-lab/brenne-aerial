import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const { returnUrl } = await req.json();

    // Find the customer ID from certification requests
    const requests = await base44.asServiceRole.entities.CertificationRequest.filter(
      { user_email: user.email },
      '-created_date',
      10
    );

    let customerId = null;
    for (const r of requests) {
      if (r.stripe_customer_id) {
        customerId = r.stripe_customer_id;
        break;
      }
    }

    // Also search by email in Stripe if no stored customer ID
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return Response.json({ error: 'Aucun abonnement Stripe trouvé pour cet email.' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${Deno.env.get('APP_URL')}/espace-client?tab=billing`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});