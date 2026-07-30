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
      const metadata = session.metadata || {};
      const paymentType = metadata.payment_type; // 'donation' ou 'certification'

      // ── Certification payment ──
      if (paymentType === 'certification') {
        const userEmail = metadata.userEmail || session.customer_email;
        if (userEmail) {
          const requests = await base44.asServiceRole.entities.CertificationRequest.filter(
            { user_email: userEmail },
            '-created_date',
            1
          );
          if (requests.length > 0 && requests[0].payment_status !== 'completed') {
            await base44.asServiceRole.entities.CertificationRequest.update(requests[0].id, {
              payment_status: 'completed',
              stripe_session_id: session.id,
              stripe_subscription_id: session.subscription || '',
              stripe_customer_id: session.customer || '',
            });
            // Send confirmation email
            try {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: userEmail,
                from: 'billing@brenneaerial.fr',
                subject: '✓ Paiement reçu - Certification Brenne Aerial',
                body: `<p>Bonjour ${metadata.userName || ''},</p><p>Votre paiement pour la certification Brenne Aerial a bien été reçu. Notre équipe examinera votre dossier sous 5 jours ouvrables.</p><p>Cordialement,<br>L'équipe Brenne Aerial</p>`,
              });
            } catch (e) {
              console.error('Email error:', e.message);
            }
          }
        }
        return Response.json({ success: true });
      }

      // ── Credit purchase ──
      if (paymentType === 'credits') {
        const creditsAmount = parseInt(metadata.credits_amount || '0', 10);
        const userEmail = metadata.user_email || session.customer_email;
        if (creditsAmount > 0 && userEmail) {
          try {
            const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
            if (users.length > 0) {
              const u = users[0];
              const newCredits = (u.referral_credits || 0) + creditsAmount;
              await base44.asServiceRole.entities.User.update(u.id, { referral_credits: newCredits });
            }
          } catch (e) {
            console.error('Credit attribution error:', e.message);
          }
        }
        return Response.json({ success: true });
      }

      // ── Donation payment ──
      const donorEmail = metadata.donor_email || session.customer_email;
      const donorName = metadata.donor_name || 'Anonyme';
      const amount = session.amount_total / 100;

      if (!donorEmail) {
        return Response.json({ error: 'Missing donor email' }, { status: 400 });
      }

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