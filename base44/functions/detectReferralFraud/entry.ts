import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

// Tâche planifiée quotidienne : détecte les parrainages suspects (volume anormal
// sur 7 jours, auto-parrainage parrain=filleul) et marque ces Referral pour
// vérification admin, + notifie les admins par email. N'inflige aucun débit de
// crédits — seulement du signalement.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const referrals = await base44.asServiceRole.entities.Referral.list('-created_date', 500).catch(() => []);
    if (!referrals || !referrals.length) return Response.json({ ok: true, flagged: 0 });

    const since = Date.now() - 7 * 24 * 3600 * 1000;
    const counts = {};
    for (const r of referrals) {
      if (!r.referrer_email) continue;
      if (r.created_date && new Date(r.created_date).getTime() > since) {
        counts[r.referrer_email] = (counts[r.referrer_email] || 0) + 1;
      }
    }
    const highVolume = new Set(
      Object.entries(counts).filter(([, n]) => n > 8).map(([e]) => e.toLowerCase())
    );

    let flagged = 0;
    for (const r of referrals) {
      if (r.status === 'rewarded') continue;
      if (r.admin_notes && String(r.admin_notes).includes('Fraude suspectée')) continue;

      const reasons = [];
      if (r.referrer_email && highVolume.has(r.referrer_email.toLowerCase()))
        reasons.push(`volume élevé (${counts[r.referrer_email]} filleuls en 7j)`);
      if (
        r.referrer_email &&
        r.referred_email &&
        r.referrer_email.toLowerCase() === r.referred_email.toLowerCase()
      )
        reasons.push('parrain = filleul');

      if (!reasons.length) continue;

      await base44.asServiceRole.entities.Referral.update(r.id, {
        admin_notes: `Fraude suspectée — ${reasons.join(' ; ')}`,
      }).catch(() => {});
      flagged++;
    }

    if (flagged > 0) {
      const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
      const emails = (admins || []).filter((u) => u.role === 'admin').map((u) => u.email);
      if (emails.length) {
        await sendEzaEmail(base44, {
          to: emails,
          subject: `🚨 ${flagged} parrainage(s) suspect(s) détectés`,
          title: 'Anti-fraude parrainage',
          body: `L'analyse automatique a détecté **${flagged}** parrainage(s) présentant des motifs suspects (volume élevé, auto-parrainage…).\n\nIls ont été marqués pour vérification dans l'administration → onglet Économie / Parrainages.`,
          tagline: 'Sécurité eza',
        }).catch(() => {});
      }
    }

    return Response.json({ ok: true, flagged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}