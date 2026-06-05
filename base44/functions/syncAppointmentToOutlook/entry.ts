import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  autre: 'Autre prestation',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    // Supporte appel direct (appointment_id) ET déclenchement via automation entity
    const appointment_id = body.appointment_id || body.event?.entity_id;
    if (!appointment_id) return Response.json({ error: 'Missing appointment_id' }, { status: 400 });

    const appt = body.data || await base44.asServiceRole.entities.Appointment.get(appointment_id);
    if (!appt) return Response.json({ error: 'Appointment not found' }, { status: 404 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('outlook');

    // Build start/end ISO datetimes
    const startDateTime = `${appt.date}T${appt.time_start || '09:00'}:00`;
    const endDateTime = `${appt.date}T${appt.time_end || appt.time_start || '10:00'}:00`;
    const serviceLabel = SERVICE_LABELS[appt.service_type] || appt.service_type || 'Prestation drone';

    const eventBody = {
      subject: `🚁 ${serviceLabel}${appt.client_name ? ` — ${appt.client_name}` : ''}`,
      body: {
        contentType: 'HTML',
        content: `
          <p><strong>Client :</strong> ${appt.client_name || 'N/A'}</p>
          <p><strong>Email :</strong> ${appt.client_email || 'N/A'}</p>
          <p><strong>Prestation :</strong> ${serviceLabel}</p>
          ${appt.location ? `<p><strong>Lieu :</strong> ${appt.location}</p>` : ''}
          ${appt.notes ? `<p><strong>Notes :</strong> ${appt.notes}</p>` : ''}
          <p><em>Synchronisé depuis Brenne Aerial</em></p>
        `,
      },
      start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
      end: { dateTime: endDateTime, timeZone: 'Europe/Paris' },
      location: appt.location ? { displayName: appt.location } : undefined,
    };

    const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Graph API error: ${res.status}`, details: err }, { status: 500 });
    }

    const event = await res.json();

    // Save the Outlook event ID on the appointment for future reference
    await base44.asServiceRole.entities.Appointment.update(appointment_id, {
      google_event_id: event.id, // reusing this field to store the Outlook event ID
    });

    return Response.json({ success: true, event_id: event.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});