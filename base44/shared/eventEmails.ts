import { ezaEmailShell, textToHtml } from './ezaEmails.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://eza.social';

export async function getAdminEmails(base44) {
  try {
    const admins = await base44.asServiceRole.entities.User.filter(
      { role: { $in: ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'] } },
      '-created_date', 50
    );
    return (admins || []).map(a => a.email).filter(Boolean);
  } catch {
    return [];
  }
}

// Emails des organisateurs d'un événement (créateur + rôle event_manager)
export async function getOrganizerEmails(base44, event) {
  const emails = new Set();
  try {
    if (event?.organizer_id) {
      const org = await base44.asServiceRole.entities.User.get(event.organizer_id);
      if (org?.email) emails.add(org.email);
    }
  } catch {}
  try {
    const managers = await base44.asServiceRole.entities.User.filter(
      { role: 'event_manager' }, '-created_date', 50
    );
    for (const m of managers || []) if (m.email) emails.add(m.email);
  } catch {}
  return [...emails];
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:9px 16px;border-bottom:1px solid rgba(56,170,220,0.06);">
      <span style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#38aadc;opacity:0.7;">${label}</span>
    </td>
    <td style="padding:9px 16px;border-bottom:1px solid rgba(56,170,220,0.06);">
      <span style="font-size:13px;color:#c8d8e8;font-weight:500;">${value || '—'}</span>
    </td>
  </tr>`;
}

function eventInfoBlock(ctx) {
  const rows = [
    infoRow('Événement', ctx.event_title),
    infoRow('Date', ctx.event_date || '—'),
    infoRow('Lieu', ctx.event_city || (ctx.event_format === 'online' ? 'En ligne' : '—')),
  ];
  if (ctx.credits !== undefined && ctx.credits !== null)
    rows.push(infoRow('Crédits', ctx.credits > 0 ? `${ctx.credits} crédits Eza` : 'Gratuit'));
  return `<div style="border-radius:12px;overflow:hidden;border:1px solid rgba(56,170,220,0.15);margin-bottom:24px;">
    <div style="background:rgba(56,170,220,0.08);padding:12px 16px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;">Récapitulatif</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(8,16,32,0.6);">
      ${rows.join('')}
    </table>
  </div>`;
}

function cta(label, url) {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:8px;">
    <tr><td style="border-radius:10px;background:linear-gradient(135deg,#1a6aaa,#38aadc);">
      <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`;
}

function buildEmail(type, ctx) {
  const evBlock = eventInfoBlock(ctx);
  const reasonBlock = ctx.reason ? `<div style="background:rgba(56,170,220,0.06);border:1px solid rgba(56,170,220,0.15);border-left:3px solid #38aadc;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#38aadc;opacity:0.8;">Motif</p>
    <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${textToHtml(ctx.reason)}</p>
  </div>` : '';

  const noteBlock = ctx.note ? `<div style="background:rgba(56,170,220,0.06);border:1px solid rgba(56,170,220,0.15);border-radius:10px;padding:16px 18px;margin-bottom:24px;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#38aadc;opacity:0.8;">Message de l'équipe</p>
    <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${textToHtml(ctx.note)}</p>
  </div>` : '';

  let title, content;

  if (type === 'registration_confirmed') {
    title = 'Votre inscription est confirmée !';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Votre inscription à l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong> a bien été enregistrée${ctx.credits > 0 ? ` — <strong style="color:#38aadc;">${ctx.credits} crédits Eza</strong> débités` : ''}.
      Nous vous attendons avec impatience !
    </p>${evBlock}${cta('Voir l\'événement →', `${APP_URL}/events/${ctx.event_id}`)}`;
  } else if (type === 'new_registration') {
    title = 'Nouvelle inscription événement';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      <strong style="color:#a0c0d8;">${ctx.user_name}</strong> (${ctx.user_email}) vient de s'inscrire à l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong>.
    </p>${evBlock}${cta('Gérer les inscriptions →', `${APP_URL}/admin/events`)}`;
  } else if (type === 'cancellation_request_received') {
    title = 'Demande d\'annulation reçue';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Votre demande d'annulation pour l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong> a bien été transmise à notre équipe.
      Elle sera examinée et vous recevrez une réponse par email${ctx.credits > 0 ? `. Si elle est approuvée, vos <strong style="color:#38aadc;">${ctx.credits} crédits Eza</strong> vous seront rendus` : ''}.
    </p>${reasonBlock}${evBlock}<p style="margin:16px 0 0;font-size:13px;color:#64748b;">Statut : <strong style="color:#f59e0b;">En attente de validation</strong></p>`;
  } else if (type === 'cancellation_requested_admin') {
    title = 'Demande d\'annulation à examiner';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      <strong style="color:#a0c0d8;">${ctx.user_name}</strong> (${ctx.user_email}) demande l'annulation de son inscription à <strong style="color:#f1f5f9;">${ctx.event_title}</strong>${ctx.credits > 0 ? ` — ${ctx.credits} crédits à rembourser` : ''}.
    </p>${reasonBlock}${evBlock}${cta('Traiter la demande →', `${APP_URL}/admin/events`)}`;
  } else if (type === 'cancellation_approved') {
    title = 'Annulation approuvée';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Votre demande d'annulation pour <strong style="color:#f1f5f9;">${ctx.event_title}</strong> a été <strong style="color:#22c55e;">approuvée</strong>${ctx.refund_amount > 0 ? ` et vos <strong style="color:#38aadc;">${ctx.refund_amount} crédits Eza</strong> vous ont été rendus` : ''}.
    </p>${evBlock}${noteBlock}`;
  } else if (type === 'cancellation_rejected') {
    title = 'Demande d\'annulation refusée';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Votre demande d'annulation pour <strong style="color:#f1f5f9;">${ctx.event_title}</strong> n'a pas pu être acceptée. Votre inscription reste donc active.
    </p>${evBlock}${noteBlock}${cta('Voir l\'événement →', `${APP_URL}/events/${ctx.event_id}`)}`;
  } else if (type === 'admin_refund') {
    title = 'Remboursement effectué';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Un remboursement de <strong style="color:#38aadc;">${ctx.refund_amount} crédits Eza</strong> a été effectué sur votre compte pour l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong>.
    </p>${evBlock}${noteBlock}`;
  } else if (type === 'admin_cancel_registration') {
    title = 'Inscription annulée';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Votre inscription à l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong> a été annulée par l'administration${ctx.refund_amount > 0 ? `. Vos <strong style="color:#38aadc;">${ctx.refund_amount} crédits Eza</strong> vous ont été rendus` : ' (sans remboursement)'}.
    </p>${evBlock}${noteBlock}`;
  } else if (type === 'event_cancelled') {
    title = 'Événement annulé';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      L'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong> auquel vous étiez inscrit a été annulé par l'organisation${ctx.refund_amount > 0 ? `. Vos <strong style="color:#38aadc;">${ctx.refund_amount} crédits Eza</strong> vous ont été automatiquement rendus` : ''}.
    </p>${reasonBlock}${evBlock}`;
  } else if (type === 'admin_registered') {
    title = 'Inscription confirmée par l\'administration';
    content = `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#cbd5e1;">
      Bonjour <strong style="color:#a0c0d8;">${ctx.user_name}</strong>,<br/>
      Vous avez été inscrit(e) par l'administration à l'événement <strong style="color:#f1f5f9;">${ctx.event_title}</strong>${ctx.credits > 0 ? ` — <strong style="color:#38aadc;">${ctx.credits} crédits Eza</strong> débités` : ''}.
    </p>${evBlock}${cta('Voir l\'événement →', `${APP_URL}/events/${ctx.event_id}`)}`;
  } else {
    return null;
  }

  return ezaEmailShell(title, content, { tagline: 'Événements' });
}

const SUBJECTS = {
  registration_confirmed: '🎫 Inscription confirmée — eza',
  new_registration: '📥 Nouvelle inscription — eza',
  cancellation_request_received: '⏳ Demande d\'annulation reçue — eza',
  cancellation_requested_admin: '🔎 Demande d\'annulation à examiner — eza',
  cancellation_approved: '✅ Annulation approuvée — eza',
  cancellation_rejected: 'Demande refusée — eza',
  admin_refund: '💳 Remboursement effectué — eza',
  admin_cancel_registration: 'Inscription annulée — eza',
  event_cancelled: 'Événement annulé — eza',
  admin_registered: '🎫 Inscription confirmée — eza',
};

export async function sendEventEmail(base44, type, ctx, recipients) {
  const html = buildEmail(type, ctx);
  if (!html) return { sent: 0 };
  const to = Array.isArray(recipients) ? recipients : [recipients];
  let sent = 0;
  for (const email of to) {
    if (!email) continue;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'eza — Événements',
        subject: SUBJECTS[type] || 'eza',
        body: html,
      });
      sent++;
    } catch {}
  }
  return { sent };
}