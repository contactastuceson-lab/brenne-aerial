import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map: module name → AppSettings key
const MODULE_TO_SETTING = {
  'homepage':      'page_homepage_enabled',
  'services':      'page_services_enabled',
  'portfolio':     'page_portfolio_enabled',
  'blog':          'page_blog_enabled',
  'contact':       'page_contact_enabled',
  'quote':         'page_quote_enabled',
  'planning':      'page_planning_enabled',
  'discover':      'page_discover_enabled',
  'messagerie':    'page_messages_enabled',
  'espace_client': 'page_espace_client_enabled',
  'partenaires':   'page_partenaires_enabled',
  'parrainage':    'page_parrainage_enabled',
  'avant_apres':   'page_avant_apres_enabled',
  'certification': 'page_certification_enabled',
  'donation':      'page_donation_enabled',
  'garage':        'page_garage_enabled',
  'calculateur':   'page_calculator_enabled',
  'reglementation':'page_reglementation_enabled',
  'simulateur':    'page_simulateur_enabled',
  'comparateur':   'page_comparateur_enabled',
  'flash':         'page_flash_enabled',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const moduleName = url.searchParams.get('module');

    const settings = await base44.asServiceRole.entities.AppSettings.list();
    const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    // Special: monitor the whole site via maintenance_mode setting
    if (moduleName === 'site') {
      const isInMaintenance = sMap['maintenance_mode'] === 'true';
      if (isInMaintenance) {
        return Response.json(
          { ok: false, module: 'site', status: 'maintenance', message: 'Site Brenne Aerial en maintenance' },
          { status: 503 }
        );
      }
      return Response.json(
        { ok: true, module: 'site', status: 'operational', message: 'Site Brenne Aerial opérationnel' },
        { status: 200 }
      );
    }

    // No module specified → return summary of all
    if (!moduleName) {
      const summary = Object.entries(MODULE_TO_SETTING).map(([mod, key]) => ({
        module: mod,
        enabled: sMap[key] !== 'false',
      }));
      return Response.json({ ok: true, modules: summary });
    }

    // Check specific module
    const settingKey = MODULE_TO_SETTING[moduleName];
    if (!settingKey) {
      return Response.json({ ok: false, error: `Module inconnu: ${moduleName}` }, { status: 404 });
    }

    // Default is enabled unless explicitly set to 'false'
    const isEnabled = sMap[settingKey] !== 'false';

    if (!isEnabled) {
      return Response.json(
        { ok: false, module: moduleName, status: 'disabled', message: 'Module désactivé' },
        { status: 503 }
      );
    }

    return Response.json(
      { ok: true, module: moduleName, status: 'operational', message: 'Module opérationnel' },
      { status: 200 }
    );

  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});