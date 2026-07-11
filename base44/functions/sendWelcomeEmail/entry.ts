import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const appUrl = Deno.env.get('APP_URL') || 'https://eza.social';
    const userName = user.display_name || user.full_name || 'membre';
    const logoUrl = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png';
    const body = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenue sur eza</title></head><body style="margin:0;padding:0;background:#07111f;font-family:Arial,sans-serif;color:#eaf2ff;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#07111f;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td align="center" style="padding:0 0 22px;"><img src="${logoUrl}" width="58" alt="eza" style="display:block;"><p style="margin:10px 0 0;color:#7ab7ff;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">eza · réseau social</p></td></tr><tr><td style="background:#0d1b2d;border:1px solid #1f3b5b;border-radius:20px;overflow:hidden;"><div style="height:4px;background:linear-gradient(90deg,#4f9cff,#48d9c2,#4f9cff);"></div><div style="padding:38px 34px;"><span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#122b46;color:#7cc4ff;font-size:11px;font-weight:700;">BIENVENUE DANS LA COMMUNAUTÉ</span><h1 style="margin:20px 0 12px;font-size:28px;line-height:1.2;color:#ffffff;">Bienvenue sur eza, ${userName}.</h1><p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#b7c8dc;">Votre profil est prêt. Partagez ce qui vous anime, découvrez des communautés et échangez avec les personnes qui comptent.</p><div style="background:#091727;border:1px solid #1d3652;border-radius:14px;padding:18px 20px;margin-bottom:26px;"><p style="margin:0 0 10px;color:#ffffff;font-size:14px;font-weight:700;">Pour bien commencer</p><p style="margin:0;color:#b7c8dc;font-size:14px;line-height:1.8;">• Complétez votre profil<br>• Publiez votre première idée<br>• Explorez les profils et les conversations</p></div><a href="${appUrl}" style="display:inline-block;background:#4f9cff;color:#06111f;border-radius:10px;padding:14px 24px;text-decoration:none;font-size:14px;font-weight:700;">Découvrir eza →</a></div></td></tr><tr><td align="center" style="padding:22px 10px 0;"><p style="margin:0;color:#5d748f;font-size:11px;">© ${new Date().getFullYear()} eza · Le réseau social qui rapproche les communautés</p></td></tr></table></td></tr></table></body></html>`;

    await base44.integrations.Core.SendEmail({ to: user.email, from_name: 'eza', subject: 'Bienvenue sur eza ✨', body });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});