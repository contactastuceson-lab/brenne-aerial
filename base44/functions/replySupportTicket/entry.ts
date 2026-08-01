import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';
import { buildUserContext } from '../../shared/supportUserContext.ts';
import { EZA_KNOWLEDGE, buildResearchSteps } from '../../shared/supportKnowledge.ts';

// Réponse utilisateur sur un ticket existant : Nexus fait d'abord de la recherche
// (doc, publication concernée, solde, compte), affiche ses étapes, PUIS répond.
// N'escalade que si vraiment nécessaire (bug bloquant, sécurité, remboursement, etc.).

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

    // --- RECHERCHE CONTEXTUELLE (ce que Nexus "fait" et affiche) ---
    const researchBits = [];
    let relatedPostData = null;
    let walletData = null;

    // 1. Publication concernée
    if (ticket.related_item_type === 'post' && ticket.related_item_id) {
      relatedPostData = await base44.asServiceRole.entities.Post.get(ticket.related_item_id).catch(() => null);
      if (relatedPostData) {
        researchBits.push(`PUBLICATION CONCERNÉE (examinée par Nexus) :\n- Auteur : ${relatedPostData.author_username || '?'}\n- Contenu : ${(relatedPostData.content || '').slice(0, 400)}\n- Likes : ${relatedPostData.likes_count || 0} · Vues : ${relatedPostData.views_count || 0}\n- Visibilité : ${relatedPostData.visibility || 'public'}`);
      }
    }

    // 2. Solde / wallet si crédits ou facturation
    if (ticket.category === 'credits' || ticket.category === 'billing') {
      try {
        const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id }).catch(() => []);
        walletData = wallets;
        const total = (wallets || []).reduce((s, w) => s + (w.balance || 0), 0);
        researchBits.push(`SOLDE EZA (vérifié) : ${total} crédits répartis sur ${wallets?.length || 0} wallet(s). Gelé : ${wallets?.some((w) => w.frozen) ? 'oui' : 'non'}.`);
      } catch {}
    }

    // 3. Contexte utilisateur complet
    const { text: contextText } = await buildUserContext(base44, user.id, user.email);

    // 4. Historique condensé
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
  "reply": "réponse en français, 2-6 phrases, markdown. Utilise les données de recherche pour personnaliser. Propose TOUJOURS une solution concrète d'abord.",
  "can_auto_resolve": true|false,
  "escalation_reason": "raison courte si can_auto_resolve=false, sinon null"
}

ESCALADE — UNIQUEMENT si :
- Bug technique bloquant confirmé (pas un simple "ça ne marche pas" vague).
- Problème de sécurité (compte piraté, données).
- Demande explicite de remboursement.
- Demande de suppression de compte.
- L'utilisateur a déjà insisté 3+ fois sans solution dans l'historique.

Si tu peux répondre avec la doc → can_auto_resolve=true. Si c'est une info sur le fonctionnement (crédits, parrainage, events, boutique) → résous. Ne dis JAMAIS "je transmets à l'équipe" si tu peux répondre toi-même.`;

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
      reply = ai.reply || "J'ai bien reçu votre message.";
      auto = ai.can_auto_resolve !== false;
      escalation = auto ? null : (ai.escalation_reason || 'Nécessite intervention humaine');
    }

    const finalMessages = [...newMessages, {
      role: 'assistant',
      content: reply,
      steps: steps.map((s) => ({ ...s, status: 'done' })),
      at: new Date().toISOString(),
    }];
    const newStatus = auto ? 'ai_resolved' : 'awaiting_human';

    const updated = await base44.entities.SupportTicket.update(ticketId, {
      status: newStatus,
      ai_handled: auto,
      escalation_reason: escalation,
      messages: finalMessages,
    }).catch(() => null);

    if (ticket.user_email) {
      await sendEzaEmail(base44, {
        to: ticket.user_email,
        subject: auto ? '✅ Suite de votre ticket eza' : '🔄 Votre ticket eza est en cours de traitement',
        title: 'Réponse de Nexus',
        body: `Bonjour,\n\n${reply}\n\n${auto ? 'Si votre demande n\'est pas résolue, répondez sur le ticket.' : 'L\'équipe eza reprend le dossier.'}\n\n— Nexus, support eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    if (!auto) {
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
      summary: `Ticket #${String(ticketId).slice(-6)} — ${auto ? 'résolu IA' : 'escaladé'} (${steps.length} étapes de recherche)`,
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