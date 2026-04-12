import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, userEmail } = await req.json();
  if (!userId) return Response.json({ error: 'userId requis' }, { status: 400 });

  // Delete the user
  await base44.asServiceRole.entities.User.delete(userId);

  // Mark deletion request as processed if any
  if (userEmail) {
    const requests = await base44.asServiceRole.entities.DeletionRequest.filter({ user_email: userEmail, status: 'pending' });
    for (const r of requests) {
      await base44.asServiceRole.entities.DeletionRequest.update(r.id, { status: 'processed' });
    }

    // Notify the user by email
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: '✅ Votre compte a été supprimé',
      body: `Bonjour,\n\nVotre compte Brenne Aerial a bien été supprimé suite à votre demande.\n\nToutes vos données ont été effacées de notre plateforme.\n\nCordialement,\nL'équipe Brenne Aerial`,
    });
  }

  return Response.json({ success: true });
});