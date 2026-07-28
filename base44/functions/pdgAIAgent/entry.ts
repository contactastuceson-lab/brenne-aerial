import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

/**
 * PDG AI Agent — Assistant IA avec accès total à la plateforme
 * Réservé au PDG et PDG-Adjoint uniquement.
 */

const PDG_EMAILS = ['contact.astuceson@gmail.com', 'thecommitteescp@gmail.com'];
const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];

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

// ─── TOOLS ────────────────────────────────────────────────────────────────────

async function listUsers(base44) {
  const res = await base44.asServiceRole.functions.invoke('adminGetUsers', {});
  return res?.data?.users || [];
}

async function updateUserRole(base44, userId, newRole) {
  await base44.asServiceRole.functions.invoke('adminUpdateUser', { id: userId, data: { role: newRole } });
  return { success: true, message: `Rôle mis à jour : ${newRole}` };
}

async function getUserStats(base44) {
  const users = await listUsers(base44);
  const quotes = await base44.asServiceRole.entities.Quote.list('-created_date', 50);
  const appointments = await base44.asServiceRole.entities.Appointment.list('-created_date', 20);
  const employees = await base44.asServiceRole.entities.Employee.list();
  return {
    total_users: users.length,
    total_quotes: quotes.length,
    total_appointments: appointments.length,
    total_employees: employees.length,
    pending_quotes: quotes.filter(q => q.status === 'pending').length,
    roles_breakdown: Object.entries(
      users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
    ).map(([role, count]) => ({ role, count })),
  };
}

async function listQuotes(base44, status) {
  const all = await base44.asServiceRole.entities.Quote.list('-created_date', 30);
  if (status) return all.filter(q => q.status === status);
  return all;
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

async function sendAnnouncementEmail(base44, subject, body, targetEmail) {
  // targetEmail can be a single address, a comma-separated list, or an array
  return await sendEzaEmail(base44, {
    to: targetEmail,
    subject,
    body,
    fromName: 'eza — Direction',
    title: subject,
    tagline: 'Direction',
  });
}

async function createAnnouncement(base44, title, content, type) {
  const ann = await base44.asServiceRole.entities.Announcement.create({
    title,
    content,
    type: type || 'info',
    is_active: true,
    target: 'all',
  });
  return { success: true, id: ann.id, message: 'Annonce créée avec succès' };
}

async function getAppSettings(base44) {
  return await base44.asServiceRole.entities.AppSettings.list();
}

// ─── TOOL EXECUTION ───────────────────────────────────────────────────────────

async function executeTool(base44, toolName, params) {
  switch (toolName) {
    case 'list_users': return await listUsers(base44);
    case 'update_user_role': return await updateUserRole(base44, params.userId, params.role);
    case 'get_stats': return await getUserStats(base44);
    case 'list_quotes': return await listQuotes(base44, params.status);
    case 'update_quote_status': return await updateQuoteStatus(base44, params.quoteId, params.status, params.notes);
    case 'list_employees': return await listEmployees(base44);
    case 'list_reports': return await listReports(base44);
    case 'send_email': return await sendAnnouncementEmail(base44, params.subject, params.body, params.to);
    case 'create_announcement': return await createAnnouncement(base44, params.title, params.content, params.type);
    case 'get_app_settings': return await getAppSettings(base44);
    default: return { error: `Outil inconnu: ${toolName}` };
  }
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es NEXUS, l'IA Super Admin d'eza. Tu es l'assistant IA privé du PDG et PDG-Adjoint avec des pouvoirs complets sur la plateforme.

Tu peux effectuer les actions suivantes en appelant des outils (format JSON dans ta réponse) :
- Lister et modifier les rôles des utilisateurs
- Consulter les statistiques de la plateforme
- Gérer les devis (voir, accepter, refuser)
- Voir l'équipe et les employés
- Consulter les signalements
- Envoyer des emails officiels
- Créer des annonces

Pour appeler un outil, utilise ce format EXACT dans ta réponse (sur une ligne isolée) :
TOOL_CALL: {"tool": "nom_outil", "params": {...}}

Outils disponibles :
- list_users → liste tous les utilisateurs
- update_user_role → params: {userId, role} — roles: owner/pdg_adjoint/conseil_admin/admin/directeur/responsable/user
- get_stats → statistiques globales
- list_quotes → params: {status?} — statuts: pending/reviewing/accepted/refused/completed
- update_quote_status → params: {quoteId, status, notes?}
- list_employees → liste les employés
- list_reports → signalements en attente
- send_email → params: {to, subject, body} — "to" accepte une adresse, une liste séparée par virgules ou un tableau. Le corps est automatiquement mis en forme avec le template HTML officiel eza (ne pas écrire de HTML toi-même, juste du texte lisible). IMPORTANT: l'envoi ne fonctionne que vers les utilisateurs enregistrés sur l'app ; si un destinataire n'est pas enregistré, signale-le au PDG.
- create_announcement → params: {title, content, type} — types: info/warning/success/error
- get_app_settings → paramètres de l'app

Règles :
1. Réponds TOUJOURS en français
2. Sois concis et professionnel
3. Avant d'exécuter une action destructive ou sensible, confirme avec l'utilisateur
4. Après chaque outil appelé, résume ce que tu as trouvé ou fait
5. Tu peux chaîner plusieurs appels d'outils si nécessaire
6. Pour modifier un rôle, commence TOUJOURS par list_users pour trouver l'ID correct
7. Tu as tous les droits — utilise-les avec discernement`;

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const level = getUserLevel(user);
    if (level < 100) {
      return Response.json({ error: 'Accès réservé PDG / PDG-Adjoint' }, { status: 403 });
    }

    const body = await req.json();
    const { messages, tool_result } = body;

    // If the frontend is returning a tool result, inject it and continue
    const conversationMessages = messages || [];

    // Build prompt for LLM
    const historyText = conversationMessages
      .map(m => `${m.role === 'user' ? 'PDG' : 'NEXUS'}: ${m.content}`)
      .join('\n\n');

    let fullPrompt = `${SYSTEM_PROMPT}\n\n═══════════════════════════════════\nCONVERSATION:\n${historyText}\n\nNEXUS:`;

    // If a tool result was passed, it means we just executed a tool and need to process the result
    if (tool_result) {
      const resultText = JSON.stringify(tool_result.result, null, 2);
      fullPrompt = `${SYSTEM_PROMPT}\n\n═══════════════════════════════════\nCONVERSATION:\n${historyText}\n\nRésultat de l'outil "${tool_result.tool}":\n\`\`\`json\n${resultText}\n\`\`\`\n\nNEXUS (résume ce résultat et propose la suite):`;
    }

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
    });

    // Parse tool calls from response
    const toolCallMatch = aiResponse.match(/TOOL_CALL:\s*(\{.*\})/);
    
    if (toolCallMatch) {
      let toolCall;
      try {
        toolCall = JSON.parse(toolCallMatch[1]);
      } catch {
        return Response.json({ content: aiResponse, tool_call: null });
      }

      // Execute the tool
      const result = await executeTool(base44, toolCall.tool, toolCall.params || {});

      // Clean the response text (remove the TOOL_CALL line)
      const cleanResponse = aiResponse.replace(/TOOL_CALL:\s*\{.*\}/, '').trim();

      return Response.json({
        content: cleanResponse || `⚙️ Exécution de \`${toolCall.tool}\`...`,
        tool_call: { tool: toolCall.tool, params: toolCall.params },
        tool_result: result,
      });
    }

    return Response.json({ content: aiResponse, tool_call: null });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});