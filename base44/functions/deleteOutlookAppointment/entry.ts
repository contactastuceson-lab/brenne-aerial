import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { appointment_id } = await req.json();
    if (!appointment_id) return Response.json({ error: 'Missing appointment_id' }, { status: 400 });

    const appt = await base44.asServiceRole.entities.Appointment.get(appointment_id);
    if (!appt) return Response.json({ error: 'Appointment not found' }, { status: 404 });

    const outlookEventId = appt.google_event_id;
    if (!outlookEventId) {
      return Response.json({ success: true, message: 'No Outlook event linked, nothing to delete.' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('outlook');

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(outlookEventId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!res.ok && res.status !== 404) {
      const err = await res.text();
      return Response.json({ error: `Graph API error: ${res.status}`, details: err }, { status: 500 });
    }

    // Clear the stored event ID
    await base44.asServiceRole.entities.Appointment.update(appointment_id, { google_event_id: null });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});