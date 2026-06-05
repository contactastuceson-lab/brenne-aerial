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

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return Response.json({ subscriptions: [], invoices: [] });
    }

    const customerId = customers.data[0].id;

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
      expand: ['data.items.data.price.product'],
    });

    // Get invoices
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    const formattedSubs = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      current_period_end: sub.current_period_end,
      current_period_start: sub.current_period_start,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at,
      items: sub.items.data.map(item => ({
        id: item.id,
        product_name: item.price.product?.name || 'Abonnement',
        amount: item.price.unit_amount,
        currency: item.price.currency,
        interval: item.price.recurring?.interval,
      })),
    }));

    const formattedInvoices = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
    }));

    return Response.json({ subscriptions: formattedSubs, invoices: formattedInvoices });
  } catch (error) {
    console.error('Subscriptions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});