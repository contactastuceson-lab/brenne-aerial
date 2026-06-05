import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, event } = body;

    // Triggered by entity automation on Quote update → status = accepted
    if (!data || data.status !== 'accepted' || !data.date_souhaitee) {
      return Response.json({ skipped: true });
    }

    const date = data.date_souhaitee;
    const quoteId = event?.entity_id || null;

    // Check if a BlockedDay already exists for this date
    const existing = await base44.asServiceRole.entities.BlockedDay.filter({ date });

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.BlockedDay.update(existing[0].id, {
        status: 'blocked',
        reason: `Devis accepté${data.client_name ? ' - ' + data.client_name : ''}`,
        blocked_by_quote_id: quoteId,
      });
    } else {
      await base44.asServiceRole.entities.BlockedDay.create({
        date,
        status: 'blocked',
        reason: `Devis accepté${data.client_name ? ' - ' + data.client_name : ''}`,
        blocked_by_quote_id: quoteId,
      });
    }

    return Response.json({ success: true, date });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});