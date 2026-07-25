import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Automation déclenchée à la création d'un ChatMessage.
// Envoie une notification push + crée une Notification in-app au destinataire,
// pour les nouveaux messages ET les demandes de contact.
// (L'email reste géré séparément par `emailNotification`.)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const message = payload.data;
    if (!message) return Response.json({ skipped: true });

    const recipientEmail = message.recipient_email;
    const senderEmail = message.sender_email || '';
    const senderName = message.sender_name || 'Quelqu\'un';
    const preview = (message.content || '').slice(0, 100);
    const isContactRequest = message.is_request === true && message.request_status === 'pending';

    if (!recipientEmail) return Response.json({ error: 'No recipient email' }, { status: 400 });

    // Ne pas notifier soi-même
    if (senderEmail && recipientEmail && senderEmail === recipientEmail) {
      return Response.json({ skipped: 'self' });
    }

    // Respecter les préférences de notification du destinataire
    let recipientUser = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email: recipientEmail });
      recipientUser = users?.[0] || null;
    } catch (_) {}

    const prefs = recipientUser?.notification_prefs || {};
    const isOfficial = message.is_official === true;
    if (!isOfficial && prefs.new_messages === false) {
      return Response.json({ skipped: 'new_messages_disabled' });
    }

    let title, body;
    if (isContactRequest) {
      title = `📨 ${senderName} souhaite vous contacter`;
      body = preview || 'Nouvelle demande de contact';
    } else {
      title = `💬 ${senderName} vous a écrit`;
      body = preview || 'Nouveau message';
    }

    // 1) Notification in-app (cloche)
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: recipientEmail,
        type: isContactRequest ? 'contact_request' : 'new_message',
        title,
        content: preview,
        link: '/messages',
        sender_name: message.sender_name || null,
        sender_email: message.sender_email || null,
      });
    } catch (_) {}

    // 2) Notification push (Web Push / VAPID)
    try {
      await base44.asServiceRole.functions.invoke('sendWebPush', {
        user_email: recipientEmail,
        title,
        body,
        url: '/messages',
        tag: message.conversation_id || undefined,
      });
    } catch (_) {}

    return Response.json({ success: true, contactRequest: isContactRequest });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});