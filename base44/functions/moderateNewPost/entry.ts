import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { logAutomation } from '../../shared/logAutomation.ts';

// Automatisation (entity on Post create) : scanne le contenu d'un nouveau post
// via un LLM et crée un signalement (Report) + notifie les admins si le contenu
// est détecté comme problématique (haine, harcèlement, spam, arnaque, illégal).
// N'agis pas sur les opinions légitimes ni le débat d'idées.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const post = payload.data || payload;
    const content = String(post.content || '').slice(0, 2000);
    if (!content.trim()) return Response.json({ ok: true, skipped: true });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es le modérateur automatique de la plateforme eza (réseau communautaire/professionnel français).
Analyse le post ci-dessous et détecte UNIQUEMENT : discours haineux, harcèlement ciblé, incitation à la violence, contenu sexuel explicite, spam évident, arnaque/scam, ou incitation à des activités illégales.
Ne signale PAS les opinions légitimes, la critique, le débat d'idées, l'humour ou le contenu simplement déplacé mais légal.
Post à analyser :
"""${content}"""`,
      response_json_schema: {
        type: 'object',
        properties: {
          flagged: { type: 'boolean' },
          reason: { type: 'string' },
          category: { type: 'string' },
        },
      },
    }).catch(() => null);

    if (!result || !result.flagged) return Response.json({ ok: true, flagged: false });

    const validCats = ['spam', 'harcelement', 'contenu_inapproprie', 'usurpation', 'autre'];
    const category = validCats.includes(result.category) ? result.category : 'autre';

    // Signalement pour l'administration
    await base44.asServiceRole.entities.Report.create({
      reporter_email: 'nexus@eza.group',
      reporter_name: 'Nexus (modération auto)',
      target_type: 'message',
      target_id: String(post.id || payload?.entity_id || ''),
      target_email: String(post.author_username || ''),
      target_name: String(post.author_name || post.author_username || 'Auteur'),
      reason: category,
      details: `Détection automatique par Nexus : ${result.reason || 'contenu sensible détecté'}`,
      message_content: content.slice(0, 500),
      status: 'pending',
      admin_notes: 'Modération auto — à vérifier par un admin',
    }).catch(() => {});

    // Notifier les admins
    const admins = await base44.asServiceRole.entities.User.list().catch(() => []);
    const adminEmails = (admins || []).filter((u) => u.role === 'admin').map((u) => u.email);
    await Promise.all(
      adminEmails.map((email) =>
        base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'system',
          title: '🚨 Post signalé par la modération auto',
          content: `Nexus a détecté un contenu potentiellement problématique (${result.reason || 'à vérifier'}). À examiner dans l'administration.`,
          link: '/admin/reports',
          sender_name: 'Nexus',
        }).catch(() => {})
      )
    );

    await logAutomation(base44, {
      automation_name: 'moderate_new_post', label: 'Modération auto des nouveaux posts', category: 'moderation',
      status: 'warning',
      summary: `Post signalé (${category}) — ${result.reason || 'contenu sensible'}`,
      details: content.slice(0, 500),
    });

    return Response.json({ ok: true, flagged: true, reason: result.reason, category });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}