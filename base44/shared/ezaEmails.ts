// Generic eza-branded HTML email template + helpers, reusable across backend functions.

export function ezaEmailShell(title, contentHtml, opts = {}) {
  const accent = opts.accent || '#38bdf8';
  const footerNote = opts.footerNote || "Cet email a été envoyé depuis la plateforme eza.";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#e6edf3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:28px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0d1426;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:26px 32px 18px;border-bottom:1px solid #1e293b;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${accent};">eza</span>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">${opts.tagline || 'Command center'}</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#f1f5f9;">${title}</h1>
          ${contentHtml}
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #1e293b;">
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
            ${footerNote}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Minimal plain-text → safe HTML (paragraphs, line breaks, bold **x**, bullets)
export function textToHtml(text) {
  if (!text) return '';
  const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { html.push('</ul>'); inList = false; }
      continue;
    }
    let processed = escape(line)
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f1f5f9;">$1</strong>');
    const bullet = processed.replace(/^[-•]\s+/, '');
    const isBullet = processed !== bullet;
    if (isBullet) {
      if (!inList) { html.push('<ul style="margin:8px 0;padding-left:20px;">'); inList = true; }
      html.push(`<li style="font-size:15px;line-height:1.6;color:#cbd5e1;margin:4px 0;">${bullet}</li>`);
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#cbd5e1;">${processed}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

// Send a branded eza email to one or many recipients (registered users only via SendEmail).
// Returns a per-recipient delivery report.
export async function sendEzaEmail(base44, { to, subject, body, fromName, title, tagline }) {
  const recipients = Array.isArray(to)
    ? to
    : String(to || '').split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
  if (recipients.length === 0) {
    return { success: false, error: 'Aucun destinataire valide' };
  }
  const html = ezaEmailShell(title || subject, textToHtml(body), { tagline });
  const results = [];
  for (const recipient of recipients) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        from_name: fromName || 'eza — Direction',
        subject,
        body: html,
      });
      results.push({ to: recipient, ok: true });
    } catch (e) {
      results.push({ to: recipient, ok: false, error: e.message });
    }
  }
  const okCount = results.filter(r => r.ok).length;
  return {
    success: okCount > 0,
    delivered: okCount,
    total: recipients.length,
    results,
    message: `${okCount}/${recipients.length} email(s) envoyé(s)`,
  };
}