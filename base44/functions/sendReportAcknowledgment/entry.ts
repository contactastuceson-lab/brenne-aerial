import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emailShell, REASON_LABELS } from '../../shared/reportEmails.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { reportId, reporterEmail, reporterName, targetName, targetType, reason } = await req.json();

    if (!reporterEmail) {
      return Response.json({ error: 'reporterEmail requis' }, { status: 400 });
    }

    const reasonLabel = REASON_LABELS[reason] || reason || 'Non précisée';
    const targetLabel = targetName || (targetType === 'user' ? 'un utilisateur' : 'un contenu');

    const content = `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">Bonjour ${reporterName || ''},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">
        Merci d'avoir signalé ${targetType === 'user' ? 'le profil' : 'le contenu'} <strong style="color:#f1f5f9;">${targetLabel}</strong>
        pour la raison : <strong style="color:#f1f5f9;">${reasonLabel}</strong>.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">
        Notre équipe de modération examine chaque signalement avec attention. Vous serez tenu·e informé·e
        de chaque évolution de votre dossier (prise en charge, verdict final).
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:18px 0;">
        <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px 16px;">
          <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Référence</p>
          <p style="margin:4px 0 0;font-size:13px;color:#e2e8f0;font-family:monospace;">${reportId || '—'}</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#94a3b8;">
        Vous pouvez suivre l'avancement de votre signalement à tout moment depuis votre Espace Utilisateur.
      </p>
    `;

    await base44.integrations.Core.SendEmail({
      to: reporterEmail,
      subject: `eza · Signalement bien reçu, merci`,
      body: emailShell('Merci pour votre signalement', content),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}