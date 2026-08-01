import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

/**
 * NEXUS — IA de direction eza (Super Admin).
 * Assistant privé du PDG / PDG-Adjoint avec contexte live de la plateforme,
 * outils d'administration complets et ton exécutif professionnel.
 */

const PDG_EMAILS = ['contact.astuceson@gmail.com', 'thecommitteescp@gmail.com'];
const PDG_ADJOINT_EMAILS = ['sentenccborys@gmail.com'];

const ROLE_CONFIG = {
  owner: { label: 'PDG', level: 100 },
  pdg_adjoint: { label: 'PDG-Adjoint', level: 100 },
  conseil_admin: { label: "Conseil d'Administration", level: 80 },
  admin: { label: 'Administrateur', level: 70 },
  directeur: { label: 'Directeur', level: 60 },
  responsable: { label: 'Responsable', level: 50 },
  collaborateur_interne: { label: 'Collaborateur Interne', level: 40 },
  vip: { label: 'VIP', level: 20 },
  collaborateur: { label: 'Collaborateur', level: 15 },
  pilote: { label: 'Pilote', level: 15 },
  user: { label: 'Membre', level: 10 },
};

function getUserLevel(user) {
  if (!user) return 0;
  if (user.role === 'owner' || PDG_EMAILS.includes(user.email)) return 100;
  if (user.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user.email)) return 100;
  return ROLE_CONFIG[user.role]?.level || 10;
}

// ─── CONTEXTE LIVE ──────────────────────────────────────────────────────────
// Snapshot léger injecté dans chaque prompt pour que Nexus connaisse l'état réel.

async function buildLiveContext(base44) {
  const since = Date.now() - 24 * 3600 * 1000;
  const dayAgo = (d) => d && new Date(d).getTime() > since;
  const [users, reports, events, regs, campaigns, delReqs, cancelReqs, certs, logs] = await Promise.all([
    base44.asServiceRole.entities.User.list().catch(() => []),
    base44.asServiceRole.entities.Report.filter({ status: 'pending' }).catch(() => []),
    base44.asServiceRole.entities.Event.list('-start_date', 30).catch(() => []),
    base44.asServiceRole.entities.EventRegistration.list('-created_date', 100).catch(() => []),
    base44.asServiceRole.entities.AdCampaign.filter({ status: 'active' }).catch(() => []),
    base44.asServiceRole.entities.DeletionRequest.filter({ status: 'pending' }).catch(() => []),
    base44.asServiceRole.entities.EventRegistration.filter({ cancel_request_status: 'pending' }).catch(() => []),
    base44.asServiceRole.entities.CertificationRequest.filter({ status: 'pending' }).catch(() => []),
    base44.asServiceRole.entities.AutomationLog.list('-run_at', 8).catch(() => []),
  ]);

  const eventsBientotComplets = (events || []).filter(
    (e) => e.status === 'upcoming' && Number(e.capacity) > 0 && e.attendees_count / e.capacity >= 0.8
  ).map((e) => `${e.title} (${e.attendees_count}/${e.capacity})`);

  return {
    date: new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
    total_utilisateurs: (users || []).length,
    nouveaux_utilisateurs_24h: (users || []).filter((u) => dayAgo(u.created_date)).length,
    signalements_en_attente: (reports || []).length,
    demandes_remboursement_en_attente: (cancelReqs || []).length,
    demandes_suppression_en_attente: (delReqs || []).length,
    certifications_en_attente: (certs || []).length,
    evenements_a_venir: (events || []).filter((e) => e.status === 'upcoming').length,
    nouvelles_inscriptions_24h: (regs || []).filter((r) => dayAgo(r.registered_at || r.created_date)).length,
    campagnes_pub_actives: (campaigns || []).length,
    evenements_bientot_complets: eventsBientotComplets,
    dernieres_automatisations: (logs || []).slice(0, 6).map((l) => `${l.label} — ${l.status} (${l.summary || ''})`),
  };
}

