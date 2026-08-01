import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Campagne d'activation du programme de parrainage eza.
// But : accélérer l'acquisition membres pour dépasser le seuil critique des 50 utilisateurs.
// Actions : email personnalisé (code + lien) à chaque membre, annonce in-app, traçage.
// Déclenchement manuel depuis le tableau de bord Automatisations.

const APP_URL = Deno.env.get('APP_URL') || 'https://eza.group';

const OFFER_BODY = `Cette semaine, eza lance une **campagne d'activation du parrainage**.

**Comment ça marche ?**
- Partagez votre lien personnel ci-dessous à vos contacts
- À chaque inscription validée, vous gagnez des crédits Eza
- Des **bonus jalons** s'ajoutent au 5e, 10e et 20e filleul

**Votre lien de parrainage**
{REF_LINK}

**Objectif collectif : 50 membres**
Nous y sommes presque — votre réseau peut faire la différence. Un seul partage peut rapporter jusqu'à plusieurs centaines de crédits.

Faites vivre eza, agrandissez le cercle.

— Nexus, IA de direction eza`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const [users, existingAnn] = await Promise.all([
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.Announcement.list().catch(() => []),
    ]);

    const members = (users || []).filter((u) => u.email);
    let emailed = 0;
    let failed = 0;

    // Email personnalisé (limite 250 pour éviter la saturation)
    for (const u of members.slice(0, 250)) {
      const refCode = u.username || u.email.split('@')[0];
      const refLink = `${APP_URL}/parrainage?ref=${encodeURIComponent(refCode)}`;
      const body = OFFER_BODY.replace('{REF_LINK}', refLink);
      try {
        await sendEzaEmail(base44, {
          to: u.email,
          subject: '🚀 Parrainez, gagnez — campagne de lancement eza',
          title: 'Campagne de parrainage eza',
          body,
          tagline: 'Nexus — Acquisition',
        });
        emailed++;
      } catch {
        failed++;
      }
    }

    // Annonce in-app (évite le doublon si déjà active)
    const already = (existingAnn || []).some(
      (a) => a.title && a.title.includes('Campagne de parrainage')
    );
    let announcementId = null;
    if (!already) {
      try {
        const ann = await base44.asServiceRole.entities.Announcement.create({
          title: 'Campagne de parrainage eza — objectif 50 membres',
          content:
            'Partagez votre lien de parrainage et gagnez des crédits à chaque filleul, plus des bonus jalons au 5e, 10e et 20e. ' +
            "C'est maintenant que le réseau s'agrandit — un seul partage peut tout changer.",
          type: 'success',
          is_active: true,
          target: 'all',
        });
        announcementId = ann?.id || null;
      } catch {}
    }

    // Campagne pub dédiée parrainage (si aucune active ciblée)
    let campaignId = null;
    try {
      const active = await base44.asServiceRole.entities.AdCampaign.filter({
        status: 'active',
      }).catch(() => []);
      const hasReferral = active.some(
        (c) => c.cta_url && String(c.cta_url).includes('parrainage')
      );
      if (!hasReferral && members.length) {
        const owner = members.find((u) => u.role === 'owner' || u.role === 'admin') || members[0];
        const camp = await base44.asServiceRole.entities.AdCampaign.create({
          title: "Campagne d'activation — Parrainage eza",
          advertiser_name: 'eza',
          headline: 'Parrainez vos amis, gagnez des crédits',
          body: "Chaque inscription validée rapporte des crédits + bonus jalons. Objectif : 50 membres ensemble.",
          cta_label: 'Obtenir mon code',
          cta_url: `${APP_URL}/parrainage`,
          placement: 'feed_banner',
          budget_credits: 200,
          daily_budget: 20,
          credits_remaining: 200,
          estimated_reach: 10000,
          status: 'active',
          starts_at: new Date().toISOString(),
          owner_id: owner.id,
        });
        campaignId = camp?.id || null;
      }
    } catch {}

    await logAutomation(base44, {
      automation_name: 'launch_referral_activation',
      label: "Campagne d'activation parrainage",
      category: 'retention',
      status: emailed > 0 ? 'success' : 'warning',
      summary: `${emailed} email(s) envoyés, ${failed} échec(s)${announcementId ? ', annonce créée' : ''}${campaignId ? ', campagne pub créée' : ''}`,
      details: `Membres ciblés : ${members.length}. Lien type : ${APP_URL}/parrainage?ref=<username>. Objectif : dépasser 50 membres.`,
      count: emailed,
    });

    return Response.json({
      ok: true,
      total_members: members.length,
      emailed,
      failed,
      announcement_id: announcementId,
      campaign_id: campaignId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}