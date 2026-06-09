import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const vapidKeys = webpush.generateVAPIDKeys();

    return Response.json({
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
      instructions: "Copiez ces clés et ajoutez-les dans les secrets de l'app : VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});