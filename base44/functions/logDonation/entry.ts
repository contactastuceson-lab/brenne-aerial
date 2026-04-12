import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, amount, stripeSessionId } = await req.json();

    await base44.asServiceRole.entities.Donation.create({
      donor_email: userEmail,
      donor_name: userName,
      amount: amount,
      stripe_session_id: stripeSessionId,
      status: 'completed',
      has_badge: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error logging donation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});