import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_URL') || 'https://brenneaerial.base44.app';

// Services à surveiller avec leurs checks
const SERVICES = [
  {
    name: 'aria_llm',
    label: 'IA ARIA (Chatbot)',
    type: 'llm_invoke',
    prompt: 'Réponds juste "OK" en un mot.',
    timeout: 15000,
  },
  {
    name: 'nexus_agent',
    label: 'Agent Nexus (PDG AI)',
    type: 'function_check',
    function: 'pdgAIAgent',
    payload: { action: 'ping' },
    timeout: 10000,
  },
  {
    name: 'quote_pdf',
    label: 'Génération PDF Devis',
    type: 'function_reachable',
    function: 'generateQuotePDF',
    timeout: 5000,
  },
  {
    name: 'email_service',
    label: 'Service Email (Notifications)',
    type: 'function_reachable',
    function: 'emailNotification',
    timeout: 5000,
  },
  {
    name: 'planning_scheduler',
    label: 'Planificateur IA (Scheduler Chat)',
    type: 'llm_invoke',
    prompt: 'Réponds juste "PONG".',
    timeout: 15000,
  },
  {
    name: 'stripe_webhook',
    label: 'Webhook Stripe (Paiements)',
    type: 'function_reachable',
    function: 'handleStripeWebhook',
    timeout: 5000,
  },
  {
    name: 'database_quotes',
    label: 'Base de données - Devis',
    type: 'entity_check',
    entity: 'Quote',
    timeout: 5000,
  },
  {
    name: 'database_notifications',
    label: 'Base de données - Notifications',
    type: 'entity_check',
    entity: 'Notification',
    timeout: 5000,
  },
  {
    name: 'database_appointments',
    label: 'Base de données - Rendez-vous',
    type: 'entity_check',
    entity: 'Appointment',
    timeout: 5000,
  },
  {
    name: 'push_notifications',
    label: 'Notifications Push',
    type: 'function_reachable',
    function: 'pushNotification',
    timeout: 5000,
  },
];

async function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]);
}

async function checkService(service, base44) {
  const start = Date.now();
  const checked_at = new Date().toISOString();

  try {
    if (service.type === 'llm_invoke') {
      await withTimeout(
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: service.prompt,
          model: 'gpt_5_mini',
        }),
        service.timeout
      );

    } else if (service.type === 'entity_check') {
      await withTimeout(
        base44.asServiceRole.entities[service.entity].list('-created_date', 1),
        service.timeout
      );

    } else if (service.type === 'function_reachable' || service.type === 'function_check') {
      // On vérifie juste que la fonction répond (même avec une erreur de payload, c'est OK)
      try {
        await withTimeout(
          base44.asServiceRole.functions.invoke(service.function, service.payload || { _ping: true }),
          service.timeout
        );
      } catch (e) {
        // 400/422 = fonction accessible mais payload invalide = OK
        // 500+ = vrai problème
        const msg = e.message || '';
        if (msg.includes('500') || msg.includes('503') || msg.includes('timeout') || msg.toLowerCase().includes('timeout')) {
          throw e;
        }
        // Sinon, fonction joignable
      }
    }

    const responseTime = Date.now() - start;
    const status = responseTime > 8000 ? 'degraded' : 'ok';

    return {
      service_name: service.name,
      service_label: service.label,
      status,
      response_time_ms: responseTime,
      checked_at,
      is_incident: false,
    };

  } catch (err) {
    const responseTime = Date.now() - start;
    const isTimeout = err.message?.toLowerCase().includes('timeout');

    return {
      service_name: service.name,
      service_label: service.label,
      status: isTimeout ? 'timeout' : 'error',
      response_time_ms: responseTime,
      error_message: err.message,
      checked_at,
      is_incident: true,
    };
  }
}

