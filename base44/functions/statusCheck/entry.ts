import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map of module names to their paths on the main site
const MODULE_PATHS = {
  'messagerie':    '/messages',
  'portfolio':     '/portfolio',
  'blog':          '/blog',
  'certification': '/certification-success',
  'donation':      '/donation',
  'planning':      '/planning',
  'quote':         '/quote',
  'discover':      '/discover',
  'homepage':      '/',
  'espace_client': '/espace-client',
  'partenaires':   '/partenaires',
  'parrainage':    '/parrainage',
  'avant_apres':   '/avant-apres',
  'services':      '/services',
  'contact':       '/contact',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Extract module name from query param
    const url = new URL(req.url);
    const moduleName = url.searchParams.get('module');

    if (!moduleName) {
      // Return all modules status summary (for BetterStack dashboard info)
      const modules = await base44.asServiceRole.entities.AppModuleStatus.list();
      const summary = modules.map(m => ({
        module: m.module_name,
        status: m.status,
        is_active: m.is_active,
        operational: m.is_active && m.status === 'operational',
      }));
      return Response.json({ ok: true, modules: summary });
    }

    // Check specific module status
    const modules = await base44.asServiceRole.entities.AppModuleStatus.list();
    const mod = modules.find(m => m.module_name === moduleName);

    // If module not found in DB → consider it operational
    if (!mod) {
      return Response.json(
        { ok: true, module: moduleName, status: 'operational', message: 'Service opérationnel' },
        { status: 200 }
      );
    }

    // If module is disabled / in maintenance / offline → return 503
    if (!mod.is_active || mod.status === 'offline' || mod.status === 'maintenance') {
      const statusMessages = {
        offline: 'Service hors ligne',
        maintenance: 'Service en maintenance',
      };
      return Response.json(
        {
          ok: false,
          module: moduleName,
          status: mod.status,
          message: mod.message || statusMessages[mod.status] || 'Service indisponible',
        },
        { status: 503 }
      );
    }

    // degraded → return 200 but with degraded flag (BetterStack still sees it as "up")
    if (mod.status === 'degraded') {
      return Response.json(
        { ok: true, module: moduleName, status: 'degraded', message: mod.message || 'Performances dégradées' },
        { status: 200 }
      );
    }

    // operational
    return Response.json(
      { ok: true, module: moduleName, status: 'operational', message: 'Service opérationnel' },
      { status: 200 }
    );

  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});