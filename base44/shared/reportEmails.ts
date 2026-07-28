// Shared eza branding + helpers for report-related emails.

export const EZA_BRAND = "eza";

export function emailShell(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#e6edf3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:24px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0d1426;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #1e293b;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#38bdf8;">eza</span>
          <p style="margin:6px 0 0;font-size:12px;color:#64748b;">Command center · Modération</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#f1f5f9;">${title}</h1>
          ${contentHtml}
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #1e293b;">
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
            Cet email vous a été envoyé car vous avez effectué une action sur la plateforme eza.
            Suivez vos signalements depuis votre <a href="${getAppUrl()}/espace?tab=reports" style="color:#38bdf8;text-decoration:none;">Espace Utilisateur</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function getAppUrl() {
  return "https://eza.group";
}

export const REPORT_STATUS_LABELS = {
  pending: "En attente",
  reviewing: "En cours d'examen",
  reviewed: "Examiné",
  resolved: "Résolu",
  dismissed: "Rejeté",
};

export const REPORT_STATUS_COLORS = {
  pending: "#f59e0b",
  reviewing: "#3b82f6",
  reviewed: "#3b82f6",
  resolved: "#22c55e",
  dismissed: "#ef4444",
};

export const REASON_LABELS = {
  spam: "Spam",
  harcelement: "Harcèlement",
  contenu_inapproprie: "Contenu inapproprié",
  usurpation: "Usurpation d'identité",
  autre: "Autre",
};