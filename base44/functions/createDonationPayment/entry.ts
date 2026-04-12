import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Don - Brenne Aerial',
              description: 'Soutenir Brenne Aerial',
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/donation-success`,
      cancel_url: `${Deno.env.get('APP_URL')}/donation?cancelled=true`,
      customer_email: user?.email || '',
      metadata: {
        donor_email: user?.email || 'anonymous',
        donor_name: user?.full_name || 'Donateur anonyme',
        is_anonymous: user ? 'false' : 'true',
      },
    });

    return Response.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Donation payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});