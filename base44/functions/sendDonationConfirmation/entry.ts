import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, amount } = await req.json();

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #38aadc 0%, #3db8e8 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 14px; }
    .content { padding: 40px 30px; }
    .receipt-box { background: linear-gradient(135deg, rgba(56, 170, 220, 0.05) 0%, rgba(61, 184, 232, 0.05) 100%); border: 2px solid #e5f0f7; padding: 25px; border-radius: 10px; margin: 25px 0; }
    .receipt-item { display: flex; justify-content: space-between; margin: 12px 0; font-size: 15px; }
    .receipt-item-label { color: #6b7280; }
    .receipt-item-value { font-weight: 600; color: #38aadc; }
    .receipt-amount { display: flex; justify-content: space-between; align-items: baseline; margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(56, 170, 220, 0.2); font-size: 18px; font-weight: 700; }
    .receipt-amount .value { color: #38aadc; font-size: 28px; }
    .thank-you { background: linear-gradient(135deg, rgba(56, 170, 220, 0.1) 0%, rgba(61, 184, 232, 0.1) 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #38aadc; }
    .thank-you p { margin: 0; font-size: 15px; }
    .thank-you strong { color: #38aadc; }
    .impact-box { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .impact-item { margin: 12px 0; padding: 12px; background: white; border-left: 4px solid #38aadc; padding-left: 15px; border-radius: 4px; }
    .impact-item strong { color: #1f2937; display: block; margin-bottom: 3px; }
    .impact-item p { margin: 0; color: #6b7280; font-size: 13px; }
    .footer { color: #6b7280; font-size: 12px; text-align: center; padding-top: 25px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { margin: 6px 0; }
    .footer a { color: #38aadc; text-decoration: none; }
    .badge { display: inline-block; background: #dbeafe; color: #0369a1; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Merci pour votre don</h1>
      <p>eza</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #1f2937;">Bonjour ${userName},</h2>
      
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 15px 0;">
        Nous avons bien reçu votre don. Merci infiniment de votre soutien ! Votre contribution nous aide à continuer notre mission et à innover dans le domaine des la communauté.
      </p>

      <!-- Récépissé du don -->
      <div class="receipt-box">
        <div style="text-align: center; margin-bottom: 15px;">
          <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Reçu de don</p>
        </div>
        <div class="receipt-item">
          <span class="receipt-item-label">Montant du don</span>
          <span class="receipt-item-value">${amount || 'N/A'}€</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-item-label">Bénéficiaire</span>
          <span class="receipt-item-value">eza</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-item-label">Date</span>
          <span class="receipt-item-value">${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="receipt-amount">
          <span>Total</span>
          <span class="value">${amount || 'N/A'}€</span>
        </div>
      </div>

      <div class="thank-you">
        <p><strong>✨ Votre impact immédiat :</strong></p>
        <p style="margin: 10px 0 0 0; color: #4b5563; font-size: 14px;">
          Vous êtes maintenant un bienfaiteur officiel de eza et recevrez un badge spécial sur votre profil !
        </p>
      </div>

      <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 16px;">Vos dons financent :</h3>
      <div class="impact-box">
        <div class="impact-item">
          <strong>🎯 L'innovation drone</strong>
          <p>Développement de nouvelles technologies et fonctionnalités</p>
        </div>
        <div class="impact-item">
          <strong>⭐ L'excellence technique</strong>
          <p>Maintien des plus hauts standards de qualité et de performance</p>
        </div>
        <div class="impact-item">
          <strong>🌍 La recherche</strong>
          <p>Exploration de nouvelles applications et cas d'usage</p>
        </div>
      </div>

      <p style="margin: 25px 0 0 0; color: #4b5563; font-size: 14px; text-align: center;">
        Des questions ? Répondez directement à cet email ou contactez-nous à <strong>contact@eza.social</strong>
      </p>

      <p style="margin-top: 30px; margin-bottom: 0; color: #1f2937; font-weight: 600;">
        Avec toute notre gratitude,<br><strong style="color: #38aadc;">L'équipe eza</strong>
      </p>
    </div>
    <div class="footer">
      <p>eza — Solutions drone professionnelles</p>
      <p><a href="${Deno.env.get('APP_URL')}/donation">Faire un autre don →</a></p>
      <p>© 2026 eza. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.integrations.Core.SendEmail({
      to: userEmail,
      from_name: 'eza',
      subject: '❤️ Merci pour votre don à eza',
      body: htmlContent,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Donation confirmation email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});