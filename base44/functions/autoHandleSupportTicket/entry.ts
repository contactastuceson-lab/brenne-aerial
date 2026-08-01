import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps } from '../../shared/supportKnowledge.ts';

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
    let relatedPostData = null;
    const researchBits = [];

    if (data.related_item_type === 'post' && data.related_item_id) {
      relatedPostData = await base44.asServiceRole.entities.Post.get(data.related_item_id).catch(() => null);
      if (relatedPostData) {
        researchBits.push(`PUBLICATION CONCERNÉE : auteur ${relatedPostData.author_username || '?'}, contenu : ${(relatedPostData.content || '').slice(0, 300)}, likes ${relatedPostData.likes_count || 0}`);
      }
    }

    const prompt = `Tu es NEXUS, l'IA de support eza. Tu viens de lire la documentation${relatedPostData ? ', examiner la publication concernée' : ''}. Tu réponds avec ce contexte.

${EZA_KNOWLEDGE}

${contextText}

${researchBits.length ? '--- RECHERCHE ---\n' + researchBits.join('\n') : ''}

Analyse la demande et renvoie un JSON STRICT :
{
  "category": "account|billing|credits|bug|feature|events|moderation|other",
  "priority": "low|medium|high|urgent",
  "resolution_type": "answered|troubleshooting|escalate",
  "summary": "résumé court en français",
  "reply": "réponse 2-6 phrases, markdown, avec une solution concrète tirée de la doc",
  "escalation_reason": "raison courte si resolution_type=escalate, sinon null"
}

RÈGLES DE RÉSOLUTION (CRITIQUE — respecte-les strictement) :
- "answered" : la demande est une QUESTION D'INFORMATION pure (comment ça marche, où trouver, combien coûte, à quoi ça sert) ET tu peux y répondre COMPLÈTEMENT avec la doc. → ticket résolu.
- "troubleshooting" : la demande est un PROBLÈME, un BUG, une action à accomplir, ou une plainte. Tu proposes des étapes concrètes, MAIS le ticket RESTE OUVERT en attendant la confirmation de l'utilisateur. NE JAMAIS marquer résolu un bug non confirmé par l'utilisateur.
- "escalate" : UNIQUEMENT si l'un de ces cas :
    • Problème de sécurité (compte piraté, fuite de données, harcèlement).
    • Demande explicite de remboursement / transaction financière.
    • Bug bloquant confirmé (impossible d'utiliser une fonctionnalité core).
    • Demande de suppression de compte.
    • L'utilisateur insiste 3+ fois sans solution dans l'historique.

INTERDIT :
- Escalader "par précaution" ou par défaut.
- Marquer "answered" un bug, une plainte, ou un problème non résolu.
- Dire "je transmets à l'équipe" si tu peux répondre toi-même avec la doc.
- Demander à l'utilisateur de réessayer plus tard sans avoir proposé de solution.

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
    const rtype = (ai.resolution_type === 'answered' || ai.resolution_type === 'escalate') ? ai.resolution_type : 'troubleshooting';
    const reply = ai.reply || "Votre demande a bien été reçue. Pouvez-vous préciser ce que vous essayez de faire ?";
    const summary = ai.summary || question.slice(0, 120);

    const escalated = rtype === 'escalate';
    const resolved = rtype === 'answered';
    const status = escalated ? 'awaiting_human' : (resolved ? 'ai_resolved' : 'open');
    const assignee = escalated ? 'human' : 'ai';
    const handledBy = escalated ? 'escalated' : 'ai';

    const steps = buildResearchSteps({
      hasRelatedPost: !!relatedPostData,
      hasRelatedConversation: data.related_item_type === 'conversation',
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