import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps } from '../../shared/supportKnowledge.ts';

// Support IA automatique — déclenché à la création d'un ticket SupportTicket.
// L'IA catégorise, priorise, rédige une réponse, et soit résout soit escalade vers un humain.
// Met à jour le ticket (catégorie, priorité, statut, résumé, message IA) + notifie l'utilisateur
// et les admins en cas d'escalade.

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
    let walletData = null;
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
  "can_auto_resolve": true|false,
  "summary": "résumé court en français",
  "reply": "réponse 2-6 phrases, markdown, avec une solution concrète tirée de la doc",
  "escalation_reason": "raison courte si can_auto_resolve=false, sinon null"
}

Demande de ${userName} :
"""
${question}
"""

ESCALADE UNIQUEMENT si : bug bloquant confirmé, sécurité, remboursement, suppression de compte. Tout le reste → résous avec la doc. Ne dis jamais "je transmets à l'équipe" si tu peux répondre.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority: { type: 'string' },
          can_auto_resolve: { type: 'boolean' },
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
    const auto = ai.can_auto_resolve !== false;
    const reply = ai.reply || 'Votre demande a bien été reçue. Notre équipe vous répond au plus vite.';
    const summary = ai.summary || question.slice(0, 120);
    const status = auto ? 'ai_resolved' : 'awaiting_human';

    const steps = buildResearchSteps({
      hasRelatedPost: !!relatedPostData,
      hasRelatedConversation: data.related_item_type === 'conversation',
      category: cat,
    }).map((s) => ({ ...s, status: 'done' }));

    const updated = await base44.asServiceRole.entities.SupportTicket.update(ticketId, {
      category: cat,
      priority: prio,
      status,
      ai_summary: summary,
      ai_handled: auto,
      escalation_reason: auto ? undefined : (ai.escalation_reason || 'Nécessite intervention humaine'),
      messages: [
        ...(Array.isArray(data.messages) ? data.messages : []),
        { role: 'assistant', content: reply, steps, at: new Date().toISOString() },
      ],
    }).catch(() => null);

    // Email à l'utilisateur
    if (data.user_email) {
      await sendEzaEmail(base44, {
        to: data.user_email,
        subject: auto ? '✅ Votre demande eza a été traitée' : '🔄 Votre demande eza est en cours de traitement',
        title: auto ? 'Réponse de Nexus' : 'Nexus a transmis votre demande',
        body: `Bonjour **${userName}**,\n\n${reply}\n\n${auto ? 'Si votre demande n\'est pas résolue, répondez à cet email ou ouvrez un nouveau ticket.' : 'Un membre de l\'équipe eza reprend le dossier et vous répond sous 24-48h.'}\n\n— Nexus, support eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    // Escalade : notifier les admins
    if (!auto) {
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
      summary: auto
        ? `Ticket #${ticketId.slice(-6)} résolu par IA (${cat}/${prio})`
        : `Ticket #${ticketId.slice(-6)} escaladé (${cat}/${prio})`,
      details: summary,
      count: 1,
    });

    return Response.json({ ok: true, ticketId, status, category: cat });
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