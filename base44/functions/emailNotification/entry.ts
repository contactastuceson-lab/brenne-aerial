import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const APP_URL = 'https://brenneaerial.fr';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const message = payload.data;
    if (!message || message.is_request) return Response.json({ skipped: true });

    const senderName = message.sender_name || 'Quelqu\'un';
    const recipientEmail = message.recipient_email;
    const preview = (message.content || '').slice(0, 300);

    if (!recipientEmail) return Response.json({ error: 'No recipient' }, { status: 400 });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `💬 Nouveau message de ${senderName}`,
      body: `<div style="font-family: sans-serif; max-width: 520px; margin: auto; background: #0a1628; color: #e8edf5; padding: 32px; border-radius: 12px;">
  <h2 style="color: #38aadc; margin-top: 0;">Nouveau message</h2>
  <p style="color: #a0aec0;">De la part de <strong style="color: #e8edf5;">${senderName}</strong></p>
  <div style="background: #0f1f3d; border: 1px solid #1e3a5f; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; line-height: 1.6;">${preview}</p>
  </div>
  <a href="${APP_URL}/messages" style="display: inline-block; background: #38aadc; color: #0a1628; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
    Répondre
  </a>
</div>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});