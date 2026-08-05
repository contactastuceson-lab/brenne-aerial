import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Map: module name → AppSettings key — plateforme eza
const MODULE_TO_SETTING = {
  'homepage':      'page_homepage_enabled',
  'blog':          'page_blog_enabled',
  'portfolio':     'page_portfolio_enabled',
  'discover':      'page_discover_enabled',
  'messagerie':    'page_messages_enabled',
  'spaces':        'page_spaces_enabled',
  'forum':         'page_forum_enabled',
  'communities':   'page_communities_enabled',
  'events':        'page_events_enabled',
  'boutique':      'page_boutique_enabled',
  'banque':        'page_banque_enabled',
  'bookmarks':     'page_bookmarks_enabled',
  'lists':         'page_lists_enabled',
  'search':        'page_search_enabled',
  'notifications': 'page_notifications_enabled',
  'support':       'page_support_enabled',
  'business':      'page_business_enabled',
  'espace':        'page_espace_enabled',
  'parrainage':    'page_parrainage_enabled',
  'certification': 'page_certification_enabled',
  'donation':      'page_donation_enabled',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const moduleName = url.searchParams.get('module');

    const settings = await base44.asServiceRole.entities.AppSettings.list();
    const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    // If site_offline is active → everything returns 503
    const isSiteOffline = sMap['site_offline'] === 'true';
    if (isSiteOffline) {
      const module = moduleName || 'all';
      return Response.json(
        { ok: false, module, status: 'offline', message: 'Site eza hors ligne' },
        { status: 503 }
      );
    }

    // Special: monitor the whole site via maintenance_mode setting
    if (moduleName === 'site') {
      const isInMaintenance = sMap['maintenance_mode'] === 'true';
      if (isInMaintenance) {
        return Response.json(
          { ok: false, module: 'site', status: 'maintenance', message: 'Site eza en maintenance' },
          { status: 503 }
        );
      }
      return Response.json(
        { ok: true, module: 'site', status: 'operational', message: 'Site eza opérationnel' },
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