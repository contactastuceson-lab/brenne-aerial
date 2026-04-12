import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { reason } = await req.json();

  // Check if there's already a pending request
  const existing = await base44.entities.DeletionRequest.filter({ user_email: user.email, status: 'pending' });
  if (existing.length > 0) {
    return Response.json({ error: 'Une demande est déjà en cours' }, { status: 400 });
  }

  // Create the deletion request
  await base44.entities.DeletionRequest.create({
    user_id: user.id,
    user_email: user.email,
    user_name: user.full_name || user.email,
    reason: reason || '',
    status: 'pending',
  });

  // Send confirmation email to the user
  await base44.integrations.Core.SendEmail({
    to: user.email,
    subject: '⚠️ Demande de suppression de compte reçue',
    body: `Bonjour ${user.full_name || ''},\n\nNous avons bien reçu votre demande de suppression de compte Brenne Aerial.\n\nVotre demande est en cours de traitement. Un administrateur l'examinera et procédera à la suppression définitive de votre compte dans les meilleurs délais.\n\nSi vous avez fait cette demande par erreur, veuillez contacter notre support rapidement à contact@brenneaerial.fr\n\nCordialement,\nL'équipe Brenne Aerial`,
  });

  // Notify admin
  const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
  for (const admin of admins) {
    if (admin.email) {
      await base44.integrations.Core.SendEmail({
        to: admin.email,
        subject: `🗑️ Demande de suppression — ${user.full_name || user.email}`,
        body: `Nouvelle demande de suppression de compte.\n\nUtilisateur : ${user.full_name || ''}\nEmail : ${user.email}\nRaison : ${reason || 'Non précisée'}\n\nRendez-vous dans l'administration pour traiter cette demande.`,
      });
    }
  }

  return Response.json({ success: true });
});