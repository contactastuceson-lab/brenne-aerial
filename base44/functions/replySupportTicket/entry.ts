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
      const confirmWords = ['oui','ouais','ok','okay','d\'accord','d’accord','je suis d\'accord','je suis d’accord','je confirme','confirme','confirmé','confirme-le','vas-y','fais-le','fais le','je veux bien','parfait','génial','genial','yes','yep','ouep','go','c\'est bon','c’est bon','biensur','bien sûr','c\'est oui','allez-y','c\'est validé','ça marche','ca marche','ça marche nickel','je valide'];
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

    if (ticket.category === 'credits' || ticket.category === 'billing') {
      try {
        const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        walletData = wallets;
        const total = (wallets || []).reduce((s, w) => s + (w.balance || 0), 0);
        researchBits.push(`SOLDE EZA (vérifié) : ${total} crédits répartis sur ${wallets?.length || 0} wallet(s). Gelé : ${wallets?.some((w) => w.frozen) ? 'oui' : 'non'}.`);
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

    const prompt = `Tu es NEXUS, l'IA de support eza. Tu viens de faire ta recherche : tu as lu la documentation, ${relatedPostData ? 'examiné la publication concernée, ' : ''}${walletData ? 'vérifié le solde, ' : ''}et consulté le profil de l'utilisateur. Tu réponds maintenant avec tout ce contexte.

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
    • Demande explicite de remboursement.
    • Bug bloquant confirmé (core unusable).
    • Suppression de compte.
    • L'utilisateur a insisté 3+ fois sans solution dans l'historique.

INTERDIT :
- Marquer "answered" si l'utilisateur n'a pas confirmé que le bug est résolu.
- Escalader "par précaution" ou pour un simple "ça ne marche pas" vague.
- Dire "je transmets à l'équipe" si tu peux répondre toi-même.

Si l'utilisateur dit "ça marche" / "merci c'est bon" → "answered".
Si l'utilisateur dit "non ça ne marche pas" ou donne un nouveau détail → "troubleshooting" (ouvre à nouveau, propose autre chose).
Si l'info demandée est dans la doc → "answered".

--- ACTIONS DIRECTES (tu peux proposer d'agir) ---
Tu peux proposer une action concrète dans "action": { "type", "label", "needs_confirmation": bool, "params": {...} }.

Actions automatiques (needs_confirmation=false) :
- "recalc_post" { post_id } — recalculer les compteurs d'une publication (bug de likes).
- "create_default_wallet" — créer le portefeuille par défaut s'il manque.
- "close_ticket" — fermer le ticket quand résolu confirmé.
- "reopen_ticket" — rouvrir si l'utilisateur dit "non ça ne marche pas".

Actions avec confirmation (needs_confirmation=true) :
- "grant_credits" { amount: 1-100, reason } — crédit de courtoisie (max 100).
- "refund_credits" { amount, reason } — rembourser un achat boutique/événement en crédits.
- "cancel_event_registration" { registration_id } — annuler une inscription + rembourser crédits.
- "move_credits" { from_wallet_id, to_wallet_id, amount, reason } — déplacer entre portefeuilles du même utilisateur.
- "unfreeze_wallet" { wallet_id } — dégeler un portefeuille gelé par erreur.
  IMPORTANT : un portefeuille gelé (frozen=true) doit TOUJOURS être traité avec unfreeze_wallet (needs_confirmation=true), JAMAIS escaladé — c'est une action que TU peux faire. N'écris jamais "je ne peux pas débloquer" pour un gel.

INTERDIT (ne jamais proposer → escalate) :
- Suppression de compte / données (RGPD).
- Remboursement bancaire réel Stripe (seuil dépassé).
- Ban / sanction modération lourde.
- Suppression de contenu signalé.
- Litige financier / fraude (parrainage suspect, double paiement).

Propose une action UNIQUEMENT si elle résout concrètement la demande. Sinon, n'inclus pas "action".
Quand tu proposes une action needs_confirmation=true, dis UNE SEULE fois "Je propose de faire X, confirmez par Oui" — ne redemande pas la confirmation si l'utilisateur a déjà répondu. Dès que l'utilisateur dit "oui/ok/confirme", l'action s'exécute automatiquement, ne demande plus rien.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          resolution_type: { type: 'string' },
          escalation_reason: { type: 'string' },
          action: { type: 'object' },
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