async function getAIDiagnosis(base44, results) {
  const incidents = results.filter(r => r.is_incident || r.status === 'degraded');
  if (!incidents.length) return null;

  const summary = incidents.map(r =>
    `- ${r.service_label}: ${r.status} (${r.response_time_ms}ms)${r.error_message ? ' — Erreur: ' + r.error_message : ''}`
  ).join('\n');

  const diagnosis = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Tu es un expert DevOps/SRE pour une plateforme drone (Brenne Aerial). Voici les services en anomalie détectés lors d'un check automatique:

${summary}

Pour chaque service, donne:
1. La cause la plus probable (en 1-2 phrases concises)
2. La solution recommandée (actions concrètes)
3. La sévérité: CRITIQUE / IMPORTANTE / MINEURE

Réponds en français, de manière structurée et actionnable. Sois précis et technique.`,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        global_assessment: { type: 'string' },
        incidents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              cause: { type: 'string' },
              solution: { type: 'string' },
              severity: { type: 'string' },
            }
          }
        }
      }
    }
  });

  return diagnosis;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: admin ou appel interne automation (pas d'utilisateur)
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const isManual = body.manual === true;

    // Run checks with controlled parallelism to avoid rate limits
    console.log('[Monitoring] Starting checks for', SERVICES.length, 'services...');
    const results = [];
    for (let i = 0; i < SERVICES.length; i += 2) {
      const batch = SERVICES.slice(i, i + 2);
      const batchResults = await Promise.all(batch.map(s => checkService(s, base44)));
      results.push(...batchResults);
      if (i + 2 < SERVICES.length) await new Promise(r => setTimeout(r, 500)); // 500ms delay between batches
    }

    const incidents = results.filter(r => r.is_incident || r.status === 'degraded');
    const okCount = results.filter(r => r.status === 'ok').length;
    const hasNewIncidents = incidents.length > 0;

    // Get AI diagnosis if there are incidents
    let aiDiagnosis = null;
    if (hasNewIncidents) {
      console.log('[Monitoring] Getting AI diagnosis for', incidents.length, 'incidents...');
      aiDiagnosis = await getAIDiagnosis(base44, results).catch(e => {
        console.error('[Monitoring] AI diagnosis failed:', e.message);
        return null;
      });
    }

    // Save logs to DB
    const logsToSave = results.map(r => ({
      ...r,
      ai_diagnosis: r.is_incident && aiDiagnosis
        ? (() => {
            const inc = aiDiagnosis.incidents?.find(i =>
              i.service?.toLowerCase().includes(r.service_name.toLowerCase()) ||
              r.service_label?.toLowerCase().includes((i.service || '').toLowerCase())
            );
            return inc ? `[${inc.severity}] Cause: ${inc.cause} | Solution: ${inc.solution}` : aiDiagnosis.global_assessment;
          })()
        : null,
    }));

    await Promise.all(logsToSave.map(log =>
      base44.asServiceRole.entities.MonitoringLog.create(log)
    ));

    // Notify admins if incidents found (not for manual checks)
    if (hasNewIncidents && !isManual) {
      // Check if we already notified for these services in the last 30 min to avoid spam
      const recentLogs = await base44.asServiceRole.entities.MonitoringLog.filter({
        is_incident: true,
        incident_resolved: false,
      }, '-created_date', 50);

      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const recentIncidentServices = new Set(
        recentLogs
          .filter(l => l.checked_at > thirtyMinsAgo && l.service_name !== incidents[0]?.service_name)
          .map(l => l.service_name)
      );

      const newIncidents = incidents.filter(i => !recentIncidentServices.has(i.service_name));

      if (newIncidents.length > 0) {
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        const incidentSummary = newIncidents.map(i =>
          `• ${i.service_label}: ${i.status === 'timeout' ? 'Timeout' : 'Erreur'} (${i.response_time_ms}ms)`
        ).join('\n');

        const diagText = aiDiagnosis?.global_assessment || 'Diagnostic en cours...';

        for (const admin of admins) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: admin.email,
            title: `🚨 Monitoring: ${newIncidents.length} service(s) en anomalie`,
            content: `${incidentSummary}\n\n🤖 IA: ${diagText}`,
            type: 'system',
            link: '/admin/monitoring',
          });
        }
      }
    }

    return Response.json({
      success: true,
      checked_at: new Date().toISOString(),
      total: results.length,
      ok: okCount,
      incidents: incidents.length,
      results,
      ai_diagnosis: aiDiagnosis,
    });

  } catch (err) {
    console.error('[Monitoring] Fatal error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});