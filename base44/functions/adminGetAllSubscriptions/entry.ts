import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Fetch all subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer', 'data.items.data.price.product'],
    });

    // Fetch recent invoices
    const invoices = await stripe.invoices.list({ limit: 100 });

    // Fetch recent charges/refunds
    const charges = await stripe.charges.list({ limit: 100 });

    // Revenue stats
    const totalMRR = subscriptions.data
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => {
        return sum + sub.items.data.reduce((s, item) => {
          const amount = item.price.unit_amount || 0;
          const interval = item.price.recurring?.interval;
          return s + (interval === 'year' ? Math.round(amount / 12) : amount);
        }, 0);
      }, 0);

    const formattedSubs = subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      customer_email: typeof sub.customer === 'object' ? sub.customer.email : null,
      customer_name: typeof sub.customer === 'object' ? sub.customer.name : null,
      customer_id: typeof sub.customer === 'object' ? sub.customer.id : sub.customer,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at,
      created: sub.created,
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
      customer_email: inv.customer_email,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      subscription: inv.subscription,
    }));

    const stats = {
      total: subscriptions.data.length,
      active: subscriptions.data.filter(s => s.status === 'active').length,
      past_due: subscriptions.data.filter(s => s.status === 'past_due').length,
      canceled: subscriptions.data.filter(s => s.status === 'canceled').length,
      trialing: subscriptions.data.filter(s => s.status === 'trialing').length,
      mrr: totalMRR,
      total_invoices: invoices.data.length,
      total_collected: invoices.data.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount_paid, 0),
    };

    return Response.json({ subscriptions: formattedSubs, invoices: formattedInvoices, stats });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});