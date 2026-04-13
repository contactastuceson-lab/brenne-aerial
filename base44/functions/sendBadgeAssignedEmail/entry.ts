import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_URL') || 'https://brenneaerial.fr';

const BADGE_LABELS = {
  verified:  { label: 'Vérifié ✅',   color: '#38aadc', desc: 'Votre identité a été confirmée par notre équipe.' },
  certified: { label: 'Certifié 🏅',  color: '#f59e0b', desc: 'Votre expertise et vos références ont été validées.' },
  official:  { label: 'Officiel 🏢',  color: '#a855f7', desc: 'Votre entité ou organisation a été reconnue officiellement.' },
  pro:       { label: 'Pro 💎',        color: '#10b981', desc: 'Votre statut de professionnel a été validé.' },
  supreme:   { label: 'Suprême 👑',   color: '#f59e0b', desc: 'Vous faites partie de l\'élite de la communauté Brenne Aerial.' },
};

const CUSTOM_BADGE_DESC = {
  'Fondateur':     'Vous êtes reconnu comme membre fondateur de la communauté Brenne Aerial.',
  'Collaborateur': 'Vous êtes désormais collaborateur officiel de Brenne Aerial.',
  'VIP':           'Vous avez obtenu le statut VIP sur la plateforme.',
  'Admin':         'Vous disposez désormais des droits administrateur.',
  'Pilote':        'Votre statut de pilote a été reconnu sur la plateforme.',
  'Officiel':      'Votre compte a été marqué comme officiel.',
  'Vérifié':       'Votre compte a été vérifié par notre équipe.',
  'Beta Testeur':  'Merci de faire partie des beta testeurs de Brenne Aerial.',
  'Partenaire':    'Vous êtes désormais partenaire officiel de Brenne Aerial.',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, badgeKey, badgeLabel, type } = await req.json();

    if (!userEmail || (!badgeKey && !badgeLabel)) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const isVerification = type === 'verification';
    const cfg = isVerification ? BADGE_LABELS[badgeKey] : null;
    const displayLabel = cfg?.label || badgeLabel || badgeKey;
    const color = cfg?.color || '#38aadc';
    const desc = cfg?.desc || CUSTOM_BADGE_DESC[badgeLabel || badgeKey] || 'Félicitations pour cette reconnaissance !';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `🎉 Nouveau badge attribué : ${displayLabel}`,
      body: `
<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: auto; background: #060e1c; color: #e8edf5; border-radius: 16px; overflow: hidden; border: 1px solid #1a2d4a;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0a1628 0%, #0f1f3d 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1a2d4a;">
    <p style="color: #38aadc; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px;">BRENNE AERIAL</p>
    <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">Badge attribué 🎉</h1>
  </div>

  <!-- Body -->
  <div style="padding: 32px;">
    <p style="color: #a0aec0; margin: 0 0 24px;">Bonjour <strong style="color: #e8edf5;">${userName || 'cher membre'}</strong>,</p>
    <p style="color: #a0aec0; margin: 0 0 24px;">Notre équipe vous a attribué un nouveau badge sur la plateforme Brenne Aerial :</p>

    <!-- Badge card -->
    <div style="background: #0f1f3d; border: 1px solid ${color}40; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px; text-align: center;">
      <p style="color: ${color}; font-size: 28px; font-weight: 800; margin: 0 0 8px;">${displayLabel}</p>
      <p style="color: #a0aec0; font-size: 14px; margin: 0;">${desc}</p>
    </div>

    <p style="color: #a0aec0; margin: 0 0 28px;">Ce badge est désormais visible sur votre profil et dans la communauté.</p>

    <div style="text-align: center;">
      <a href="${APP_URL}/profile" style="display: inline-block; background: ${color}; color: #060e1c; padding: 13px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
        Voir mon profil
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding: 20px 32px; border-top: 1px solid #1a2d4a; text-align: center;">
    <p style="color: #4a5568; font-size: 11px; margin: 0;">Brenne Aerial — Plateforme communautaire</p>
  </div>
</div>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});