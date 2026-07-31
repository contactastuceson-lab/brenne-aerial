import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ── API légère pour l'IA — gestion du tableau de tâches Kanban ─────────────
// action: 'list'   → payload { status? } → renvoie les tâches (filtrées par statut optionnel)
// action: 'update' → payload { id, status?, result? } → met à jour le statut et/ou le champ result
//
// Toutes les opérations sont réservées aux administrateurs authentifiés.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = String(body?.action || '').trim();

    if (action === 'list') {
      const status = body?.status ? String(body.status) : undefined;
      const valid = ['todo', 'in_progress', 'review', 'done'];
      const filter = status && valid.includes(status) ? { status } : {};
      const tasks = await base44.asServiceRole.entities.Task.filter(filter, '-created_date', 300);
      return Response.json({ success: true, count: tasks?.length || 0, tasks: tasks || [] });
    }

    if (action === 'update') {
      const id = String(body?.id || '').trim();
      if (!id) return Response.json({ error: 'id requis' }, { status: 400 });
      const patch: any = {};
      if (typeof body?.status === 'string' && ['todo', 'in_progress', 'review', 'done'].includes(body.status)) {
        patch.status = body.status;
      }
      if (typeof body?.result === 'string') {
        patch.result = body.result;
      }
      if (Object.keys(patch).length === 0) {
        return Response.json({ error: 'Aucun champ à mettre à jour (status ou result requis)' }, { status: 400 });
      }
      const updated = await base44.asServiceRole.entities.Task.update(id, patch);
      return Response.json({ success: true, task: updated });
    }

    return Response.json({ error: 'action inconnue (attendu: list | update)' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}