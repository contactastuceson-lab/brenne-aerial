import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps } from '../../shared/supportKnowledge.ts';
import { executeNexusAction, AUTO_ACTIONS, CONFIRMABLE_ACTIONS } from '../../shared/nexusActions.ts';

// Réponse utilisateur sur un ticket existant : Nexus fait d'abord sa recherche
// (doc, publication concernée, solde, compte), affiche ses étapes, PUIS répond.
// Trois résolutions possibles :
//   - "answered"       : info pure complètement répondue → ticket résolu
//   - "troubleshooting" : étapes proposées, ticket RESTE OUVERT (attend confirmation)
//   - "escalate"        : critique uniquement (sécurité, remboursement, bug bloquant, suppression)

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ticketId = body?.ticketId;
    const content = (body?.message || body?.content || '').toString().trim();
    if (!ticketId || !content) {
      return Response.json({ error: 'ticketId et message requis' }, { status: 400 });
    }

    const ticket = await base44.entities.SupportTicket.get(ticketId).catch(() => null);
    if (!ticket) return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    if (ticket.user_email !== user.email) {
      return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    }

    const history = Array.isArray(ticket.messages) ? ticket.messages : [];
    const newMessages = [...history, { role: 'user', content, at: new Date().toISOString() }];

    // --- CONFIRMATION D'ACTION EN ATTENTE ---
    // Si une action confirmable est en attente (pending) et que l'utilisateur
    // répond par une confirmation courte (oui/ok/...) ou un refus (non/annule),
    // on exécute ou refuse SANS repasser par le LLM (sinon Nexus redemande en boucle).
    const pending = ticket.pending_action;
    if (pending && pending.status === 'pending' && pending.type && CONFIRMABLE_ACTIONS.includes(pending.type)) {
      const lc = content.toLowerCase().trim();
      const confirmWords = ['oui','ouais','ok','okay','d\'accord','d’accord','je suis d\'accord','je suis d’accord','je confirme','confirme','confirmé','confirme-le','vas-y','fais-le','fais le','je veux bien','parfait','génial','genial','yes','yep','ouep','go','c\'est bon','c’est bon','biensur','bien sûr','c\'est oui','allez-y','allez y','allons-y','allons y','c\'est validé','ça marche','ca marche','ça marche nickel','je valide','je veux','ça part','ca part'];
      const refuseWords = ['non','nan','annule','annuler','je refuse','refuse','non merci','laisse tomber','stop','pas maintenant','absolument pas','jamais'];
      const negate = /\b(ne\s|n[''’]\s)/.test(lc) || /\bpas\b/.test(lc);
      const isConfirm = !negate && confirmWords.some((w) => lc.includes(w));
      const isRefuse = refuseWords.some((w) => lc.includes(w));
      if (isConfirm || isRefuse) {
        if (isConfirm) {
          const actionRes = await executeNexusAction(base44, { type: pending.type, label: pending.label, params: pending.params || {} }, ticket, user);
          const detail = actionRes.result && actionRes.result.wallet ? `\n\nPortefeuille **${actionRes.result.wallet}** mis à jour.` :
            actionRes.result && actionRes.result.amount != null ? `\n\n**${actionRes.result.amount} crédits** traités.` : '';
          const confirmMessages = [...newMessages, {
            role: 'assistant',
            content: actionRes.ok
              ? `✅ **C'est fait** : ${actionRes.label || pending.label}.${detail}\n\nVotre demande est traitée. Avez-vous besoin d'autre chose ?`
              : `❌ Je n'ai pas pu exécuter l'action (${actionRes.error}). Je laisse le ticket ouvert pour qu'on vérifie ensemble.`,
            steps: [],
            action: { type: pending.type, label: pending.label, status: actionRes.ok ? 'executed' : 'failed', result: actionRes, needs_confirmation: true },
            at: new Date().toISOString(),
          }];
          const updatedConf = await base44.entities.SupportTicket.update(ticketId, {
            pending_action: { ...pending, status: actionRes.ok ? 'executed' : 'failed', result: actionRes, executed_at: new Date().toISOString() },
            last_action_log: `${actionRes.ok ? '✅' : '❌'} ${actionRes.label || pending.type} — ${new Date().toISOString()}`,
            messages: confirmMessages,
            status: actionRes.ok ? 'ai_resolved' : 'open',
            ai_handled: !!actionRes.ok,
          }).catch(() => null);
          await logAutomation(base44, {
            automation_name: 'nexus_ticket_action', label: `Action Nexus — ${pending.type}`, category: 'system',
            status: actionRes.ok ? 'success' : 'error',
            summary: `Ticket #${String(ticketId).slice(-6)} — ${actionRes.label || pending.type} ${actionRes.ok ? 'exécuté (confirmé)' : 'échec'}`,
            count: 1,
          }).catch(() => {});
          return Response.json({ ok: true, ticket: updatedConf || { ...ticket, messages: confirmMessages, pending_action: { ...pending, status: actionRes.ok ? 'executed' : 'failed' } } });
        }
        // refus
        const refuseMessages = [...newMessages, {
          role: 'assistant',
          content: `D'accord, j'annule l'action proposée. Que souhaitez-vous faire d'autre ?`,
          steps: [], at: new Date().toISOString(),
        }];
        const updatedRef = await base44.entities.SupportTicket.update(ticketId, {
          pending_action: { ...pending, status: 'rejected' },
          messages: refuseMessages,
        }).catch(() => null);
        return Response.json({ ok: true, ticket: updatedRef || { ...ticket, messages: refuseMessages, pending_action: { ...pending, status: 'rejected' } } });
      }
    }

    // --- RECHERCHE CONTEXTUELLE ---
    const researchBits = [];
    let relatedPostData = null;
    let walletData = null;

    if (ticket.related_item_type === 'post' && ticket.related_item_id) {
      relatedPostData = await base44.asServiceRole.entities.Post.get(ticket.related_item_id).catch(() => null);
      if (relatedPostData) {
        researchBits.push(`PUBLICATION CONCERNÉE (examinée par Nexus) :\n- Auteur : ${relatedPostData.author_username || '?'}\n- Contenu : ${(relatedPostData.content || '').slice(0, 400)}\n- Likes : ${relatedPostData.likes_count || 0} · Vues : ${relatedPostData.views_count || 0}\n- Visibilité : ${relatedPostData.visibility || 'public'}`);
      }
    }

    if (ticket.related_item_type === 'event' && ticket.related_item_id) {
      const ev = await base44.asServiceRole.entities.Event.get(ticket.related_item_id).catch(() => null);
      if (ev) {
        researchBits.push(`ÉVÉNEMENT CONCERNÉ (sélectionné par l'utilisateur dans le wizard) :\n- ID:${ev.id} · « ${ev.title} »\n- Début : ${ev.start_date || '?'} · Lieu : ${ev.city || ev.location || '?'}\n- Prix : ${ev.price_credits || 0} crédits · ${ev.attendees_count || 0}/${ev.capacity || '∞'} inscrits · Statut : ${ev.status}`);
      }
    }

    let frozenWallets = [];
    if (ticket.category === 'credits' || ticket.category === 'billing' || ticket.category === 'events' || /solde|crédit|credit|gel|bloqué|bloque|rembours|portefeuille|wallet|dégel|degel|transf/i.test(content)) {
      try {
        const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        walletData = wallets;
        const total = (wallets || []).reduce((s, w) => s + (w.balance || 0), 0);
        frozenWallets = (wallets || []).filter((w) => w.frozen);
        researchBits.push(`SOLDE EZA (vérifié) : ${total} crédits répartis sur ${wallets?.length || 0} wallet(s). Gelé : ${frozenWallets.length ? 'oui' : 'non'}.${frozenWallets.length ? `\nPORTEFEUILLES GELÉS (frozen=true, wallet_id utilisable pour unfreeze_wallet) :\n${frozenWallets.map((w) => `- ID:${w.id} · « ${w.name} » · solde ${w.balance || 0}`).join('\n')}` : ''}${(wallets || []).length ? `\nDÉTAIL PORTEFEUILLES : ${(wallets || []).map((w) => `« ${w.name} »=${w.balance || 0}${w.frozen ? ' (gelé)' : ''}`).join(', ')}` : ''}`);
      } catch {}
    }

    // Événements : Nexus peut inscrire l'utilisateur (register_event)
    // ET annuler/rembourser une inscription existante (cancel_event_registration).
    let upcomingEvents = [];
    let myRegistrations = [];
    if (ticket.category === 'events' || /événement|evenement|event|inscription|inscrire|je m'inscr|rembours|annul/i.test(content)) {
      try {
        const all = await base44.asServiceRole.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const now = Date.now();
        upcomingEvents = (all || []).filter((e) => e.status !== 'cancelled' && (!e.end_date || new Date(e.end_date).getTime() >= now) && (!e.capacity || (e.attendees_count || 0) < e.capacity));
        if (upcomingEvents.length) {
          researchBits.push(`ÉVÉNEMENTS À VENIR (Nexus peut inscrire l'utilisateur via register_event) :\n${upcomingEvents.slice(0, 8).map((e) => `- ID:${e.id} · « ${e.title} » · ${e.start_date ? e.start_date.slice(0, 10) : '?'} · ${e.price_credits || 0} crédits · ${e.city || ''} · ${e.attendees_count || 0}/${e.capacity || '∞'}`).join('\n')}`);
        }
        // Inscriptions actives de l'utilisateur — Nexus peut les annuler/rembourser
        const regs = await base44.asServiceRole.entities.EventRegistration.filter({ user_id: user.id, status: 'registered' }, '-created_date', 50).catch(() => []);
        myRegistrations = (regs || []).filter((r) => r.status === 'registered');
        if (myRegistrations.length) {
          researchBits.push(`INSCRIPTIONS ACTIVES DE L'UTILISATEUR (Nexus peut annuler + rembourser via cancel_event_registration, registration_id requis) :\n${myRegistrations.slice(0, 12).map((r) => `- registration_id:${r.id} · « ${r.event_title || '?'} » · ${r.event_start_date ? r.event_start_date.slice(0, 10) : '?'} · crédits payés: ${r.credits_paid || 0} · billet ${r.ticket_code || ''}`).join('\n')}`);
        }
      } catch {}
    }

    const { text: contextText } = await buildUserContext(base44, user.id, user.email);

    const conv = newMessages
      .map((m) => (m.role === 'user' ? 'UTILISATEUR' : m.role === 'admin' ? 'ADMIN' : 'NEXUS') + ': ' + (m.content || ''))
      .join('\n');

    const steps = buildResearchSteps({
      hasRelatedPost: !!relatedPostData,
      hasRelatedConversation: ticket.related_item_type === 'conversation',
      category: ticket.category,
    });

    const prompt = `Tu es NEXUS, l'IA de support eza. Tu n'es pas qu'un chatbot : tu es un AGENT autonome qui peut EXÉCUTER des actions concrètes sur le compte de l'utilisateur (inscriptions, crédits, remboursements en crédits, portefeuilles…), pas seulement répondre. Consulte ton catalogue de capacités plus bas et PROPOSE l'action appropriée dès que la demande correspond. Tu viens de faire ta recherche : tu as lu la documentation, ${relatedPostData ? 'examiné la publication concernée, ' : ''}${walletData ? 'vérifié le solde, ' : ''}et consulté le profil de l'utilisateur. Tu réponds maintenant avec tout ce contexte.

${EZA_KNOWLEDGE}

${contextText}

${researchBits.length ? '--- DONNÉES DE RECHERCHE ---\n' + researchBits.join('\n\n') : ''}

--- HISTORIQUE ---
${conv}

Réponds au dernier message. Renvoie un JSON STRICT :
{
  "reply": "réponse en français, 2-6 phrases, markdown. Utilise les données de recherche. Propose TOUJOURS une solution concrète d'abord.",
  "resolution_type": "answered|troubleshooting|escalate",
  "escalation_reason": "raison courte si resolution_type=escalate, sinon null"
}

RÈGLES DE RÉSOLUTION (CRITIQUE) :
- "answered" : tu as répondu COMPLÈTEMENT à une question d'info (comment ça marche, où trouver, combien). L'utilisateur n'a plus rien à faire. → résolu.
- "troubleshooting" : tu proposes des étapes / une solution, mais l'utilisateur doit TESTER ou CONFIRMER. Le ticket RESTE OUVERT. C'est le cas par défaut pour tout bug ou problème.
- "escalate" : UNIQUEMENT si :
    • Sécurité (compte piraté, données, harcèlement).
    • Remboursement bancaire réel (carte Stripe) — PAS les remboursements en crédits Eza.
    • Bug bloquant confirmé (core unusable).
    • Suppression de compte.
    • Litige / fraude.
    • L'utilisateur a insisté 3+ fois sans solution dans l'historique.
  NE ESCALADE PAS un remboursement d'événement en crédits Eza : utilise cancel_event_registration (registration_id issu de la recherche) — c'est exactement ce que Nexus sait faire.

INTERDIT :
- Marquer "answered" si l'utilisateur n'a pas confirmé que le bug est résolu.
- Escalader "par précaution" ou pour un simple "ça ne marche pas" vague.
- Dire "je transmets à l'équipe" si tu peux répondre toi-même.

Si l'utilisateur dit "ça marche" / "merci c'est bon" → "answered".
Si l'utilisateur dit "non ça ne marche pas" ou donne un nouveau détail → "troubleshooting" (ouvre à nouveau, propose autre chose).
Si l'info demandée est dans la doc → "answered".

--- ANTI-HALLUCINATION (CRITIQUE — TU NE FABRIQUES JAMAIS L'ÉTAT DU COMPTE) ---
- Tu ne décris QUE ce que tu as réellement vérifié dans la recherche (solde, gel, inscriptions, posts). Si une donnée n'est pas dans la recherche, tu NE l'inventes PAS.
- INTERDIT d'affirmer "votre solde est bloqué", "votre portefeuille est gelé", "vous êtes inscrit à X" sans avoir lu la donnée correspondante dans la recherche. Si tu n'as pas vérifié, dis "je n'ai pas cette information sous les yeux" et propose d'escalader si nécessaire.
- N'attribue JAMAIS de cause au problème sans preuve (ex : "votre solde est gelé" sans frozen=true lu dans les données de recherche).
- Un portefeuille est gelé UNIQUEMENT si la recherche montre un wallet avec frozen=true (section "PORTEFEUILLES GELÉS"). Sans ce constat explicite, NE PROPOSE PAS unfreeze_wallet et NE DIS PAS que le solde est bloqué.

--- SÉCURITÉ DES ACTIONS SENSIBLES (anti-danger) ---
Les actions unfreeze_wallet, refund_credits, grant_credits, cancel_event_registration, move_credits sont SENSIBLES (impact financier). Règles strictes :
- Ne les propose JAMAIS spontanément (sans demande explicite de l'utilisateur). Seul register_event peut être proposé proactivement.
- unfreeze_wallet : UNIQUEMENT si la recherche montre un portefeuille gelé ET que tu as son wallet_id. Sans wallet_id ou sans gel confirmé → NE PROPOSE PAS l'action (ne dis pas non plus "c'est fait").
- refund_credits / grant_credits : UNIQUEMENT si l'utilisateur a explicitement demandé un remboursement / geste commercial, ET que tu peux justifier le montant à partir de données réelles (crédits payés, solde vérifié). Montant max 100.
- Si l'utilisateur demande une action que tu ne peux pas exécuter faute de données fiables, n'invente rien : dis ce qu'il te manque ou escalade.

--- TON CATALOGUE D'ACTIONS (tu PEUX et tu DOIS agir) ---
Toute action se renvoie dans le champ JSON "action": { "type", "label", "needs_confirmation": bool, "params": {...} }.
PROPOSE la bonne action PROACTIVEMENT dès que la demande correspond — n'attends pas que l'utilisateur la devine.

▶ ACTIONS AUTOMATIQUES (needs_confirmation=false — exécution immédiate) :
- "recalc_post" { post_id } — recalculer les compteurs d'une publication. QUAND : "mes likes ont disparu", "le compteur est faux".
- "create_default_wallet" — créer le portefeuille par défaut. QUAND : utilisateur sans wallet, "je n'ai pas de portefeuille".
- "close_ticket" — fermer le ticket. QUAND : l'utilisateur confirme "ça marche / merci c'est bon".
- "reopen_ticket" — rouvrir le ticket. QUAND : "non ça ne marche pas" sur un ticket résolu.

▶ ACTIONS AVEC CONFIRMATION (needs_confirmation=true — la carte Oui/Non s'affiche, exécution au clic) :
- "grant_credits" { amount: 1-100, reason } — créditer des crédits de courtoisie (max 100). QUAND : bug mineur ayant impacté l'utilisateur, geste commercial.
- "refund_credits" { amount, reason } — rembourser un achat boutique/événement EN CRÉDITS Eza. QUAND : "remboursez-moi" pour un achat crédits/boutique/événement (PAS de remboursement carte Stripe).
- "cancel_event_registration" { registration_id } — annuler une inscription + rendre les crédits payés. QUAND : "remboursez mon événement", "annule mon inscription". UTILISE le registration_id EXACT de la section "INSCRIPTIONS ACTIVES" de la recherche. S'il y a plusieurs inscriptions, demande à l'utilisateur de préciser laquelle AVANT de proposer l'action (liste les titres + dates).
- "move_credits" { from_wallet_id, to_wallet_id, amount, reason } — déplacer des crédits entre les portefeuilles du MÊME utilisateur. QUAND : "transfère de mon wallet épargne vers dépenses".
- "unfreeze_wallet" { wallet_id } — dégeler un portefeuille VÉRIFIÉ comme gelé (frozen=true lu dans la recherche, avec son wallet_id). Sans wallet_id ou sans gel confirmé → NE PROPOSE PAS l'action. RÈGLE ABSOLUE : un wallet réellement gelé se traite par unfreeze_wallet, JAMAIS par escalade ; mais ne dis jamais "je ne peux pas débloquer" pour un gel non vérifié.
- "register_event" { event_id, event_title, credits } — inscrire l'utilisateur à un événement (débite ses crédits Eza si payant). RÈGLE ABSOLUE : tu PEUX et tu DOIS inscrire toi-même. Ne dis JAMAIS "je ne peux pas m'inscrire pour vous" ni "vous devez le faire vous-même". Utilise l'event_id exact de la recherche.

▶ CE QUE TU NE PEUX PAS FAIRE (→ resolution_type="escalate", transmets à un humain) :
- Suppression de compte / données (RGPD).
- Remboursement bancaire réel Stripe (carte bancaire).
- Sanction / ban / modération lourde.
- Suppression de contenu signalé.
- Litige financier / fraude (parrainage suspect, double paiement).

RÈGLES D'EXÉCUTION (CRITIQUE — sans ça, RIEN ne se passe) :
1. Toute action DOIT être dans le champ JSON "action" (type + label + needs_confirmation + params). JAMAIS une action annoncée uniquement en prose.
2. La carte de confirmation s'affiche AUTOMATIQUEMENT avec needs_confirmation=true. NE DEMANDE JAMAIS "Confirmez-vous ?" en texte — mets juste l'objet action.
3. INTERDIT ABSOLU : écrire "C'est validé", "C'est fait", "inscription confirmée", "votre billet a été créé". Une action n'est exécutée QUE par le système (tu reçois le résultat dans l'historique). Sans objet action, RIEN n'est fait — ne le prétends pas.
4. register_event : dès que l'utilisateur désigne un événement (nom, "premier", "celui-là", ou "oui" après ta proposition), renvoie IMMÉDIATEMENT "action": { "type": "register_event", "label": "Inscrire à « <titre> »", "needs_confirmation": true, "params": { "event_id": "<id exact>", "event_title": "<titre>", "credits": <nombre> } }.
5. Une seule action par message. Pas d'objet action si aucune action ne résout la demande.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          resolution_type: { type: 'string' },
          escalation_reason: { type: 'string' },
          action: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['recalc_post', 'create_default_wallet', 'close_ticket', 'reopen_ticket', 'grant_credits', 'refund_credits', 'cancel_event_registration', 'move_credits', 'unfreeze_wallet', 'register_event'] },
              label: { type: 'string' },
              needs_confirmation: { type: 'boolean' },
              params: { type: 'object' },
            },
          },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    let reply, rtype, escalation;
    if (ai?.__error) {
      reply = "J'ai bien reçu votre message. Un membre de l'équipe eza vous répondra sous peu.";
      rtype = 'troubleshooting';
      escalation = null;
    } else {
      reply = ai.reply || "J'ai bien reçu votre message.";
      rtype = (ai.resolution_type === 'answered' || ai.resolution_type === 'escalate') ? ai.resolution_type : 'troubleshooting';
      escalation = rtype === 'escalate' ? (ai.escalation_reason || 'Nécessite intervention humaine') : null;
    }

    // Si l'utilisateur revient sur un ticket que Nexus avait marqué "ai_resolved",
    // on le ROUVRE systématiquement — il n'est pas résolu tant que l'utilisateur
    // n'a pas confirmé. On ne coupe jamais la parole.
    const reopening = ticket.status === 'ai_resolved' || ticket.status === 'resolved';
    const resolved = rtype === 'answered' && !reopening;
    const escalated = rtype === 'escalate';
    const newStatus = escalated ? 'awaiting_human' : (resolved ? 'ai_resolved' : 'open');
    const assignee = escalated ? 'human' : 'ai';
    const handledBy = escalated ? 'escalated' : 'ai';

    // --- ACTION PROPOSÉE PAR NEXUS ---
    let pendingAction = null;
    let actionResult = null;
    let actionType = null;
    const aiAction = ai && !ai.__error && ai.action && ai.action.type ? ai.action : null;
    if (aiAction && !escalated && (AUTO_ACTIONS.includes(aiAction.type) || CONFIRMABLE_ACTIONS.includes(aiAction.type))) {
      actionType = aiAction.type;
      if (AUTO_ACTIONS.includes(aiAction.type)) {
        actionResult = await executeNexusAction(base44, aiAction, ticket, user);
      } else if (CONFIRMABLE_ACTIONS.includes(aiAction.type)) {
        pendingAction = { ...aiAction, status: 'pending', proposed_at: new Date().toISOString() };
      }
    }

    // Filet de sécurité : si Nexus décrit un bouton/confirmation en prose SANS
    // émettre l'objet action (modèle désobéissant), on synthétise l'action
    // register_event à partir de l'événement cité ou du premier disponible,
    // pour que la carte de confirmation s'affiche quand même.
    if (!pendingAction && !actionResult && !escalated && upcomingEvents.length) {
      const intentRe = /cliquez sur le bouton|bouton de confirmation|confirmez|valider l'op|je vais proc|nouvelle tentative d'inscription|je vais (l')?inscr|inscrire|réeffectuer l'inscription|refaire l'inscription|refait l'inscription/i;
      if (intentRe.test(reply)) {
        const cited = upcomingEvents.find((e) => reply.includes(e.title)) || upcomingEvents[0];
        pendingAction = {
          type: 'register_event',
          label: `Inscrire à « ${cited.title} »`,
          needs_confirmation: true,
          params: { event_id: cited.id, event_title: cited.title, credits: cited.price_credits || 0 },
          status: 'pending',
          proposed_at: new Date().toISOString(),
        };
        actionType = 'register_event';
      }
    }

    // Enrichissement : un register_event sans event_id est inexécutable.
    // Si le LLM a émis l'action avec un label mais sans params, on injecte
    // l'event_id depuis les événements à venir (titre cité ou premier dispo).
    if (pendingAction && pendingAction.type === 'register_event' && !(pendingAction.params?.event_id) && upcomingEvents.length) {
      const cited = upcomingEvents.find((e) => (pendingAction.label || '').includes(e.title) || (reply || '').includes(e.title)) || upcomingEvents[0];
      pendingAction.params = { ...(pendingAction.params || {}), event_id: cited.id, event_title: cited.title, credits: Number(cited.price_credits || 0) };
      if (!pendingAction.label) pendingAction.label = `Inscrire à « ${cited.title} »`;
    }

    // Garde-fou unfreeze_wallet : un dégel sans wallet_id (ou sans gel réel
    // vérifié) est annulé — Nexus ne doit JAMAIS proposer un dégel
    // halluciné. On injecte le wallet_id uniquement si un portefeuille gelé
    // a réellement été trouvé dans la recherche.
    if (pendingAction && pendingAction.type === 'unfreeze_wallet') {
      if (pendingAction.params?.wallet_id && frozenWallets.some((w) => w.id === pendingAction.params.wallet_id)) {
        // wallet_id valide et confirmé gelé — on garde.
      } else if (frozenWallets.length === 1) {
        pendingAction.params = { ...(pendingAction.params || {}), wallet_id: frozenWallets[0].id, wallet_name: frozenWallets[0].name };
      } else {
        // Aucun gel vérifié (ou plusieurs sans précision) → on retire l'action.
        pendingAction = null;
        actionType = null;
      }
    }

    // Garde-fou cancel_event_registration : sans registration_id, Nexus ne
    // peut pas annuler. Si une seule inscription active existe, on l'injecte ;
    // s'il y en a plusieurs sans précision, on retire l'action (Nexus doit
    // demander à l'utilisateur laquelle).
    if (pendingAction && pendingAction.type === 'cancel_event_registration') {
      if (pendingAction.params?.registration_id && myRegistrations.some((r) => r.id === pendingAction.params.registration_id)) {
        // registration_id valide — on garde.
      } else if (myRegistrations.length === 1) {
        const r = myRegistrations[0];
        pendingAction.params = { ...(pendingAction.params || {}), registration_id: r.id, event_title: r.event_title, credits: r.credits_paid || 0 };
        if (!pendingAction.label) pendingAction.label = `Annuler l'inscription à « ${r.event_title || '?'} »`;
      } else if (myRegistrations.length > 1) {
        // Ambiguïté → on retire pour forcer la demande de précision.
        pendingAction = null;
        actionType = null;
      }
    }

    const finalMessages = [...newMessages, {
      role: 'assistant',
      content: reply,
      steps: steps.map((s) => ({ ...s, status: 'done' })),
      action: actionResult ? { type: actionType, label: aiAction?.label || actionResult.label, status: actionResult.ok ? 'executed' : 'failed', result: actionResult } : pendingAction ? { type: pendingAction.type, label: pendingAction.label, status: 'pending', needs_confirmation: true, params: pendingAction.params } : undefined,
      at: new Date().toISOString(),
    }];

    const updatePayload = {
      status: newStatus,
      assignee,
      handled_by: handledBy,
      ai_handled: resolved,
      escalation_reason: escalation,
      messages: finalMessages,
    };
    if (pendingAction) updatePayload.pending_action = pendingAction;
    if (actionResult && actionResult.ok) updatePayload.last_action_log = `✅ ${actionResult.label || actionType} — ${new Date().toISOString()}`;

    const updated = await base44.entities.SupportTicket.update(ticketId, updatePayload).catch(() => null);

    if (ticket.user_email) {
      await sendEzaEmail(base44, {
        to: ticket.user_email,
        subject: resolved ? '✅ Suite de votre ticket eza' : escalated ? '🔄 Votre ticket eza est transmis à un humain' : '💬 Nexus a répondu à votre ticket',
        title: 'Réponse de Nexus',
        body: `Bonjour,\n\n${reply}\n\n${resolved ? 'Si votre demande n\'est pas résolue, répondez sur le ticket pour le rouvrir.' : escalated ? 'L\'équipe eza reprend le dossier sous 24-48h.' : 'Répondez sur le ticket pour confirmer si la solution fonctionne.'}\n\n— Nexus, support eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    if (escalated) {
      try {
        const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
        for (const email of (admins || []).filter((u) => u.role === 'admin' || u.role === 'owner').map((u) => u.email).slice(0, 25)) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: email, type: 'system',
            title: `🎫 Ticket #${String(ticketId).slice(-6)} escaladé`,
            content: content.slice(0, 200), link: '/admin/support', sender_name: 'Nexus Support',
          }).catch(() => {});
        }
      } catch {}
    }

    await logAutomation(base44, {
      automation_name: 'reply_support_ticket', label: 'Support IA — réponse utilisateur', category: 'system',
      status: 'success',
      summary: `Ticket #${String(ticketId).slice(-6)} — ${resolved ? 'résolu IA' : escalated ? 'escaladé' : 'répondu (ouvert)'} (${steps.length} étapes)`,
      count: 1,
    }).catch(() => {});

    return Response.json({ ok: true, ticket: updated || { ...ticket, messages: finalMessages, status: newStatus, assignee } });
  } catch (error) {
    if (base44) {
      await logAutomation(base44, {
        automation_name: 'reply_support_ticket', label: 'Support IA — réponse utilisateur', category: 'system',
        status: 'error', summary: 'Échec', details: String(error?.message || error),
      }).catch(() => {});
    }
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}