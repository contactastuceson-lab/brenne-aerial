import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const address = (user.eza_mail || '').toString().toLowerCase().trim();
    if (!address) {
      return Response.json({ error: 'Aucune boîte EZA Mail associée à ce compte', needs_provisioning: true }, { status: 400 });
    }

    const url = secrets.get('EZA_MAIL_EMAILS_URL');
    const mailKey = secrets.get('EZA_MAIL_API_KEY');
    if (!url) return Response.json({ error: 'EZA_MAIL_EMAILS_URL non configuré' }, { status: 500 });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(mailKey ? { 'x-api-key': mailKey } : {}) },
      body: JSON.stringify({ address }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return Response.json({ error: `EZA Mail read failed (${res.status})`, detail }, { status: 502 });
    }

    const data = await res.json().catch(() => ({}));
    const raw = Array.isArray(data?.emails) ? data.emails : (Array.isArray(data) ? data : []);

    const emails = raw.map((m) => ({
      id: String(m.id || m.uid || m.message_id || ''),
      from: m.from || m.sender || m.from_address || '',
      from_name: m.from_name || m.sender_name || '',
      subject: m.subject || '(sans objet)',
      date: m.date || m.received_at || m.created_date || '',
      snippet: (m.snippet || m.preview || (m.body || '')).toString().slice(0, 240),
      read: m.read ?? m.is_read ?? false,
    }));

    return Response.json({ emails, address });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}