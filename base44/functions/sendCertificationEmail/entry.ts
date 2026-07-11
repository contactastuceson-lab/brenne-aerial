import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { certificationRequestId, status, adminNotes } = await req.json();

    const certRequest = await base44.asServiceRole.entities.CertificationRequest.get(certificationRequestId);
    if (!certRequest) {
      return Response.json({ error: 'Certification request not found' }, { status: 404 });
    }

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? '✓ Votre demande de certification a été approuvée'
      : '✗ Votre demande de certification a été refusée';

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
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .info-box { background: #f0f7ff; border-left: 4px solid #38aadc; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .notes-box { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #ddd; }
    .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .btn { display: inline-block; background: #38aadc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isApproved ? '✓ Certification approuvée' : '✗ Demande examinée'}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">eza</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0;">Bonjour ${certRequest.display_name || certRequest.user_name},</h2>
      
      <div class="status-badge ${isApproved ? 'status-approved' : 'status-rejected'}">
        ${isApproved ? '✓ APPROUVÉE' : '✗ REFUSÉE'}
      </div>

      <p>
        Merci d'avoir soumis votre demande de certification auprès de eza.
      </p>

      ${isApproved ? `
        <p style="font-size: 16px; font-weight: bold; color: #155724;">
          Excellente nouvelle ! Votre demande de certification a été <strong>approuvée</strong>.
        </p>
        <p>Vous pouvez désormais afficher le badge "Officiel" sur votre profil. Cela valorise votre expertise et renforce la confiance avec les clients potentiels.</p>
        <p><a href="https://eza.social/profile" class="btn">Voir mon profil</a></p>
      ` : `
        <p style="font-size: 16px; font-weight: bold; color: #721c24;">
          Votre demande de certification a été <strong>refusée</strong>.
        </p>
        ${adminNotes ? `
          <div class="notes-box">
            <p style="margin-top: 0; font-weight: bold; color: #666;">Commentaires de l'équipe :</p>
            <p>${adminNotes}</p>
          </div>
        ` : ''}
      `}

      <div class="info-box">
        <p style="margin: 0;"><strong>Vos réponses :</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          ${Object.entries(certRequest.responses || {}).map(([key, value]) => 
            `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`
          ).join('')}
        </ul>
      </div>

      ${!isApproved ? `
        <p>Vous pouvez soumettre une nouvelle demande ultérieurement. Si vous avez des questions, contactez-nous à <strong><a href="mailto:contact@eza.social" style="color:#38aadc;">contact@eza.social</a></strong> ou via notre <a href="https://support.brenneaerial.org/support" style="color:#38aadc;">support en ligne</a>.</p>
      ` : ''}

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
      subject: subject,
      body: htmlContent,
    });

    return Response.json({ success: true, result: res });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});