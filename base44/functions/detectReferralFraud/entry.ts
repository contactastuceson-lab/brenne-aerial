import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne : détecte les parrainages suspects :
//  - volume anormal (> 8 filleuls en 7j)
//  - auto-parrainage (parrain = filleul)
//  - MÊME IP ou MÊME APPAREIL entre parrain et filleul (DeviceSession)
// Marque les Referral concernés (bloque les crédits de parrainage — reste 'pending'),
// ouvre un ticket admin (Notification) et enregistre dans le journal d'automatisation.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [referrals, sessions] = await Promise.all([
      base44.asServiceRole.entities.Referral.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.DeviceSession.list('-created_at', 500).catch(() => []),
    ]);
    if (!referrals || !referrals.length) {
      await logAutomation(base44, {
        automation_name: 'detect_referral_fraud',
        label: 'Anti-fraude parrainage',
        category: 'fraud', status: 'success',
        summary: 'Aucun parrainage à analyser', count: 0,
      });
      return Response.json({ ok: true, flagged: 0 });
    }

    // Volume sur 7 jours
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    const counts = {};
    for (const r of referrals) {
      if (r.referrer_email && r.created_date && new Date(r.created_date).getTime() > since) {
        counts[r.referrer_email] = (counts[r.referrer_email] || 0) + 1;
      }
    }
    const highVolume = new Set(
      Object.entries(counts).filter(([, n]) => n > 8).map(([e]) => e.toLowerCase())
    );

    // Empreintes matérielles par email
    const devByEmail = {};
    for (const s of (sessions || [])) {
      if (!s.user_email) continue;
      const e = String(s.user_email).toLowerCase();
      if (!devByEmail[e]) devByEmail[e] = { ips: new Set(), fps: new Set() };
      if (s.ip_address) devByEmail[e].ips.add(s.ip_address);
      if (s.fingerprint) devByEmail[e].fps.add(s.fingerprint);
    }

    let flagged = 0;
    const cases = [];
    for (const r of referrals) {
      if (r.status === 'rewarded') continue;
      if (r.admin_notes && String(r.admin_notes).includes('Fraude suspectée')) continue;

      const reasons = [];
      if (r.referrer_email && highVolume.has(r.referrer_email.toLowerCase()))
        reasons.push(`volume élevé (${counts[r.referrer_email]} filleuls en 7j)`);
      if (r.referrer_email && r.referred_email &&
          r.referrer_email.toLowerCase() === r.referred_email.toLowerCase())
        reasons.push('parrain = filleul');

      const refDev = devByEmail[(r.referrer_email || '').toLowerCase()];
      const recDev = devByEmail[(r.referred_email || '').toLowerCase()];
      if (refDev && recDev) {
        if ([...refDev.ips].some((ip) => recDev.ips.has(ip))) reasons.push('même IP que le filleul');
        if ([...refDev.fps].some((fp) => recDev.fps.has(fp))) reasons.push('même appareil que le filleul');
      }

      if (!reasons.length) continue;

      await base44.asServiceRole.entities.Referral.update(r.id, {
        admin_notes: `Fraude suspectée — ${reasons.join(' ; ')}`,
      }).catch(() => {});
      flagged++;
      cases.push(`• ${r.referrer_email} → ${r.referred_email || '?'} : ${reasons.join(' ; ')}`);
    }

    if (flagged > 0) {
      const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
      const emails = (admins || []).filter((u) => u.role === 'admin').map((u) => u.email);
      if (emails.length) {
        await sendEzaEmail(base44, {
          to: emails,
          subject: `🚨 ${flagged} parrainage(s) suspect(s) détectés`,
          title: 'Anti-fraude parrainage',
          body: `L'analyse automatique a détecté **${flagged}** parrainage(s) suspects.\n\nMotifs : volume anormal, auto-parrainage, ou même IP/appareil entre parrain et filleul.\n\nCrédits de parrainage **bloqués** (statut conservé en attente).\n\nCas :\n${cases.join('\n')}\n\n→ Administration → Économie / Parrainages.`,
          tagline: 'Sécurité eza',
        }).catch(() => {});
        // Ticket admin (notification in-app)
        for (const adminEmail of emails) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: adminEmail,
            type: 'system',
            title: `🚨 ${flagged} parrainage(s) suspect(s) — ticket à traiter`,
            content: `Anti-fraude : ${flagged} cas détectés (IP/appareil/volume). Crédits bloqués. Voir Économie → Parrainages.`,
            sender_name: 'Nexus Anti-fraude',
          }).catch(() => {});
        }
      }
    }

    await logAutomation(base44, {
      automation_name: 'detect_referral_fraud',
      label: 'Anti-fraude parrainage',
      category: 'fraud',
      status: flagged > 0 ? 'warning' : 'success',
      summary: flagged > 0 ? `${flagged} parrainage(s) suspect(s) — crédits bloqués` : 'Aucune anomalie détectée',
      details: cases.length ? cases.join('\n') : '',
      count: flagged,
    });

    return Response.json({ ok: true, flagged });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}