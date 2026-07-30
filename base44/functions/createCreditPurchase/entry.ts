import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@15.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Packs de crédits achetables en argent réel (prix en centimes d'euro)
const PACKS = {
  pack_50:   { credits: 50,   label: '50 crédits',     price: 299 },
  pack_120:  { credits: 120,  label: '120 crédits',    price: 599 },
  pack_250:  { credits: 250,  label: '250 crédits',    price: 999 },
  pack_500:  { credits: 500,  label: '500 crédits',    price: 1799 },
  pack_1000: { credits: 1000, label: '1000 crédits',   price: 2999 },
  pack_2000: { credits: 2000, label: '2000 crédits',   price: 4999 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { packId } = await req.json();
    const pack = PACKS[packId];
    if (!pack) return Response.json({ error: 'Pack invalide' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Eza — ${pack.label}`,
              description: `Recharge de ${pack.credits} crédits Eza utilisables dans la boutique.`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/boutique?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/boutique?purchase=cancelled`,
      customer_email: user.email || '',
      metadata: {
        payment_type: 'credits',
        credits_amount: String(pack.credits),
        user_email: user.email || '',
        user_id: user.id || '',
        pack_id: packId,
      },
    });

    return Response.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Credit purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});