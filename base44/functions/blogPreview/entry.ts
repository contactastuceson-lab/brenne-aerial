import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_OG_IMAGE = '/og-image.svg';
const DEFAULT_DESCRIPTION = 'Brenne Aerial propose des services drone premium pour les événements, inspections et chantiers.';

function normalizeText(value = '', maxLength = 160) {
  const normalized = String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
    .replace(/[*_~`>#]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function toAbsoluteUrl(path = '', origin = '') {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (!origin) return path;
  return `${origin.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml({ title, description, image, pageUrl }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
  <meta name="robots" content="index,follow" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:site_name" content="Brenne Aerial" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}" />
</head>
<body>
  <p>Redirection vers l’article... <a href="${escapeHtml(pageUrl)}">Cliquez ici si vous n’êtes pas redirigé.</a></p>
  <script>window.location.replace(${JSON.stringify(pageUrl)});</script>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const pathname = url.pathname;
    const pathParts = pathname.replace(/\/+$|^\//g, '').split('/');
    const potentialId = pathParts[pathParts.length - 1];
    const id = url.searchParams.get('id') || url.searchParams.get('articleId') || (potentialId !== 'blogPreview' ? potentialId : null);

    if (!id) {
      const html = buildHtml({
        title: 'Article introuvable | Brenne Aerial',
        description: 'Aucun identifiant d’article n’a été fourni pour l’aperçu.',
        image: '',
        pageUrl: url.origin,
      });
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 400 });
    }

    let post = null;

    try {
      post = await base44.asServiceRole.entities.BlogPost.get(id);
    } catch {
      const posts = await base44.asServiceRole.entities.BlogPost.filter({ id });
      post = Array.isArray(posts) ? posts[0] : null;
    }

    if (!post) {
      const html = buildHtml({
        title: 'Article introuvable | Brenne Aerial',
        description: 'Aucun article correspondant n’a été trouvé.',
        image: '',
        pageUrl: url.origin,
      });
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 404 });
    }

    const appUrl = Deno.env.get('APP_URL') || `${url.protocol}//${url.host}`;
    const pageUrl = `${appUrl.replace(/\/$/, '')}/blog/${encodeURIComponent(id)}`;
    const title = post.title ? `${post.title} | Brenne Aerial` : 'Brenne Aerial';
    const description = normalizeText(post.excerpt || post.content || '', 160) || 'Brenne Aerial propose des services drone premium pour les événements, inspections et chantiers.';
    const image = toAbsoluteUrl(post.cover_url || '/og-image.jpg', appUrl);

    const html = buildHtml({ title, description, image, pageUrl });
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    const html = buildHtml({
      title: 'Erreur serveur | Brenne Aerial',
      description: 'Impossible de générer l’aperçu de l’article pour le moment.',
      image: '',
      pageUrl: 'https://brenneaerial.fr',
    });
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 500 });
  }
});
