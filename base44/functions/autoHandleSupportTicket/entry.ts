import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps, buildRelatedItemResearch } from '../../shared/supportKnowledge.ts';

// Support IA automatique — déclenché à la création d'un ticket SupportTicket.
// L'IA catégorise, priorise, fait sa recherche, puis applique UNE des trois résolutions :
//   - "answered"       : question d'info pure, réponse complète → ticket résolu par Nexus
//   - "troubleshooting" : bug / action à accomplir → étapes proposées, ticket RESTE OUVERT
//   - "escalate"        : critique uniquement (sécurité, remboursement, bug bloquant, suppression) → humain

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body?.event || {};
    const data = body?.data || event?.data || body;
    const ticketId = data?.id || event?.entity_id;

    if (!ticketId) {
      return Response.json({ ok: false, error: 'ticket id manquant' }, { status: 400 });
    }

    const userMessage = Array.isArray(data.messages) && data.messages.length
      ? (data.messages.find((m) => m.role === 'user') || data.messages[data.messages.length - 1])
      : { content: data.subject || '' };
    const question = (userMessage?.content || data.subject || '').toString();

    if (!question.trim()) {
      return Response.json({ ok: true, skipped: true });
    }

    const userName = data.user_name || data.user_email || 'utilisatrice';

    const { text: contextText } = await buildUserContext(base44, data.user_id, data.user_email).catch(() => ({ text: '' }));

    // --- RECHERCHE CONTEXTUELLE ---
    const researchBits = [];

    // Élément concerné : recherche RÉELLE par type (tous les types du wizard).
    const relatedResearch = await buildRelatedItemResearch(base44, data.related_item_type, data.related_item_id);
    if (relatedResearch.researchBit) researchBits.push(relatedResearch.researchBit);

    // Événements : contexte informatif uniquement (Nexus n'exécute aucune action)
    if (data.category === 'events' || /événement|evenement|event|inscription|inscrire|je m'inscr/i.test(question)) {
      try {
        const all = await base44.asServiceRole.entities.Event.filter({}, 'start_date', 30).catch(() => []);
        const now = Date.now();
        const upcoming = (all || []).filter((e) => e.status !== 'cancelled' && (!e.end_date || new Date(e.end_date).getTime() >= now) && (!e.capacity || (e.attendees_count || 0) < e.capacity));
        if (upcoming.length) {
          researchBits.push(`ÉVÉNEMENTS À VENIR (informatif) :\n${upcoming.slice(0, 8).map((e) => `- « ${e.title} » · ${e.start_date ? e.start_date.slice(0, 10) : '?'} · ${e.price_credits || 0} crédits · ${e.city || ''}`).join('\n')}`);
        }
      } catch {}
    }

    const prompt = `Tu es NEXUS, l'IA de support eza. Tu RÉPONDS aux questions et ORIENTES les utilisateurs. Tu NE PEUX PAS exécuter d'actions sur le compte (pas d'inscription, pas de remboursement, pas de dégel, pas de transfert). Ton rôle est purement informatif. Tu viens de lire la documentation${relatedResearch.researchBit ? ", examiner l'élément concerné" : ''}. Tu réponds avec ce contexte.

${EZA_KNOWLEDGE}

${contextText}

${researchBits.length ? '--- RECHERCHE ---\n' + researchBits.join('\n') : ''}

Analyse la demande et renvoie un JSON STRICT :
{
  "category": "account|billing|credits|bug|feature|events|moderation|other",
  "priority": "low|medium|high|urgent",
  "resolution_type": "troubleshooting|escalate",
  "summary": "résumé court en français",
  "reply": "réponse markdown STRUCTURÉE — introduction 1 ligne, puces, gras, jamais de pavé",
  "escalation_reason": "raison courte si resolution_type=escalate, sinon null"
}

RÈGLES DE RÉSOLUTION (CRITIQUE — respecte-les strictement) :
- "troubleshooting" : tu réponds et proposes une solution. Le ticket RESTE OUVERT jusqu'à ce que l'utilisateur confirme que ça marche. C'est le COMPORTEMENT PAR DÉFAUT.
- "escalate" : UNIQUEMENT si l'un de ces cas :
    • Problème de sécurité (compte piraté, fuite de données, harcèlement).
    • Demande explicite de remboursement / transaction financière.
    • Bug bloquant confirmé (impossible d'utiliser une fonctionnalité core).
    • Demande de suppression de compte.
    • L'utilisateur insiste 3+ fois sans solution dans l'historique.

INTERDIT :
- Escalader "par précaution" ou par défaut.
- Résoudre ou fermer le ticket — le ticket RESTE OUVERT. Ce n'est jamais à toi de décider.
- Dire "je transmets à l'équipe" si tu peux répondre toi-même avec la doc.
- Demander à l'utilisateur de réessayer plus tard sans avoir proposé de solution.
- Tu NE PEUX PAS exécuter d'actions (inscription, remboursement, dégel, transfert). Si l'utilisateur demande une action, explique comment la faire lui-même via l'interface eza, ou escalade vers l'équipe humaine.

Demande de ${userName} :
"""
${question}
"""`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority: { type: 'string' },
          resolution_type: { type: 'string' },
          summary: { type: 'string' },
          reply: { type: 'string' },
          escalation_reason: { type: 'string' },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    if (ai?.__error) {
      await logAutomation(base44, {
        automation_name: 'auto_handle_support_ticket',
        label: 'Support IA automatique',
        category: 'system',
        status: 'error',
        summary: 'Échec appel LLM',
        details: ai.__error,
      });
      return Response.json({ ok: false, error: ai.__error }, { status: 500 });
    }

    const cat = ai.category || 'other';
    const prio = ai.priority || 'medium';
    // JAMAIS résoudre au premier message — le ticket RESTE OUVERT jusqu'à confirmation utilisateur.
    // Seul "escalate" peut sortir du statut open (vers awaiting_human).
    const rtype = ai.resolution_type === 'escalate' ? 'escalate' : 'troubleshooting';
    const reply = ai.reply || "Votre demande a bien été reçue. Pouvez-vous préciser ce que vous essayez de faire ?";
    const summary = ai.summary || question.slice(0, 120);

    const escalated = rtype === 'escalate';
    const resolved = false; // JAMAIS résolu à la création
    const status = escalated ? 'awaiting_human' : 'open';
    const assignee = escalated ? 'human' : 'ai';
    const handledBy = escalated ? 'escalated' : 'ai';

    const steps = buildResearchSteps({
      relatedStep: relatedResearch.step,
      relatedType: data.related_item_type,
      category: cat,
    }).map((s) => ({ ...s, status: 'done' }));

    await base44.asServiceRole.entities.SupportTicket.update(ticketId, {
      category: cat,
      priority: prio,
      status,
      assignee,
      handled_by: handledBy,
      ai_summary: summary,
      ai_handled: resolved,
      escalation_reason: escalated ? (ai.escalation_reason || 'Nécessite intervention humaine') : undefined,
      messages: [
        ...(Array.isArray(data.messages) ? data.messages : []),
        { role: 'assistant', content: reply, steps, at: new Date().toISOString() },
      ],
    }).catch(() => null);

    // Email à l'utilisateur
    if (data.user_email) {
      await sendEzaEmail(base44, {
        to: data.user_email,
        subject: resolved ? '✅ Votre demande eza a été traitée' : escalated ? '🔄 Votre demande eza est transmise à un humain' : '💬 Nexus a répondu à votre ticket',
        title: resolved ? 'Réponse de Nexus' : escalated ? 'Transmis à l\'équipe eza' : 'Réponse de Nexus',
        body: `Bonjour **${userName}**,\n\n${reply}\n\n${resolved ? 'Si votre demande n\'est pas résolue, répondez à ce ticket pour le rouvrir.' : escalated ? 'Un membre de l\'équipe eza reprend le dossier et vous répond sous 24-48h.' : 'Répondez sur le ticket pour confirmer si la solution fonctionne — le ticket reste ouvert jusqu\'à votre confirmation.'}\n\n— Nexus, support eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    // Escalade : notifier les admins
    if (escalated) {
      try {
        const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
        const adminEmails = (admins || []).filter((u) => u.role === 'admin' || u.role === 'owner').map((u) => u.email);
        for (const email of adminEmails.slice(0, 25)) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'system',
            title: `🎫 Ticket escaladé (${cat} · ${prio})`,
            content: `${summary} — ${ai.escalation_reason || 'Escalade humaine requise'}`,
            link: '/admin/support',
            sender_name: 'Nexus Support',
          }).catch(() => {});
        }
      } catch {}
    }

    await logAutomation(base44, {
      automation_name: 'auto_handle_support_ticket',
      label: 'Support IA automatique',
      category: 'system',
      status: 'success',
      summary: `Ticket #${String(ticketId).slice(-6)} — ${resolved ? 'résolu IA' : escalated ? 'escaladé' : 'répondu (ouvert)'} (${cat}/${prio})`,
      details: summary,
      count: 1,
    });

    return Response.json({ ok: true, ticketId, status, category: cat, resolution_type: rtype });
  } catch (error) {
    if (base44) {
      await logAutomation(base44, {
        automation_name: 'auto_handle_support_ticket',
        label: 'Support IA automatique',
        category: 'system',
        status: 'error',
        summary: 'Échec du traitement IA du ticket',
        details: String(error?.message || error),
      }).catch(() => {});
    }
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}