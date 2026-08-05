import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps, buildRelatedItemResearch } from '../../shared/supportKnowledge.ts';

// Réponse utilisateur sur un ticket existant : Nexus fait sa recherche contextuelle
// (doc, élément concerné, solde, compte) PUIS répond. Nexus NE PEUT PAS exécuter
// d'actions — il informe, guide, ou escalade vers l'équipe humaine.

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

    // --- RECHERCHE CONTEXTUELLE (informatif uniquement, aucune action) ---
    const researchBits = [];

    const relatedResearch = await buildRelatedItemResearch(base44, ticket.related_item_type, ticket.related_item_id);
    if (relatedResearch.researchBit) researchBits.push(relatedResearch.researchBit);

    if (ticket.category === 'credits' || ticket.category === 'billing' || /solde|crédit|credit|gel|bloqué|bloque|rembours|portefeuille|wallet|transf/i.test(content)) {
      try {
        const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        const total = (wallets || []).reduce((s, w) => s + (w.balance || 0), 0);
        const frozenCount = (wallets || []).filter((w) => w.frozen).length;
        researchBits.push(`SOLDE EZA (vérifié) : ${total} crédits répartis sur ${wallets?.length || 0} portefeuille(s). Portefeuilles gelés : ${frozenCount > 0 ? `${frozenCount}` : 'aucun'}.`);
      } catch {}
    }

    if (ticket.category === 'events' || /événement|evenement|event|inscription|inscrire|rembours|annul/i.test(content)) {
      try {
        const all = await base44.asServiceRole.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const now = Date.now();
        const upcoming = (all || []).filter((e) => e.status !== 'cancelled' && (!e.end_date || new Date(e.end_date).getTime() >= now));
        if (upcoming.length) {
          researchBits.push(`ÉVÉNEMENTS À VENIR (informatif) :\n${upcoming.slice(0, 8).map((e) => `- « ${e.title} » · ${e.start_date ? e.start_date.slice(0, 10) : '?'} · ${e.price_credits || 0} crédits · ${e.city || ''}`).join('\n')}`);
        }
      } catch {}
    }

    const { text: contextText } = await buildUserContext(base44, user.id, user.email);

    const conv = newMessages
      .map((m) => (m.role === 'user' ? 'UTILISATEUR' : m.role === 'admin' ? 'ADMIN' : 'NEXUS') + ': ' + (m.content || ''))
      .join('\n');

    const steps = buildResearchSteps({
      relatedStep: relatedResearch.step,
      relatedType: ticket.related_item_type,
      category: ticket.category,
    }).map((s) => ({ ...s, status: 'done' }));

    const prompt = `Tu es NEXUS, l'IA de support eza. Tu RÉPONDS aux questions et ORIENTES les utilisateurs. Tu NE PEUX PAS exécuter d'actions sur le compte (pas d'inscription, pas de remboursement, pas de dégel, pas de transfert). Ton rôle est purement informatif : tu expliques, tu guides, et si une action est nécessaire, tu l'escalades à l'équipe humaine. Tu viens de faire ta recherche : tu as lu la documentation, ${relatedResearch.researchBit ? "examiné l'élément concerné, " : ''}et consulté le profil de l'utilisateur. Tu réponds maintenant avec tout ce contexte.

${EZA_KNOWLEDGE}

${contextText}

${researchBits.length ? '--- DONNÉES DE RECHERCHE ---\n' + researchBits.join('\n\n') : ''}

--- HISTORIQUE ---
${conv}

Réponds au dernier message. Renvoie un JSON STRICT :
{
  "reply": "réponse en français, PROFESSIONNELLE et STRUCTURÉE (markdown). Vouvoiement obligatoire. Jamais de ton familier.",
  "resolution_type": "answered|troubleshooting|escalate",
  "escalation_reason": "raison courte si resolution_type=escalate, sinon null"
}

FORMAT MARKDOWN OBLIGATOIRE (CRITIQUE — tes réponses doivent être LISIBLES, pas un pavé) :
- Commence TOUJOURS par une phrase d'introduction courte (1 ligne max).
- Utilise **gras** pour les termes clés.
- Utilise des LISTES À PUCES (-) dès que tu as 2+ éléments. JAMAIS de paragraphe de plus de 3 lignes.
- Si la réponse a plusieurs parties, utilise des titres ## ou ###.
- Sépare les étapes avec des sauts de ligne.
- Termine par une question ouverte ("Avez-vous besoin de préciser ?").
- INTERDIT : pavé de texte sans structure, paragraphe de plus de 3 lignes, réponse sans mise en forme.

RÈGLES DE RÉSOLUTION :
- "answered" : UNIQUEMENT si l'utilisateur dit explicitement "ça marche" / "merci c'est bon" / "c'est résolu" / "parfait merci". Le ticket est alors résolu.
- "troubleshooting" : tu réponds et proposes une solution, le ticket RESTE OUVERT (défaut).
- "escalate" : sécurité, remboursement Stripe, suppression de compte, fraude, ou action impossible pour l'IA.

INTERDIT :
- Tu NE PEUX PAS exécuter d'action (inscription, dégel, transfert, remboursement, crédits).
- Si l'utilisateur demande une action, explique comment la faire lui-même via l'interface eza, OU escalade vers l'équipe humaine.
- Ne dis jamais "je vais le faire pour vous" ou "je m'inscris pour vous" — tu ne peux qu'informer ou escalader.
- Ne marque JAMAIS "answered" si l'utilisateur n'a pas confirmé que ça marche.
- N'invente jamais l'état du compte : ne décris QUE ce que tu as vérifié dans la recherche.

Si l'utilisateur dit "ça marche" / "merci c'est bon" / "c'est résolu" → "answered".
Si l'utilisateur dit "non ça ne marche pas" / pose une nouvelle question → "troubleshooting".`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          resolution_type: { type: 'string' },
          escalation_reason: { type: 'string' },
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

    const reopening = ticket.status === 'ai_resolved' || ticket.status === 'resolved';
    const resolved = rtype === 'answered' && !reopening;
    const escalated = rtype === 'escalate';
    const newStatus = escalated ? 'awaiting_human' : (resolved ? 'ai_resolved' : 'open');
    const assignee = escalated ? 'human' : 'ai';
    const handledBy = escalated ? 'escalated' : 'ai';

    const finalMessages = [...newMessages, {
      role: 'assistant',
      content: reply,
      steps,
      at: new Date().toISOString(),
    }];

    const updated = await base44.entities.SupportTicket.update(ticketId, {
      status: newStatus,
      assignee,
      handled_by: handledBy,
      ai_handled: resolved,
      escalation_reason: escalation,
      messages: finalMessages,
    }).catch(() => null);

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
      summary: `Ticket #${String(ticketId).slice(-6)} — ${resolved ? 'résolu IA' : escalated ? 'escaladé' : 'répondu (ouvert)'}`,
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