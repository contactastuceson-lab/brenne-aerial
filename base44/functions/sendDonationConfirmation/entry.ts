import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName } = await req.json();

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
    .heart { font-size: 32px; text-align: center; margin: 20px 0; }
    .thank-you { background: linear-gradient(135deg, rgba(56, 170, 220, 0.1) 0%, rgba(61, 184, 232, 0.1) 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38aadc; }
    .impact-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .impact-item { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #38aadc; padding-left: 15px; }
    .footer { color: #666; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .btn { display: inline-block; background: #38aadc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Merci pour votre don</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Brenne Aerial</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0;">Bonjour ${userName},</h2>
      
      <div class="heart">❤️💙💚</div>

      <div class="thank-you">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #38aadc;">
          Merci infiniment pour votre soutien !
        </p>
        <p style="margin: 10px 0 0 0; color: #666;">
          Votre générosité nous aide à continuer notre mission et à innover dans le domaine des solutions drone.
        </p>
      </div>

      <h3 style="margin-top: 30px;">Votre impact :</h3>
      <div class="impact-box">
        <div class="impact-item">
          <strong>🎯 Financer l'innovation</strong>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Vous contribuez au développement de nouvelles technologies</p>
        </div>
        <div class="impact-item">
          <strong>⭐ Soutenir l'excellence</strong>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Vous nous aidez à maintenir nos standards de qualité</p>
        </div>
        <div class="impact-item">
          <strong>🌍 Créer un avenir meilleur</strong>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Vous participez à notre vision pour les solutions drone</p>
        </div>
      </div>

      <p style="margin-top: 25px; color: #38aadc; font-weight: bold;">
        Vous êtes maintenant un bienfaiteur officiel de Brenne Aerial !
      </p>

      <p style="margin-top: 25px;">
        Si vous avez des questions sur votre don ou souhaitez connaître l'impact de votre contribution, n'hésitez pas à nous contacter.
      </p>

      <p style="margin-top: 30px; margin-bottom: 0;">Avec toute notre gratitude,<br><strong>L'équipe Brenne Aerial</strong></p>
    </div>
    <div class="footer">
      <p>Brenne Aerial - Solutions drone professionnelles</p>
      <p>© 2026 Brenne Aerial. Tous droits réservés.</p>
      <p><a href="${Deno.env.get('APP_URL')}/donation" style="color: #38aadc; text-decoration: none;">Faire un autre don →</a></p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: '❤️ Merci pour votre don à Brenne Aerial',
      body: htmlContent,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Donation confirmation email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});