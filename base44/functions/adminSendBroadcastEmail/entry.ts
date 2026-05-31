import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

// Theme configs per sender type
const THEMES = {
  gold:      { topBorder:'#d4a017', accent:'#e6b422', accentLight:'#2a1f00', headerBg:'linear-gradient(135deg,#1a1200,#0f0c00,#0d1218)', badgeBg:'#2a1f00', badgeColor:'#e6b422', badgeBorder:'#d4a01760', btnBg:'#d4a017', btnColor:'#0a0800', signature:'— Fondateur & PDG de Brenne Aerial', icon:'👔' },
  gold2:     { topBorder:'#f59e0b', accent:'#fbbf24', accentLight:'#1c1500', headerBg:'linear-gradient(135deg,#1c1500,#120f00,#0d1218)', badgeBg:'#1c1500', badgeColor:'#fcd34d', badgeBorder:'#f59e0b60', btnBg:'#f59e0b', btnColor:'#0a0800', signature:'— Direction Générale · Brenne Aerial', icon:'🤝' },
  platinum:  { topBorder:'#94a3b8', accent:'#cbd5e1', accentLight:'#111827', headerBg:'linear-gradient(135deg,#111827,#0f172a,#0d1218)', badgeBg:'#111827', badgeColor:'#e2e8f0', badgeBorder:'#94a3b860', btnBg:'#64748b', btnColor:'#ffffff', signature:'— Conseil d\'Administration · Brenne Aerial', icon:'🏛️' },
  navy:      { topBorder:'#3b82f6', accent:'#60a5fa', accentLight:'#030d1f', headerBg:'linear-gradient(135deg,#030d1f,#050f25,#0d1218)', badgeBg:'#030d1f', badgeColor:'#93c5fd', badgeBorder:'#3b82f660', btnBg:'#3b82f6', btnColor:'#ffffff', signature:'— Direction Générale · Brenne Aerial', icon:'📋' },
  blue:      { topBorder:'#38aadc', accent:'#38aadc', accentLight:'#020d18', headerBg:'linear-gradient(135deg,#020d18,#060e18,#0d1218)', badgeBg:'#061624', badgeColor:'#7dd3fc', badgeBorder:'#38aadc60', btnBg:'#38aadc', btnColor:'#03080f', signature:'— Service Client · Brenne Aerial', icon:'🎧' },
  green:     { topBorder:'#22c55e', accent:'#22c55e', accentLight:'#011209', headerBg:'linear-gradient(135deg,#011209,#061a0e,#0d1218)', badgeBg:'#061a0e', badgeColor:'#86efac', badgeBorder:'#22c55e60', btnBg:'#22c55e', btnColor:'#011209', signature:'— Pôle Commercial · Brenne Aerial', icon:'💼' },
  purple:    { topBorder:'#a855f7', accent:'#a855f7', accentLight:'#0d0118', headerBg:'linear-gradient(135deg,#0d0118,#120620,#0d1218)', badgeBg:'#120620', badgeColor:'#d8b4fe', badgeBorder:'#a855f760', btnBg:'#a855f7', btnColor:'#0d0118', signature:'— Pôle Opérations · Brenne Aerial', icon:'🚁' },
  orange:    { topBorder:'#f97316', accent:'#fb923c', accentLight:'#1c0a00', headerBg:'linear-gradient(135deg,#1c0a00,#180800,#0d1218)', badgeBg:'#1c0a00', badgeColor:'#fdba74', badgeBorder:'#f9731660', btnBg:'#f97316', btnColor:'#0a0400', signature:'— Pôle Technique · Brenne Aerial', icon:'🔧' },
  red:       { topBorder:'#ef4444', accent:'#f87171', accentLight:'#1c0000', headerBg:'linear-gradient(135deg,#1c0000,#180000,#0d1218)', badgeBg:'#1c0000', badgeColor:'#fca5a5', badgeBorder:'#ef444460', btnBg:'#dc2626', btnColor:'#ffffff', signature:'— Pôle Sécurité & Conformité · Brenne Aerial', icon:'🛡️' },
  cyan:      { topBorder:'#06b6d4', accent:'#22d3ee', accentLight:'#001418', headerBg:'linear-gradient(135deg,#001418,#001a20,#0d1218)', badgeBg:'#001418', badgeColor:'#67e8f9', badgeBorder:'#06b6d460', btnBg:'#06b6d4', btnColor:'#001010', signature:'— Équipe Pilotes · Brenne Aerial', icon:'🎮' },
  pink:      { topBorder:'#ec4899', accent:'#f472b6', accentLight:'#1a0010', headerBg:'linear-gradient(135deg,#1a0010,#150008,#0d1218)', badgeBg:'#1a0010', badgeColor:'#f9a8d4', badgeBorder:'#ec489960', btnBg:'#ec4899', btnColor:'#0a0008', signature:'— Marketing & Communication · Brenne Aerial', icon:'📣' },
  teal:      { topBorder:'#14b8a6', accent:'#2dd4bf', accentLight:'#001412', headerBg:'linear-gradient(135deg,#001412,#001a18,#0d1218)', badgeBg:'#001412', badgeColor:'#5eead4', badgeBorder:'#14b8a660', btnBg:'#14b8a6', btnColor:'#001010', signature:'— Service Facturation · Brenne Aerial', icon:'🧾' },
  indigo:    { topBorder:'#6366f1', accent:'#818cf8', accentLight:'#080018', headerBg:'linear-gradient(135deg,#080018,#0a0020,#0d1218)', badgeBg:'#080018', badgeColor:'#a5b4fc', badgeBorder:'#6366f160', btnBg:'#6366f1', btnColor:'#ffffff', signature:'— Ressources Humaines · Brenne Aerial', icon:'👥' },
  violet:    { topBorder:'#7c3aed', accent:'#8b5cf6', accentLight:'#0c0018', headerBg:'linear-gradient(135deg,#0c0018,#0e0020,#0d1218)', badgeBg:'#0c0018', badgeColor:'#c4b5fd', badgeBorder:'#7c3aed60', btnBg:'#7c3aed', btnColor:'#ffffff', signature:'— Pôle Data & IA · Brenne Aerial', icon:'📊' },
  slate:     { topBorder:'#475569', accent:'#64748b', accentLight:'#0a0e14', headerBg:'linear-gradient(135deg,#0a0e14,#0d1118,#0d1218)', badgeBg:'#0a0e14', badgeColor:'#94a3b8', badgeBorder:'#47556960', btnBg:'#475569', btnColor:'#ffffff', signature:'— Système Automatique · Brenne Aerial', icon:'⚙️' },
  emergency: { topBorder:'#dc2626', accent:'#ef4444', accentLight:'#1c0000', headerBg:'linear-gradient(135deg,#1c0000,#200000,#0d1218)', badgeBg:'#200000', badgeColor:'#fca5a5', badgeBorder:'#dc262680', btnBg:'#dc2626', btnColor:'#ffffff', signature:'— Cellule de Crise · Brenne Aerial', icon:'🚨' },
};

