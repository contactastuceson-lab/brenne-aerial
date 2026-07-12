import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { OAuth2Client } from 'npm:google-auth-library@9.15.1';

Deno.serve(async (req) => {
  try {
    const { action, credential } = await req.json();
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');

    if (!clientId) {
      return Response.json({ error: 'Configuration Google incomplète' }, { status: 400 });
    }

    if (action === 'config') {
      return Response.json({ clientId });
    }

    if (!credential) {
      return Response.json({ error: 'Jeton Google manquant' }, { status: 400 });
    }

    const googleClient = new OAuth2Client(clientId);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return Response.json({ error: 'Compte Google non vérifié' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const matchingUsers = await base44.asServiceRole.entities.User.filter({ email: payload.email });

    return Response.json({
      verified: true,
      isExistingUser: matchingUsers.length > 0,
      profile: {
        email: payload.email,
        fullName: payload.name || '',
        givenName: payload.given_name || '',
        familyName: payload.family_name || '',
        picture: payload.picture || '',
      },
    });
  } catch (error) {
    return Response.json({ error: 'Jeton Google invalide' }, { status: 401 });
  }
});