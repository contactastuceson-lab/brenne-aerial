import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { REWARD_ACTIONS, getActionConfig } from '../../shared/rewardActions.ts';

// Crédite automatiquement un utilisateur pour une action accomplie.
// Body : { action: string, metadata?: object }
// Vérifie la cap quotidienne via RewardLog, crée une entrée, met à jour le solde.
// Idempotent : ne crédite pas si la cap du jour est atteinte.
export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body: any = {};
    try { body = await req.json(); } catch {}

    const action: string = body?.action;
    if (!action) return Response.json({ error: 'Action manquante' }, { status: 400 });

    const config = getActionConfig(action);
    if (!config) return Response.json({ error: 'Action invalide' }, { status: 400 });

    // Vérifier la cap quotidienne — récupère les logs récents de l'utilisateur pour cette action
    const recentLogs = await base44.asServiceRole.entities.RewardLog.filter(
      { user_email: user.email, action },
      '-created_date',
      config.dailyCap + 1
    ).catch(() => []);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = (recentLogs || []).filter(
      (l: any) => new Date(l.created_date) >= todayStart
    ).length;

    if (todayCount >= config.dailyCap) {
      return Response.json({
        success: true,
        awarded: 0,
        capped: true,
        action,
        label: config.label,
        message: 'Cap quotidienne atteinte pour cette action',
      });
    }

    // Créer l'entrée RewardLog
    await base44.asServiceRole.entities.RewardLog.create({
      user_email: user.email,
      user_id: user.id,
      action,
      action_label: config.label,
      credits: config.credits,
      metadata: body?.metadata || {},
    });

    // Mettre à jour le solde de crédits de l'utilisateur
    const newBalance = (user.referral_credits || 0) + config.credits;
    await base44.asServiceRole.entities.User.update(user.id, {
      referral_credits: newBalance,
    });

    return Response.json({
      success: true,
      awarded: config.credits,
      total: newBalance,
      action,
      label: config.label,
      capped: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}