function buildEmail(userName, subject, message, senderName, senderRole, senderTheme = 'blue', attachments = []) {
  const t = THEMES[senderTheme] || THEMES.blue;
  const images = attachments.filter(a => a.type?.startsWith('image/'));
  const files = attachments.filter(a => !a.type?.startsWith('image/'));

  const imagesBlock = images.length ? `
    <div style="margin:24px 0;">
      ${images.map(img => `
        <div style="margin-bottom:12px;">
          <img src="${img.url}" style="max-width:100%;border-radius:10px;border:1px solid ${t.topBorder}30;" alt="${img.name}" />
        </div>`).join('')}
    </div>` : '';

  const filesBlock = files.length ? `
    <div style="margin:20px 0;padding:16px;background:${t.accentLight};border:1px solid ${t.topBorder}30;border-radius:10px;">
      <p style="margin:0 0 10px;font-size:11px;color:${t.accent};font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">📎 Pièces jointes</p>
      ${files.map(f => `<a href="${f.url}" style="display:block;margin:6px 0;padding:8px 14px;background:#111823;border:1px solid ${t.topBorder}20;border-radius:6px;color:${t.accent};font-size:13px;text-decoration:none;font-family:monospace;">${f.name}</a>`).join('')}
    </div>` : '';

  function parseMarkdown(text) {
    const lines = text.split('\n');
    let html = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { html += `<div style="height:10px;"></div>`; continue; }

      // Headings
      if (trimmed.startsWith('### ')) {
        html += `<h3 style="margin:18px 0 8px;font-size:16px;font-weight:700;color:#ffffff;">${renderInline(trimmed.slice(4))}</h3>`;
      } else if (trimmed.startsWith('## ')) {
        html += `<h2 style="margin:20px 0 10px;font-size:18px;font-weight:800;color:#ffffff;">${renderInline(trimmed.slice(3))}</h2>`;
      } else if (trimmed.startsWith('# ')) {
        html += `<h1 style="margin:22px 0 12px;font-size:22px;font-weight:800;color:#ffffff;">${renderInline(trimmed.slice(2))}</h1>`;
      // Bullet list
      } else if (/^[-*•] /.test(trimmed)) {
        html += `<div style="display:flex;align-items:flex-start;gap:8px;margin:0 0 8px;"><span style="color:${t.accent};font-weight:700;flex-shrink:0;">•</span><p style="margin:0;color:#c4daf0;font-size:15px;line-height:1.75;">${renderInline(trimmed.replace(/^[-*•] /, ''))}</p></div>`;
      // Horizontal rule
      } else if (/^---+$/.test(trimmed)) {
        html += `<hr style="border:none;border-top:1px solid ${t.topBorder}30;margin:20px 0;" />`;
      // Normal paragraph
      } else {
        html += `<p style="margin:0 0 14px;color:#c4daf0;font-size:15px;line-height:1.85;font-family:'Helvetica Neue',Arial,sans-serif;">${renderInline(trimmed)}</p>`;
      }
    }
    return html;
  }

  function renderInline(text) {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em style="color:#ffffff;">$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code style="background:#0a0f1a;border:1px solid ${t.topBorder}30;padding:1px 6px;border-radius:4px;font-family:monospace;font-size:13px;color:${t.accent};">$1</code>`)
      .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" style="color:${t.accent};text-decoration:underline;">$1</a>`);
  }

  const paragraphs = parseMarkdown(message);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#080d16;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080d16;padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- TOP ACCENT LINE -->
        <tr><td style="height:3px;background:linear-gradient(90deg, transparent, ${t.topBorder}, transparent);border-radius:3px 3px 0 0;"></td></tr>

        <!-- HEADER -->
        <tr><td style="background:${t.headerBg};padding:36px 44px 28px;border-left:1px solid ${t.topBorder}20;border-right:1px solid ${t.topBorder}20;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${LOGO_URL}" width="48" height="48" alt="Brenne Aerial"
                  style="display:block;border-radius:12px;border:2px solid ${t.topBorder}40;" />
              </td>
              <td style="vertical-align:middle;padding-left:14px;">
                <p style="margin:0;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.02em;">Brenne Aerial</p>
                <p style="margin:3px 0 0;font-size:10px;color:${t.accent};letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">Premium Drone Services</p>
              </td>
              <td align="right" style="vertical-align:middle;">
                <div style="display:inline-block;padding:5px 12px;background:${t.badgeBg};border:1px solid ${t.badgeBorder};border-radius:20px;">
                  <span style="font-size:10px;color:${t.badgeColor};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">${t.icon} ${senderRole}</span>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- DIVIDER LINE -->
        <tr><td style="height:1px;background:linear-gradient(90deg, transparent, ${t.topBorder}60, transparent);"></td></tr>

        <!-- GREETING BAND -->
        <tr><td style="background:#0a1220;padding:28px 44px 0;border-left:1px solid ${t.topBorder}15;border-right:1px solid ${t.topBorder}15;">
          <p style="margin:0;font-size:13px;color:#4a7a9b;font-style:italic;">Message de <strong style="color:${t.accent}">${senderName}</strong></p>
          <h1 style="margin:10px 0 0;font-size:24px;font-weight:800;color:#ffffff;line-height:1.3;">${subject}</h1>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#0a1220;padding:24px 44px 32px;border-left:1px solid ${t.topBorder}15;border-right:1px solid ${t.topBorder}15;">

          <p style="margin:0 0 22px;font-size:14px;color:#5a8aaa;">Bonjour <strong style="color:#c4daf0;">${userName}</strong>,</p>

          <div style="padding:24px;background:#060d1a;border:1px solid ${t.topBorder}20;border-left:3px solid ${t.topBorder};border-radius:0 10px 10px 0;margin-bottom:24px;">
            ${paragraphs}
          </div>

          ${imagesBlock}
          ${filesBlock}

          <!-- CTA BUTTON -->
          <div style="text-align:center;margin:32px 0 8px;">
            <a href="https://brenneaerial.fr/dashboard"
              style="display:inline-block;background:${t.btnBg};color:${t.btnColor};font-weight:800;font-size:14px;padding:15px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
              Accéder à mon espace →
            </a>
          </div>
        </td></tr>

        <!-- SIGNATURE -->
        <tr><td style="background:#060d18;padding:24px 44px;border:1px solid ${t.topBorder}15;border-top:1px solid ${t.topBorder}30;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;vertical-align:middle;">
                <div style="width:48px;height:48px;border-radius:12px;background:${t.badgeBg};border:1px solid ${t.topBorder}40;text-align:center;font-size:22px;line-height:48px;">${t.icon}</div>
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:15px;font-weight:800;color:#ffffff;">${senderName}</p>
                <p style="margin:3px 0 0;font-size:12px;color:${t.accent};">${t.signature}</p>
                <p style="margin:3px 0 0;font-size:11px;color:#3d5a7a;">contact@brenneaerial.fr</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td align="center" style="background:#040810;padding:24px 40px;border-left:1px solid ${t.topBorder}10;border-right:1px solid ${t.topBorder}10;">
          <p style="margin:0 0 8px;font-size:11px;color:#2d4a6a;letter-spacing:0.04em;">
            © ${new Date().getFullYear()} Brenne Aerial · Premium Drone Services
          </p>
          <p style="margin:0 0 8px;font-size:11px;color:#1e3040;">
            Brenne, Indre (36) · France ·
            <a href="mailto:contact@brenneaerial.fr" style="color:${t.accent};text-decoration:none;">contact@brenneaerial.fr</a>
          </p>
          <p style="margin:0;font-size:10px;color:#1a2a3a;">
            <a href="https://brenneaerial.fr/legal/privacy" style="color:#2d4a6a;text-decoration:none;">Politique de confidentialité</a>
            &nbsp;·&nbsp;
            <a href="https://brenneaerial.fr" style="color:#2d4a6a;text-decoration:none;">brenneaerial.fr</a>
          </p>
        </td></tr>

        <!-- BOTTOM ACCENT LINE -->
        <tr><td style="height:3px;background:linear-gradient(90deg, transparent, ${t.topBorder}, transparent);border-radius:0 0 3px 3px;"></td></tr>

      </table>
    </td></tr>
  </table>

</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, message, senderName, senderRole, senderTheme = 'blue', recipients, attachments = [] } = body;

    if (!subject || !message || !recipients?.length) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    let sent = 0;
    for (const recipient of recipients) {
      const html = buildEmail(
        recipient.name || 'cher client',
        subject,
        message,
        senderName,
        senderRole,
        senderTheme,
        attachments
      );
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient.email,
        subject,
        body: html,
      });
      sent++;
    }

    return Response.json({ success: true, sent });
  } catch (err) {
    console.error('Error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});