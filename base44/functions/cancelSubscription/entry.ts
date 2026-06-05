import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, immediately } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Verify the subscription belongs to this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.customer !== customers.data[0].id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let result;
    if (immediately) {
      result = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      result = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return Response.json({ success: true, subscription: { id: result.id, status: result.status, cancel_at_period_end: result.cancel_at_period_end } });
  } catch (error) {
    console.error('Cancel error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});