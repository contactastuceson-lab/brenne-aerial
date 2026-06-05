import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = (await import('npm:stripe')).default;
    const stripeClient = new stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get the customer ID from Stripe using email
    const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
    if (!customers.data.length) {
      return Response.json({ error: 'Customer not found in Stripe' }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // Create the billing portal session
    const body = await req.json();
    const returnUrl = body.returnUrl || `${Deno.env.get('APP_URL')}/espace-client?tab=billing`;

    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});