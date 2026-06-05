import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { certificationRequestId } = await req.json();

    const requests = await base44.asServiceRole.entities.CertificationRequest.filter({ id: certificationRequestId });
    if (requests.length === 0) {
      return Response.json({ error: 'Certification request not found' }, { status: 404 });
    }

    const certRequest = requests[0];

    if (!certRequest.stripe_session_id) {
      return Response.json({ error: 'No Stripe session found for this request' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get the checkout session to find the subscription or payment intent
    const session = await stripe.checkout.sessions.retrieve(certRequest.stripe_session_id);

    let refundResult = null;

    if (session.mode === 'subscription' && session.subscription) {
      // Cancel the subscription immediately and refund the latest invoice
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      // Cancel immediately
      await stripe.subscriptions.cancel(session.subscription);

      // Refund the latest payment
      if (subscription.latest_invoice) {
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        if (invoice.payment_intent) {
          refundResult = await stripe.refunds.create({
            payment_intent: invoice.payment_intent,
            reason: 'requested_by_customer',
          });
        }
      }
    } else if (session.payment_intent) {
      // One-time payment refund
      refundResult = await stripe.refunds.create({
        payment_intent: session.payment_intent,
        reason: 'requested_by_customer',
      });
    }

    // Update the certification request
    await base44.asServiceRole.entities.CertificationRequest.update(certificationRequestId, {
      payment_status: 'refunded',
      admin_notes: (certRequest.admin_notes || '') + '\n[Remboursement effectué automatiquement]',
    });

    // Send refund email to user
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: certRequest.user_email,
        from: 'billing@brenneaerial.fr',
        subject: '💸 Remboursement effectué - Certification Brenne Aerial',
        body: `<p>Bonjour ${certRequest.user_name || ''},</p>
<p>Suite au refus de votre demande de certification, votre paiement a été remboursé intégralement.</p>
<p>Le remboursement apparaîtra sur votre relevé bancaire sous 5 à 10 jours ouvrables.</p>
<p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:billing@brenneaerial.fr">billing@brenneaerial.fr</a>.</p>
<p>Cordialement,<br>L'équipe Brenne Aerial</p>`,
      });
    } catch (e) {
      console.error('Email error:', e.message);
    }

    return Response.json({ success: true, refund: refundResult });
  } catch (error) {
    console.error('Refund error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});