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
    const { action, subscriptionId, invoiceId, immediately } = await req.json();

    if (action === 'cancel') {
      let result;
      if (immediately) {
        result = await stripe.subscriptions.cancel(subscriptionId);
      } else {
        result = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      }
      return Response.json({ success: true, subscription: { id: result.id, status: result.status, cancel_at_period_end: result.cancel_at_period_end } });
    }

    if (action === 'reactivate') {
      const result = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
      return Response.json({ success: true, subscription: { id: result.id, status: result.status, cancel_at_period_end: result.cancel_at_period_end } });
    }

    if (action === 'refund_invoice') {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      if (!invoice.payment_intent) {
        return Response.json({ error: 'No payment intent on this invoice' }, { status: 400 });
      }
      const refund = await stripe.refunds.create({ payment_intent: invoice.payment_intent });
      return Response.json({ success: true, refund: { id: refund.id, status: refund.status } });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin manage subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});