import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { emailShell } from '../../shared/reportEmails.ts';

const REASON_LABELS = {
  spam: 'Spam',
  harcelement: 'Harcèlement',
  contenu_inapproprie: 'Contenu inapproprié',
  usurpation: 'Usurpation d\'identité',
  discours_haineux: 'Discours haineux',
  violence: 'Violence / menace',
  mise_en_danger: 'Mise en danger',
  illegal: 'Contenu illégal',
  autre: 'Autre',
};

const TARGET_LABELS = {
  user: 'Utilisateur',
  message: 'Message',
  post: 'Publication',
  discussion: 'Discussion',
  discussion_reply: 'Réponse',
  forum_topic: 'Sujet forum',
  forum_post: 'Message forum',
  community: 'Communauté',
  space: 'Space audio',
  story: 'Story',
  event: 'Événement',
  review: 'Avis',
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportId, reporterName, targetName, targetType, reason } = await req.json();

    // Récupère tous les admins (service role)
    const admins = await base44.asServiceRole.entities.User.list();
    const adminEmails = admins
      .filter(u => u.role === 'admin' || u.role === 'owner' || u.role === 'pdg_adjoint' || u.role === 'conseil_admin')
      .map(u => u.email)
      .filter(Boolean);

    if (adminEmails.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    const reasonLabel = REASON_LABELS[reason] || reason || 'Non précisée';
    const targetLabel = targetName || TARGET_LABELS[targetType] || 'Contenu';
    const targetTypeName = TARGET_LABELS[targetType] || 'Contenu';

    // Crée une notification in-app pour chaque admin
    await Promise.all(
      adminEmails.map(adminEmail =>
        base44.entities.Notification.create({
          user_email: adminEmail,
          type: 'system',
          title: `Nouveau signalement : ${targetLabel}`,
          content: `${reporterName} a signalé ${targetTypeName.toLowerCase()} (${reasonLabel})`,
          is_read: false,
          link: '/admin/reports',
        }).catch(() => {})
      )
    );

    // Envoie un email à chaque admin
    const emailContent = `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#cbd5e1;">
        Un nouveau signalement a été soumis sur <strong style="color:#f1f5f9;">eza</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 18px;width:100%;max-width:420px;">
        <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px 16px;">
          <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Signaleur</p>
          <p style="margin:0 0 12px;font-size:14px;color:#e2e8f0;">${reporterName || 'Anonyme'}</p>
          <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Cible</p>
          <p style="margin:0 0 12px;font-size:14px;color:#e2e8f0;">${targetTypeName} · ${targetLabel}</p>
          <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Raison</p>
          <p style="margin:0;font-size:14px;color:#e2e8f0;">${reasonLabel}</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#94a3b8;">
        Consultez le panel d'administration pour examiner ce signalement.
      </p>
    `;

    await Promise.all(
      adminEmails.map(adminEmail =>
        base44.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `eza · Nouveau signalement — ${targetLabel}`,
          body: emailShell('Nouveau signalement', emailContent),
        }).catch(() => {})
      )
    );

    return Response.json({ success: true, notified: adminEmails.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}