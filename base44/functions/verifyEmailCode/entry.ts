import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const { code } = await req.json();

    if (!user.verification_code || !user.verification_code_expires) {
      return Response.json({ error: 'Aucun code envoyé' }, { status: 400 });
    }

    const expiresAt = Number(user.verification_code_expires) || 0;
    if (Date.now() > expiresAt) {
      return Response.json({ error: 'Code expiré' }, { status: 400 });
    }

    if (String(user.verification_code).trim() !== String(code).trim()) {
      return Response.json({ error: 'Code incorrect' }, { status: 400 });
    }

    // Marque l'email comme vérifié, nettoie le code
    await base44.auth.updateMe({
      email_verified: true,
      verification_code: null,
      verification_code_expires: null,
    });

    return Response.json({ success: true, verified: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});