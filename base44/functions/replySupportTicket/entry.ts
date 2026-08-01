import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';

// Réponse utilisateur sur un ticket existant : ajoute le message, ré-invoque
// Nexus avec l'historique complet de la conversation + le contexte utilisateur,
// ajoute la réponse IA, et met à jour le statut. Appelée depuis la page ticket.

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

    // Récupère le ticket (RLS autorise le propriétaire par email)
    const ticket = await base44.entities.SupportTicket.get(ticketId).catch(() => null);
    if (!ticket) return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    if (ticket.user_email !== user.email) {
      return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    }

    const history = Array.isArray(ticket.messages) ? ticket.messages : [];
    const newMessages = [...history, { role: 'user', content, at: new Date().toISOString() }];

    // Contexte utilisateur complet
    const { text: contextText } = await buildUserContext(base44, user.id, user.email);

    // Historique condensé pour le LLM
    const conv = newMessages
      .map((m) => (m.role === 'user' ? 'UTILISATEUR' : m.role === 'admin' ? 'ADMIN' : 'NEXUS') + ': ' + (m.content || ''))
      .join('\n');

    const prompt = `Tu es NEXUS, l'IA de support de la plateforme eza (ezagroup.org). eza est un réseau professionnel/communautaire : profil, posts, stories, communities, Spaces (audio live), events, boutique, banque de crédits Eza, parrainage, certifications, badges, abonnements Business/Enterprise.

${contextText}

--- HISTORIQUE DE LA CONVERSATION ---
${conv}

Continue la conversation en répondant au dernier message de l'utilisateur. Tu connais son compte, son solde, son activité — utilise-les pour donner une réponse personnalisée et précise.

Renvoie un JSON STRICT conforme à ce schéma :
{
  "reply": "réponse en français, bienveillante, 2-6 phrases, markdown autorisé. Utilise le contexte utilisateur pour personnaliser (ex: solde, événements à venir, parrainages).",
  "can_auto_resolve": true|false,
  "escalation_reason": "raison courte si can_auto_resolve=false, sinon null"
}

Règles :
- Reste factuel sur le fonctionnement de la plateforme (crédits, parrainage /parrainage, boutique /boutique, events /events).
- Bug bloquant / sécurité / modération / remboursement : escalade (can_auto_resolve=false).
- Ne jamais promettre de remboursement, ne jamais donner d'email de support direct.
- Si l'utilisateur semble satisfait ou remercie, tu peux clore aimablement.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          can_auto_resolve: { type: 'boolean' },
          escalation_reason: { type: 'string' },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    let reply, auto, escalation;
    if (ai?.__error) {
      reply = "J'ai bien reçu votre message. Un membre de l'équipe eza vous répondra sous peu.";
      auto = false;
      escalation = 'Erreur de traitement IA';
    } else {
      reply = ai.reply || reply;
      auto = ai.can_auto_resolve !== false;
      escalation = auto ? null : (ai.escalation_reason || 'Nécessite intervention humaine');
    }

    const finalMessages = [...newMessages, { role: 'assistant', content: reply, at: new Date().toISOString() }];
    const newStatus = auto ? 'ai_resolved' : 'awaiting_human';

    const updated = await base44.entities.SupportTicket.update(ticketId, {
      status: newStatus,
      ai_handled: auto,
      escalation_reason: escalation,
      messages: finalMessages,
    }).catch(() => null);

    // Email de suivi
    if (ticket.user_email) {
      await sendEzaEmail(base44, {
        to: ticket.user_email,
        subject: auto ? '✅ Suite de votre ticket eza' : '🔄 Votre ticket eza est en cours de traitement',
        title: 'Réponse de Nexus',
        body: `Bonjour,\n\n${reply}\n\n${auto ? 'Si votre demande n\'est pas résolue, répondez sur le ticket.' : 'L\'équipe eza reprend le dossier.'}\n\n— Nexus, support eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    // Escalade : notif admins
    if (!auto) {
      try {
        const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
        for (const email of (admins || []).filter((u) => u.role === 'admin' || u.role === 'owner').map((u) => u.email).slice(0, 25)) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: email, type: 'system',
            title: `🎫 Ticket #${String(ticketId).slice(-6)} relancé et escaladé`,
            content: content.slice(0, 200), link: '/admin/support', sender_name: 'Nexus Support',
          }).catch(() => {});
        }
      } catch {}
    }

    await logAutomation(base44, {
      automation_name: 'reply_support_ticket', label: 'Support IA — réponse utilisateur', category: 'system',
      status: 'success',
      summary: `Ticket #${String(ticketId).slice(-6)} — ${auto ? 'résolu IA' : 'escaladé'}`,
      count: 1,
    }).catch(() => {});

    return Response.json({ ok: true, ticket: updated || { ...ticket, messages: finalMessages, status: newStatus } });
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