import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { certificationRequestId, paymentUrl } = await req.json();

    const certRequest = await base44.asServiceRole.entities.CertificationRequest.get(certificationRequestId);
    if (!certRequest) {
      return Response.json({ error: 'Certification request not found' }, { status: 404 });
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #38aadc 0%, #3db8e8 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; background: #d1ecf1; color: #0c5460; }
    .info-box { background: #f0f7ff; border-left: 4px solid #38aadc; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .payment-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .details-box { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #ddd; }
    .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .btn { display: inline-block; background: #38aadc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Demande reçue</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">eza</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0;">Bonjour ${certRequest.display_name || certRequest.user_name},</h2>
      
      <div class="status-badge">
        ✓ DEMANDE ENREGISTRÉE
      </div>

      <p>Merci d'avoir soumis votre demande de certification ! Nous avons bien reçu votre dossier.</p>

      <div class="payment-box">
         <p style="margin-top: 0; font-weight: bold;">🔐 Paiement sécurisé</p>
         <p>Prochaine étape : finalisez votre demande en effectuant le paiement de <strong>5€</strong>. Une fois le paiement confirmé, notre équipe examinera votre dossier sous 5 jours ouvrables.</p>
         ${paymentUrl ? `<p style="text-align: center; margin-bottom: 0;"><a href="${paymentUrl}" class="btn">💳 Procéder au paiement</a></p>` : ''}
       </div>

      <div class="details-box">
        <p style="margin-top: 0; font-weight: bold; color: #333;">Vos informations :</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
          ${Object.entries(certRequest.responses || {}).map(([key, value]) => 
            `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`
          ).join('')}
        </ul>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>ℹ️ Processus de certification</strong></p>
        <ol style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Vous recevez le lien de paiement</li>
          <li>Vous payez 5€ en toute sécurité</li>
          <li>Notre équipe examine votre dossier (5 jours max)</li>
          <li>Vous recevez la réponse par email</li>
        </ol>
      </div>

      <p>Des questions ? Contactez-nous à <strong><a href="mailto:contact@ezagroup.org" style="color:#38aadc;">contact@ezagroup.org</a></strong> ou via notre <a href="https://eza.social" style="color:#38aadc;">support en ligne</a>.</p>

      <p style="margin-top: 30px; margin-bottom: 0;">Cordialement,<br><strong>L'équipe eza</strong></p>
    </div>
    <div class="footer">
      <p>eza - Réseau social et communautés</p>
      <p>© 2026 eza. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `;

    const res = await base44.integrations.Core.SendEmail({
      to: certRequest.user_email,
      from_name: 'eza',
      subject: '✓ Votre demande de certification a été reçue - eza',
      body: htmlContent,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});