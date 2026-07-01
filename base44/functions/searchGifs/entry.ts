import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    const key = Deno.env.get('GIPHY_API_KEY');

    const endpoint = query
      ? `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=30&rating=g&lang=fr`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${key}&limit=30&rating=g`;

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Giphy error: ${res.status}`);
    const json = await res.json();

    return Response.json({ data: json.data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});