// ─── OUTILS ──────────────────────────────────────────────────────────────────

async function listUsers(base44) {
  const res = await base44.asServiceRole.functions.invoke('adminGetUsers', {});
  return res?.data?.users || [];
}

async function getUserStats(base44) {
  const users = await listUsers(base44);
  return {
    total_users: users.length,
    roles_breakdown: Object.entries(
      users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
    ).map(([role, count]) => ({ role, count })),
  };
}

async function listQuotes(base44, status) {
  const all = await base44.asServiceRole.entities.Quote.list('-created_date', 30);
  return status ? all.filter((q) => q.status === status) : all;
}

async function updateQuoteStatus(base44, quoteId, status, notes) {
  const update = { status };
  if (notes) update.admin_notes = notes;
  await base44.asServiceRole.entities.Quote.update(quoteId, update);
  return { success: true, message: `Devis ${quoteId} → ${status}` };
}

async function listEmployees(base44) {
  return await base44.asServiceRole.entities.Employee.list('-created_date');
}

async function listReports(base44) {
  return await base44.asServiceRole.entities.Report.list('-created_date', 20);
}

async function listUpcomingEvents(base44) {
  const all = await base44.asServiceRole.entities.Event.list('-start_date', 20);
  return all.filter((e) => e.status === 'upcoming');
}

async function listPendingRefunds(base44) {
  return await base44.asServiceRole.entities.EventRegistration.filter({ cancel_request_status: 'pending' }).catch(() => []);
}

async function getAutomationHealth(base44) {
  const logs = await base44.asServiceRole.entities.AutomationLog.list('-run_at', 15).catch(() => []);
  return {
    total_recent: logs.length,
    success: logs.filter((l) => l.status === 'success').length,
    warning: logs.filter((l) => l.status === 'warning').length,
    error: logs.filter((l) => l.status === 'error').length,
    recent: logs.slice(0, 8).map((l) => ({ label: l.label, status: l.status, summary: l.summary, run_at: l.run_at })),
  };
}

async function sendAnnouncementEmail(base44, subject, body, targetEmail) {
  return await sendEzaEmail(base44, {
    to: targetEmail, subject, body, fromName: 'eza — Direction', title: subject, tagline: 'Direction',
  });
}

async function createAnnouncement(base44, title, content, type) {
  const ann = await base44.asServiceRole.entities.Announcement.create({
    title, content, type: type || 'info', is_active: true, target: 'all',
  });
  return { success: true, id: ann.id, message: 'Annonce créée avec succès' };
}

async function getAppSettings(base44) {
  return await base44.asServiceRole.entities.AppSettings.list();
}

async function executeTool(base44, toolName, params) {
  switch (toolName) {
    case 'list_users': return await listUsers(base44);
    case 'get_stats': return await getUserStats(base44);
    case 'list_quotes': return await listQuotes(base44, params.status);
    case 'update_quote_status': return await updateQuoteStatus(base44, params.quoteId, params.status, params.notes);
    case 'list_employees': return await listEmployees(base44);
    case 'list_reports': return await listReports(base44);
    case 'list_upcoming_events': return await listUpcomingEvents(base44);
    case 'list_pending_refunds': return await listPendingRefunds(base44);
    case 'get_automation_health': return await getAutomationHealth(base44);
    case 'send_email': return await sendAnnouncementEmail(base44, params.subject, params.body, params.to);
    case 'create_announcement': return await createAnnouncement(base44, params.title, params.content, params.type);
    case 'get_app_settings': return await getAppSettings(base44);
    default: return { error: `Outil inconnu: ${toolName}` };
  }
}

// ─── PROMPT SYSTÈME ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es NEXUS, l'IA de direction d'eza — assistant stratégique privé du PDG et du PDG-Adjoint.
Tu as une vision complète de la plateforme et des pouvoirs d'administration étendus.

