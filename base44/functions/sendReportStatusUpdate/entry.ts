import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emailShell, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, REASON_LABELS } from '../../shared/reportEmails.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reportId, reporterEmail, reporterName, targetName, targetType, reason, newStatus, adminNotes } = await req.json();

    if (!reporterEmail) {
      return Response.json({ error: 'reporterEmail requis' }, { status: 400 });
    }

    const statusLabel = REPORT_STATUS_LABELS[newStatus] || newStatus;
    const statusColor = REPORT_STATUS_COLORS[newStatus] || '#64748b';
    const reasonLabel = REASON_LABELS[reason] || reason || 'Non précisée';
    const targetLabel = targetName || (targetType === 'user' ? 'un utilisateur' : 'un contenu');

    const statusMessages = {
      reviewing: "Votre signalement a été pris en charge par notre équipe de modération et est actuellement examiné.",
      reviewed: "Votre signalement a été examiné par notre équipe de modération.",
      resolved: "Les mesures appropriées ont été prises suite à votre signalement. Merci d'avoir contribué à améliorer la communauté eza.",
      dismissed: "Après examen, ce signalement n'a pas entraîné d'action. Vous pouvez soumettre un nouveau signalement si nécessaire.",
      pending: "Le statut de votre signalement a été remis en attente.",
    };

    const statusMsg = statusMessages[newStatus] || "Le statut de votre signalement a été mis à jour.";

    const notesHtml = adminNotes ? `
      <table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px 16px;">
          <p style="margin:0 0 6px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Notes de modération</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#e2e8f0;">${String(adminNotes).replace(/</g, '&lt;')}</p>
        </td></tr>
      </table>` : '';

    const content = `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">Bonjour ${reporterName || ''},</p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">
        Le statut de votre signalement concernant ${targetType === 'user' ? 'le profil' : 'le contenu'}
        <strong style="color:#f1f5f9;">${targetLabel}</strong> (raison : ${reasonLabel}) a été mis à jour.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:8px 0 16px;">
        <tr><td style="background:${statusColor}1a;border:1px solid ${statusColor}66;border-radius:999px;padding:8px 16px;">
          <span style="font-size:14px;font-weight:600;color:${statusColor};">● ${statusLabel}</span>
        </td></tr>
      </table>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">${statusMsg}</p>
      ${notesHtml}
      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#94a3b8;">
        Suivez l'historique complet depuis votre Espace Utilisateur.
      </p>
    `;

    await base44.integrations.Core.SendEmail({
      to: reporterEmail,
      subject: `eza · Mise à jour de votre signalement — ${statusLabel}`,
      body: emailShell(`Mise à jour : ${statusLabel}`, content),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}