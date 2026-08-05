import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Analyse IA de la description d'un problème (étape 2 du wizard de ticket).
// Retourne LA suggestion la plus probable (une seule), avec l'élément précis
// détecté automatiquement (événement, inscription, portefeuille, post…).
// L'IA croise la description avec le catalogue réel des éléments de l'utilisateur.

const VALID_CATEGORIES = ['account','billing','credits','bug','feature','events','moderation','messaging','other'];
const VALID_TYPES = ['post','conversation','wallet','event','community','space','story','referral','registration','reward','cart','ticket','discussion','forum','review','certification','donation','list','ad','none'];

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const description = (body?.description || '').toString().trim();
    if (!description) {
      return Response.json({ error: 'description requise' }, { status: 400 });
    }

    // --- CATALOGUE DES ÉLÉMENTS DE L'UTILISATEUR ---
    const sr = base44.asServiceRole;
    const uid = user.id;
    const uemail = user.email;
    const now = Date.now();

    const [events, regs, wallets, posts, communities, spaces, stories,
      referrals, rewards, carts, tickets, discussions, forumTopics, reviews,
      certifs, donations, lists, ads] = await Promise.all([
      sr.entities.Event.filter({}, 'start_date', 20).catch(() => []),
      sr.entities.EventRegistration.filter({ user_id: uid, status: 'registered' }, '-created_date', 20).catch(() => []),
      sr.entities.Wallet.filter({ owner_id: uid }).catch(() => []),
      sr.entities.Post.filter({ author_id: uid }, '-created_date', 15).catch(() => []),
      sr.entities.Community.filter({}, '-members_count', 30).catch(() => []),
      sr.entities.Space.filter({ host_id: uid }, '-created_date', 15).catch(() => []),
      sr.entities.Story.filter({ author_id: uid }, '-created_date', 15).catch(() => []),
      sr.entities.Referral.filter({ referrer_email: uemail }).catch(() => []),
      sr.entities.RewardRedemption.filter({ user_email: uemail }, '-created_date', 15).catch(() => []),
      sr.entities.Cart.filter({ owner_id: uid, status: 'active' }).catch(() => []),
      sr.entities.SupportTicket.filter({ user_email: uemail }, '-created_date', 10).catch(() => []),
      sr.entities.Discussion.filter({ author_id: uid }, '-created_date', 15).catch(() => []),
      sr.entities.ForumTopic.filter({ author: uid }, '-created_date', 15).catch(() => []),
      sr.entities.Review.filter({ author_email: uemail }, '-created_date', 15).catch(() => []),
      sr.entities.CertificationRequest.filter({ user_email: uemail }, '-created_date', 10).catch(() => []),
      sr.entities.Donation.filter({ donor_email: uemail }, '-created_date', 15).catch(() => []),
      sr.entities.UserList.filter({ owner_id: uid }, '-created_date', 15).catch(() => []),
      sr.entities.AdCampaign.filter({ owner_id: uid }, '-created_date', 15).catch(() => []),
    ]);

    const catalog = [];
    const push = (id, type, label) => { if (id && label) catalog.push({ id: String(id), type, label: String(label).slice(0, 120) }); };

    (events || []).filter((e) => e.status !== 'cancelled' && (!e.end_date || new Date(e.end_date).getTime() >= now)).forEach((e) => push(e.id, 'event', `${e.title}${e.city ? ' · ' + e.city : ''}${e.start_date ? ' · ' + e.start_date.slice(0,10) : ''}`));
    (regs || []).forEach((r) => push(r.id, 'registration', `${r.event_title || 'Inscription'}${r.event_start_date ? ' · ' + r.event_start_date.slice(0,10) : ''}`));
    push('main_account', 'wallet', 'Compte principal');
    (wallets || []).forEach((w) => push(w.id, 'wallet', `${w.name || 'Portefeuille'}${w.frozen ? ' (gelé)' : ''}`));
    (posts || []).forEach((p) => push(p.id, 'post', (p.content || '').slice(0, 80) || 'Publication'));
    (communities || []).filter((c) => c.type === 'open' || c.owner_id === uid || (c.member_ids || []).includes(uid)).forEach((c) => push(c.id, 'community', c.name));
    (spaces || []).forEach((s) => push(s.id, 'space', s.title));
    (stories || []).filter((s) => !s.expires_at || new Date(s.expires_at).getTime() > now).forEach((s) => push(s.id, 'story', s.text ? s.text.slice(0,60) : `Story ${s.media_type}`));
    (referrals || []).forEach((r) => push(r.id, 'referral', `Parrainage ${r.referred_email || r.referred_name || r.referral_code || ''}`.trim()));
    (rewards || []).forEach((r) => push(r.id, 'reward', r.item_label));
    (carts || []).forEach((c) => push(c.id, 'cart', `Panier (${(c.items||[]).length} articles)`));
    (tickets || []).forEach((t) => push(t.id, 'ticket', `#${String(t.id).slice(-6)} ${t.subject || ''}`));
    (discussions || []).forEach((d) => push(d.id, 'discussion', d.title));
    (forumTopics || []).forEach((f) => push(f.id, 'forum', f.title));
    (reviews || []).forEach((r) => push(r.id, 'review', `Avis ${r.rating}/5`));
    (certifs || []).forEach((c) => push(c.id, 'certification', 'Demande de certification'));
    (donations || []).forEach((d) => push(d.id, 'donation', `Don ${d.amount}€`));
    (lists || []).forEach((l) => push(l.id, 'list', l.name));
    (ads || []).forEach((a) => push(a.id, 'ad', a.title));

    const catalogText = catalog.length
      ? 'CATALOGUE DES ÉLÉMENTS DE L\'UTILISATEUR (id · type · libellé) :\n' + catalog.map((c) => `- ${c.id} · ${c.type} · ${c.label}`).join('\n')
      : '(aucun élément trouvé)';

    const prompt = `Tu es l'assistant de tri du support eza (réseau professionnel/communautaire : profil, posts, stories, communities, Spaces, events, boutique, banque de crédits, parrainage, messagerie).

Analyse la description ci-dessous et propose LA suggestion la plus probable (une seule, pas trois).

Pour cette suggestion, choisis:
- "label": un libellé court et clair en français (ex: "Bug d'affichage d'une publication", "Problème de facturation", "Signalement de contenu")
- "category": une valeur parmi ["account","billing","credits","bug","feature","events","moderation","messaging","other"]
- "element_type": parmi ["post","conversation","wallet","event","community","space","story","referral","registration","reward","cart","ticket","discussion","forum","review","certification","donation","list","ad","none"]
- "description": une phrase courte expliquant ce type
- "related_item_id" et "related_item_label": SI la description mentionne explicitement un élément précis présent dans le catalogue ci-dessous (par titre, nom, lieu, date, identifiant), remplis ces deux champs avec l'élément EXACT du catalogue (id + libellé). Sinon laisse null.

${catalogText}

Description de l'utilisateur:
"""
${description.slice(0, 2000)}
"""

Réponds en JSON STRICT conforme à ce schéma:
{
  "suggestion": {
    "label": "...",
    "category": "...",
    "element_type": "...",
    "description": "...",
    "related_item_id": "id|null",
    "related_item_label": "libellé|null"
  }
}

Règles:
- 1 seule suggestion, la plus probable.
- element_type "post" pour les problèmes d'affichage/likes/visibilité d'une publication ou signalement de contenu.
- element_type "conversation" pour les problèmes de messagerie/discussions.
- element_type "wallet" pour les problèmes de portefeuille, crédits, solde, transfert, ou banque Eza.
- element_type "event" pour les problèmes d'inscription, remboursement, annulation ou accès à un événement.
- element_type "registration" pour un problème sur une inscription précise (billet, remboursement).
- element_type "none" pour les problèmes de compte, facturation générale, fonctionnalité, ou généraux.
- related_item_id ne doit JAMAIS être inventé : il DOIT exister dans le catalogue ci-dessus pour le element_type de la suggestion. Si aucun élément du catalogue ne correspond clairement, mets null.
- Libellés en français, concis.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestion: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              category: { type: 'string' },
              element_type: { type: 'string' },
              description: { type: 'string' },
              related_item_id: { type: 'string' },
              related_item_label: { type: 'string' },
            },
          },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    if (ai?.__error) {
      return Response.json({ error: ai.__error }, { status: 500 });
    }

    // Index du catalogue par type pour valider related_item_id.
    const byType = {};
    catalog.forEach((c) => { (byType[c.type] = byType[c.type] || new Set()).add(c.id); });

    const rawSugg = ai?.suggestion;
    let suggestion = null;
    if (rawSugg) {
      const et = VALID_TYPES.includes(rawSugg.element_type) ? rawSugg.element_type : 'none';
      let rid = rawSugg.related_item_id ? String(rawSugg.related_item_id) : null;
      let rlabel = rawSugg.related_item_label ? String(rawSugg.related_item_label).slice(0, 160) : null;
      if (rid && et !== 'none' && et !== 'conversation' && byType[et] && byType[et].has(rid)) {
        // OK — élément validé
      } else {
        rid = null; rlabel = null;
      }
      suggestion = {
        label: String(rawSugg.label || 'Autre').slice(0, 80),
        category: VALID_CATEGORIES.includes(rawSugg.category) ? rawSugg.category : 'other',
        element_type: et,
        description: String(rawSugg.description || '').slice(0, 200),
        related_item_id: rid,
        related_item_label: rlabel,
      };
    }

    // Fallback si l'IA n'a rien retourné d'exploitable
    if (!suggestion) {
      suggestion = {
        label: 'Demande générale',
        category: 'other',
        element_type: 'none',
        description: 'Question ou problème général',
        related_item_id: null,
        related_item_label: null,
      };
    }

    return Response.json({ suggestion });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}