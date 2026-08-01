// Helper partagé : enregistre une entrée dans le journal d'automatisation.
// Utilisé par les fonctions planifiées/event pour tracer leurs actions automatiques
// et les exposer dans l'admin (AdminAutomations). Non bloquant (catch silencieux).

export async function logAutomation(base44, entry) {
  try {
    await base44.asServiceRole.entities.AutomationLog.create({
      automation_name: entry.automation_name,
      label: entry.label,
      category: entry.category || 'system',
      status: entry.status || 'success',
      summary: (entry.summary || '').toString().slice(0, 280),
      details: entry.details ? String(entry.details).slice(0, 2000) : '',
      count: entry.count ?? null,
      run_at: new Date().toISOString(),
    });
  } catch {}
}