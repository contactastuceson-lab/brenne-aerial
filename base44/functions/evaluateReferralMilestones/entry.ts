import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

// Crédits par jalon — doit rester synchronisé avec src/lib/referralMilestones.js
const MILESTONE_CREDITS: Record<string, number> = {
  signup: 50,
  profile_complete: 10,
  first_post: 20,
  likes_100: 30,
  badge: 30,
  verified: 40,
  join_community: 15,
  first_space: 25,
  forum: 15,
  premium: 100,
  business: 150,
  enterprise: 200,
  referral: 20,
  active_30d: 50,
  mentioned: 10,
};

const MILESTONE_LABELS: Record<string, string> = {
  signup: 'Inscription du filleul',
  profile_complete: 'Profil complété',
  first_post: '1er post publié',
  likes_100: '100 likes reçus',
  badge: '1er badge obtenu',
  verified: 'Compte vérifié',
  join_community: 'Communauté rejointe',
  first_space: '1er Space créé',
  forum: 'Participation au forum',
  premium: 'Abonnement Premium',
  business: 'Abonnement Business',
  enterprise: 'Abonnement Enterprise',
  referral: 'Filleul parraine à son tour',
  active_30d: 'Actif depuis 30 jours',
  mentioned: 'Mentionné dans un post',
};

function perkActive(v: any): boolean {
  if (v === true || v === null) return true;
  if (typeof v === 'string') return new Date(v).getTime() > Date.now();
  return false;
}

