import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { logAutomation } from '../../shared/logAutomation.ts';
import { executeNexusAction, CONFIRMABLE_ACTIONS } from '../../shared/nexusActions.ts';

// Exécute une action Nexus confirmée par l'utilisateur (ou admin) sur un ticket.
// Réservé aux actions confirmables (crédits, remboursement, annulation event, move, unfreeze).
// Les actions auto (recalc, create wallet, close/reopen) sont exécutées côté replySupportTicket.

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { ticketId, action } = body || {};
    if (!ticketId || !action?.type) return Response.json({ error: 'ticketId + action requis' }, { status: 400 });
    if (!CONFIRMABLE_ACTIONS.includes(action.type)) return Response.json({ error: 'Action non confirmable' }, { status: 400 });

    const ticket = await base44.entities.SupportTicket.get(ticketId).catch(() => null);
    if (!ticket) return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    if (ticket.user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Ticket introuvable' }, { status: 404 });
    }

    const result = await executeNexusAction(base44, action, ticket, user);
    const pending_action = {
      ...action, status: result.ok ? 'executed' : 'failed',
      result, executed_at: new Date().toISOString(),
    };
    const updated = await base44.entities.SupportTicket.update(ticketId, {
      pending_action,
      last_action_log: `${result.ok ? '✅' : '❌'} ${result.label || action.type} — ${new Date().toISOString()}`,
    }).catch(() => null);

    await logAutomation(base44, {
      automation_name: 'nexus_ticket_action', label: `Action Nexus — ${action.type}`, category: 'system',
      status: result.ok ? 'success' : 'error',
      summary: `Ticket #${String(ticketId).slice(-6)} — ${result.label || action.type} ${result.ok ? 'exécuté' : 'échec'}`,
      details: result.error || JSON.stringify(result.result || {}), count: 1,
    }).catch(() => {});

    if (!result.ok) return Response.json({ ok: false, error: result.error, label: result.label }, { status: 400 });
    return Response.json({ ok: true, ticket: updated || { ...ticket, pending_action } });
  } catch (error) {
    if (base44) await logAutomation(base44, {
      automation_name: 'nexus_ticket_action', label: 'Action Nexus', category: 'system',
      status: 'error', summary: 'Échec', details: String(error?.message || error),
    }).catch(() => {});
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}