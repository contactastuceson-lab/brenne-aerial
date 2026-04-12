import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, amount } = await req.json();

    // Update certification request payment status to completed
    // (In a real scenario, this would redirect to Stripe or handle payment processing)
    const requests = await base44.entities.CertificationRequest.filter({ user_email: userEmail });
    if (requests.length > 0) {
      await base44.entities.CertificationRequest.update(requests[0].id, {
        payment_status: 'completed'
      });
    }

    // Return success (no redirect needed in dev)
    return Response.json({ 
      success: true,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});