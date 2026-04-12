import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientName, clientEmail, serviceType, estimatedPrice } = body;

    // Send notification to admin user instead of external client
    await base44.entities.Notification.create({
      user_email: user.email,
      title: `📋 Nouvelle demande de devis de ${clientName}`,
      content: `Service: ${serviceType} | Email: ${clientEmail}${estimatedPrice ? ` | Prix estimé: ${estimatedPrice}€` : ''}`,
      type: 'quote_pending',
      link: '/admin/quotes',
    });

    // Create Quote record in database
    const quote = await base44.entities.Quote.create({
      client_name: clientName,
      client_email: clientEmail,
      service_type: serviceType,
      status: 'pending',
      prix_estime: estimatedPrice || null,
    });

    return Response.json({ success: true, quoteId: quote.id });
  } catch (err) {
    console.error('Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});