// Évalue les jalons atteints par chaque filleul et crédite idempotent le parrain.
// Body optionnel : { referrerEmail } — limite au parrain courant (bouton "Vérifier").
// Sans argument : traite tous les parrainages (automation planifiée).
export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body: any = {};
    try { body = await req.json(); } catch {}

    // Si referrerEmail fourni, vérifier que c'est l'utilisateur connecté (sécurité)
    const referrerEmail: string | undefined = body?.referrerEmail;
    if (referrerEmail && referrerEmail !== user.email) {
      return Response.json({ error: 'Vous ne pouvez évaluer que vos propres filleuls' }, { status: 403 });
    }

    const filter = referrerEmail ? { referrer_email: referrerEmail } : {};
    const referrals = await base44.asServiceRole.entities.Referral.filter(filter, '-created_date', 300);
    if (!referrals || referrals.length === 0) {
      return Response.json({ success: true, evaluated: 0, awarded: 0, details: 'Aucun parrainage' });
    }

    let totalAwarded = 0;
    let evaluated = 0;
    const summary: string[] = [];

    for (const ref of referrals) {
      if (!ref.referred_user_id && !ref.referred_email) continue;
      evaluated++;

      // Jalons déjà récompensés (signup toujours acquis car le parrainage existe)
      const already: string[] = ref.milestones_rewarded && ref.milestones_rewarded.length > 0
        ? [...ref.milestones_rewarded]
        : (ref.status === 'validated' || ref.status === 'rewarded' ? ['signup'] : []);
      if (!already.includes('signup')) already.push('signup');

      // Récupérer l'utilisateur filleul
      let ru: any = null;
      try {
        if (ref.referred_user_id) ru = await base44.asServiceRole.entities.User.get(ref.referred_user_id);
        if (!ru) {
          const us = await base44.asServiceRole.entities.User.filter({ email: ref.referred_email }, null, 1);
          ru = us?.[0] || null;
        }
      } catch {}
      if (!ru) continue;

      const achieved: string[] = ['signup'];

      // — Jalons basés sur le profil utilisateur —
      if (ru.display_name && ru.bio && ru.avatar_url) achieved.push('profile_complete');
      if ((ru.verifications?.length || 0) > 0 || (ru.badges?.length || 0) > 0) achieved.push('badge');
      if (ru.verified_status === 'yes') achieved.push('verified');
      if (perkActive(ru.perks?.premium_until)) achieved.push('premium');
      if (perkActive(ru.perks?.business_until)) achieved.push('business');
      if (perkActive(ru.perks?.enterprise_until)) achieved.push('enterprise');
      if (ru.created_date && new Date(ru.created_date).getTime() < Date.now() - 30 * 86400000) achieved.push('active_30d');

      // — 1er post + cumul likes —
      try {
        const posts = await base44.asServiceRole.entities.Post.filter({ author_id: ru.id }, '-created_date', 50);
        if (posts && posts.length > 0) {
          achieved.push('first_post');
          const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
          if (totalLikes >= 100) achieved.push('likes_100');
        }
      } catch {}

      // — 1er Space —
      try {
        const spaces = await base44.asServiceRole.entities.Space.filter({ host_id: ru.id }, null, 1);
        if (spaces && spaces.length > 0) achieved.push('first_space');
      } catch {}

      // — Forum (discussion ou réponse) —
      try {
        const disc = await base44.asServiceRole.entities.Discussion.filter({ author_id: ru.id }, null, 1);
        if (disc && disc.length > 0) {
          achieved.push('forum');
        } else {
          const reps = await base44.asServiceRole.entities.DiscussionReply.filter({ author_id: ru.id }, null, 1);
          if (reps && reps.length > 0) achieved.push('forum');
        }
      } catch {}

      // — Communauté rejointe (member_ids contient ru.id) —
      try {
        const comms = await base44.asServiceRole.entities.Community.list('-created_date', 200);
        if (comms && comms.some((c: any) => (c.member_ids || []).includes(ru.id))) achieved.push('join_community');
      } catch {}

      // — Filleul devient parrain —
      try {
        const subRefs = await base44.asServiceRole.entities.Referral.filter({ referrer_email: ru.email }, null, 1);
        if (subRefs && subRefs.length > 0) achieved.push('referral');
      } catch {}

      // — Mentionné dans un post —
      if (ru.username) {
        try {
          const recent = await base44.asServiceRole.entities.Post.list('-created_date', 200);
          if (recent && recent.some((p: any) => (p.mentions || []).includes(ru.username))) achieved.push('mentioned');
        } catch {}
      }

      // Nouveaux jalons non encore récompensés
      const newMilestones = achieved.filter((m) => !already.includes(m));
      if (newMilestones.length === 0) continue;

      const addCredits = newMilestones.reduce((s, m) => s + (MILESTONE_CREDITS[m] || 0), 0);
      const updatedRewarded = Array.from(new Set([...already, ...achieved]));
      const newCreditsEarned = (ref.credits_earned || 50) + addCredits;

      // Créditer le parrain
      let referrer: any = null;
      try {
        const refs = await base44.asServiceRole.entities.User.filter({ email: ref.referrer_email }, null, 1);
        referrer = refs?.[0] || null;
      } catch {}
      if (referrer) {
        const newBalance = (referrer.referral_credits || 0) + addCredits;
        await base44.asServiceRole.entities.User.update(referrer.id, { referral_credits: newBalance });

        waitUntil(
          base44.integrations.Core.SendEmail({
            to: referrer.email,
            subject: `🎉 ${newMilestones.length} nouveau(x) jalon(x) de parrainage !`,
            body: `Bonjour ${referrer.display_name || referrer.username},\n\nVotre filleul ${ru.display_name || ru.username} vient d'atteindre de nouveaux jalons :\n\n${newMilestones.map((m) => `• ${MILESTONE_LABELS[m] || m} (+${MILESTONE_CREDITS[m]} crédits)`).join('\n')}\n\nVous avez gagné ${addCredits} crédits.\nNouveau solde : ${newBalance} crédits.\n\nContinuez à accompagner vos filleuls pour débloquer plus de récompenses.\n\n— L'équipe Eza`,
          }).catch(() => {})
        );
      }

      // Mettre à jour le parrainage (jalons + total crédits)
      try {
        await base44.asServiceRole.entities.Referral.update(ref.id, {
          milestones_rewarded: updatedRewarded,
          credits_earned: newCreditsEarned,
          status: 'rewarded',
        });
      } catch {}

      totalAwarded += addCredits;
      summary.push(`${ru.username || ru.email}: +${addCredits} (${newMilestones.join(', ')})`);
    }

    return Response.json({ success: true, evaluated, awarded: totalAwarded, details: summary.join(' | ') || 'Aucun nouveau jalon' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}