PERSONNALITÉ : ton exécutif, concis, anticipatif. Tu raisonnes comme un chief of staff : tu identifies les priorités, tu proposes des actions concrètes, tu alertes sur les risques. Tu termines toujours par ta signature : "— Nexus, IA de direction eza".

CONTEXTE LIVE DE LA PLATEFORME (injecté à chaque message) :
{live_context}

OUTILS — pour agir, réponds sur une ligne isolée au format exact :
TOOL_CALL: {"tool": "nom", "params": {...}}

Outils disponibles :
- list_users → tous les utilisateurs
- get_stats → statistiques globales + répartition des rôles
- list_quotes → params: {status?} — pending/reviewing/accepted/refused/completed
- update_quote_status → params: {quoteId, status, notes?}
- list_employees → équipe interne
- list_reports → signalements en attente
- list_upcoming_events → événements à venir
- list_pending_refunds → demandes de remboursement en attente
- get_automation_health → santé des automatisations (succès/alertes/erreurs récentes)
- send_email → params: {to, subject, body} — destinataires enregistrés uniquement (sinon signale-le)
- create_announcement → params: {title, content, type} — info/warning/success/error
- get_app_settings → paramètres de l'app

RÈGLES :
1. Toujours en français, concis et professionnel.
2. Avant toute action destructive ou sensible (rôle, statut, envoi groupé), confirme avec le PDG.
3. Après chaque outil, résume le résultat et propose la suite logique.
4. Mets en avant les points d'attention du contexte live (remboursements, événements bientôt complets, automatisations en erreur).
5. Pour modifier un rôle, commence TOUJOURS par list_users pour obtenir l'ID exact.
6. Tu as tous les droits — utilise-les avec discernement et transparence.`;

// ─── HANDLER ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const level = getUserLevel(user);
    if (level < 100) return Response.json({ error: 'Accès réservé PDG / PDG-Adjoint' }, { status: 403 });

    const body = await req.json();
    const { messages, tool_result } = body;
    const conversationMessages = messages || [];

    const liveCtx = await buildLiveContext(base44);
    const systemPrompt = SYSTEM_PROMPT.replace('{live_context}', JSON.stringify(liveCtx, null, 2));

    const historyText = conversationMessages
      .map((m) => `${m.role === 'user' ? 'PDG' : 'NEXUS'}: ${m.content}`)
      .join('\n\n');

    let fullPrompt = `${systemPrompt}\n\n═══════════════════════════════════\nCONVERSATION:\n${historyText}\n\nNEXUS:`;
    if (tool_result) {
      const resultText = JSON.stringify(tool_result.result, null, 2);
      fullPrompt = `${systemPrompt}\n\n═══════════════════════════════════\nCONVERSATION:\n${historyText}\n\nRésultat de l'outil "${tool_result.tool}":\n\`\`\`json\n${resultText}\n\`\`\`\n\nNEXUS (analyse ce résultat et propose la suite):`;
    }

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
    });

    const toolCallMatch = aiResponse.match(/TOOL_CALL:\s*(\{.*\})/);
    if (toolCallMatch) {
      let toolCall;
      try { toolCall = JSON.parse(toolCallMatch[1]); }
      catch { return Response.json({ content: aiResponse, tool_call: null }); }

      const result = await executeTool(base44, toolCall.tool, toolCall.params || {});
      const cleanResponse = aiResponse.replace(/TOOL_CALL:\s*\{.*\}/, '').trim();

      await logAutomation(base44, {
        automation_name: 'pdg_ai_agent',
        label: 'Nexus — action PDG',
        category: 'system',
        status: 'success',
        summary: `${user.email} → ${toolCall.tool}`,
        details: cleanResponse.slice(0, 300),
      });

      return Response.json({
        content: cleanResponse || `⚙️ Exécution de \`${toolCall.tool}\`…`,
        tool_call: { tool: toolCall.tool, params: toolCall.params },
        tool_result: result,
      });
    }

    return Response.json({ content: aiResponse, tool_call: null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});