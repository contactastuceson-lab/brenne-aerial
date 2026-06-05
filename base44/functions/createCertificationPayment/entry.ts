import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@15.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, userName, amount, badgeLevel } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create Stripe subscription checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Badge ${badgeLevel || 'Certification'} — Brenne Aerial`,
              description: `Abonnement mensuel — Badge de certification professionnelle`,
            },
            unit_amount: amount, // Amount in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/certification-success`,
      cancel_url: `${Deno.env.get('APP_URL')}/profile?certification=cancelled`,
      customer_email: userEmail,
      metadata: {
        payment_type: 'certification',
        userName: userName,
        userEmail: userEmail,
        badgeLevel: badgeLevel || '',
      },
    });

    return Response.json({ 
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});