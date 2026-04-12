import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@^15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Seulement les admins peuvent synchroniser
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Récupérer tous les sessions Stripe complétées
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    });

    let created = 0;
    let skipped = 0;

    for (const session of sessions.data) {
      // Vérifier si ce paiement existe déjà
      const existing = await base44.asServiceRole.entities.Donation.filter({
        stripe_session_id: session.id,
      });

      if (existing.length === 0) {
        const metadata = session.metadata || {};
        const donorEmail = metadata.donor_email || session.customer_email || 'unknown@example.com';
        const donorName = metadata.donor_name || 'Donateur anonyme';
        const amount = session.amount_total / 100;

        try {
          await base44.asServiceRole.entities.Donation.create({
            donor_email: donorEmail,
            donor_name: donorName,
            amount: amount,
            status: 'completed',
            stripe_session_id: session.id,
            has_badge: true,
            is_anonymous: metadata.is_anonymous === 'true',
          });
          created++;
        } catch (e) {
          console.error('Error creating donation:', e);
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      message: `Synchronisation terminée : ${created} dons créés, ${skipped} ignorés`,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});