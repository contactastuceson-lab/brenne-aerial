import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { certificationRequestId } = await req.json();

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
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; background: #d4edda; color: #155724; }
    .info-box { background: #f0f7ff; border-left: 4px solid #38aadc; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .timeline { background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .timeline-step { margin-bottom: 15px; display: flex; gap: 10px; }
    .timeline-number { background: #38aadc; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
    .timeline-text { flex: 1; }
    .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .btn { display: inline-block; background: #38aadc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Paiement reçu</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">eza</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0;">Bonjour ${certRequest.user_name},</h2>
      
      <div class="status-badge">
        ✓ PAIEMENT CONFIRMÉ
      </div>

      <p>
        Merci pour votre paiement ! Votre demande de certification eza a été enregistrée et le paiement a été reçu avec succès.
      </p>

      <p style="font-size: 16px; font-weight: bold; color: #38aadc;">
        Notre équipe va maintenant examiner votre dossier.
      </p>

      <div class="timeline">
        <p style="margin-top: 0; font-weight: bold; color: #333;">Prochaines étapes :</p>
        <div class="timeline-step">
          <div class="timeline-number">1</div>
          <div class="timeline-text">
            <strong>Examen en cours</strong>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Notre équipe examine votre dossier</p>
          </div>
        </div>
        <div class="timeline-step">
          <div class="timeline-number">2</div>
          <div class="timeline-text">
            <strong>Réponse sous 5 jours</strong>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Vous recevrez une notification par email</p>
          </div>
        </div>
        <div class="timeline-step">
          <div class="timeline-number">3</div>
          <div class="timeline-text">
            <strong>Résultat</strong>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Si approuvée, le badge s'affichera sur votre profil</p>
          </div>
        </div>
      </div>

      <div class="info-box">
        <p style="margin: 0;"><strong>Suivi en temps réel :</strong></p>
        <p style="margin: 10px 0 0 0; color: #666;">
          Consultez votre tableau de bord pour suivre l'évolution de votre certification.
        </p>
        <a href="${Deno.env.get('APP_URL')}/dashboard?tab=certifications" class="btn">Voir la timeline</a>
      </div>

      <p>Si vous avez des questions, contactez-nous à <strong>contact@ezagroup.org</strong></p>

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

    await base44.integrations.Core.SendEmail({
      to: certRequest.user_email,
      from_name: 'eza',
      subject: '✓ Paiement reçu - Certification eza',
      body: htmlContent,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});