import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const message = payload.data;
    if (!message) {
      return Response.json({ error: 'No message data' }, { status: 400 });
    }

    const senderName = message.sender_name || message.sender_email || 'Quelqu\'un';
    const content = message.content || '';
    const preview = content.length > 100 ? content.slice(0, 97) + '...' : content;

    const pushRes = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: Deno.env.get('PUSHOVER_APP_TOKEN'),
        user: Deno.env.get('PUSHOVER_USER_KEY'),
        title: `💬 Nouveau message de ${senderName}`,
        message: preview || '(message vide)',
        sound: 'pushover',
        priority: 0,
      }),
    });

    const result = await pushRes.json();

    if (result.status !== 1) {
      return Response.json({ error: 'Pushover error', details: result }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});