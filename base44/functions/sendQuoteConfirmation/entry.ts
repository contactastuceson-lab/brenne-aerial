import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_URL') || 'https://brenneaerial.fr';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  autre: 'Autre prestation',
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientName, clientEmail, serviceType, estimatedPrice, dateStr, quoteId } = body;

    // Notification admin
    await base44.entities.Notification.create({
      user_email: user.email,
      title: `📋 Nouveau devis de ${clientName}`,
      content: `Service: ${SERVICE_LABELS[serviceType] || serviceType} | Email: ${clientEmail}${estimatedPrice ? ` | Estimé: ${estimatedPrice}€` : ''}`,
      type: 'quote_pending',
      link: '/admin/quotes',
    });

    // Email de confirmation au client via sendQuoteEmail
    await base44.functions.invoke('sendQuoteEmail', {
      type: 'quote_received',
      clientName,
      clientEmail,
      serviceType,
      quoteId,
      dateStr: dateStr || null,
      prix_estime: estimatedPrice || null,
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});