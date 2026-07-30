import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event } = body;

    // Do not trust the request body: re-fetch the actual Quote from the DB and
    // only act if it is genuinely accepted with a desired date. This prevents
    // anonymous callers from blocking arbitrary calendar dates via forged
    // payloads — only a real accepted quote can trigger a block, using its
    // own date_souhaitee.
    const quoteId = event?.entity_id || null;
    if (!quoteId) {
      return Response.json({ skipped: true });
    }

    const quote = await base44.asServiceRole.entities.Quote.get(quoteId).catch(() => null);
    if (!quote || quote.status !== 'accepted' || !quote.date_souhaitee) {
      return Response.json({ skipped: true });
    }

    const date = quote.date_souhaitee;

    // Check if a BlockedDay already exists for this date
    const existing = await base44.asServiceRole.entities.BlockedDay.filter({ date });

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.BlockedDay.update(existing[0].id, {
        status: 'blocked',
        reason: `Devis accepté${quote.client_name ? ' - ' + quote.client_name : ''}`,
        blocked_by_quote_id: quoteId,
      });
    } else {
      await base44.asServiceRole.entities.BlockedDay.create({
        date,
        status: 'blocked',
        reason: `Devis accepté${quote.client_name ? ' - ' + quote.client_name : ''}`,
        blocked_by_quote_id: quoteId,
      });
    }

    return Response.json({ success: true, date });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});