import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ezaEmailShell } from '../../shared/ezaEmails.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const recipientRaw = String(body?.recipient || '').trim();
    const amount = Math.floor(Number(body?.amount) || 0);
    const sourceWalletId = String(body?.source_wallet_id || 'primary');
    const note = String(body?.note || '').trim();

    if (!recipientRaw) return Response.json({ error: 'Destinataire requis' }, { status: 400 });
    if (amount <= 0) return Response.json({ error: 'Montant invalide' }, { status: 400 });

    // Règles bancaires (plafonds, frais, limites quotidiennes)
    let bankRules: any = { min_transfer: 0, max_transfer: 0, fee_percent: 0, daily_max_count: 0, daily_max_amount: 0 };
    try {
      const rr = await base44.asServiceRole.entities.AppSettings.filter({ key: 'bank_rules' });
      const rv = (rr || [])[0];
      if (rv?.value) bankRules = { ...bankRules, ...JSON.parse(rv.value) };
    } catch {}
    if (bankRules.min_transfer > 0 && amount < bankRules.min_transfer)
      return Response.json({ error: `Montant minimum : ${bankRules.min_transfer} crédits` }, { status: 400 });
    if (bankRules.max_transfer > 0 && amount > bankRules.max_transfer)
      return Response.json({ error: `Montant maximum : ${bankRules.max_transfer} crédits` }, { status: 400 });
    try {
      if (bankRules.daily_max_count > 0 || bankRules.daily_max_amount > 0) {
        const since = new Date(Date.now() - 86400000).toISOString();
        const recent = await base44.asServiceRole.entities.CreditTransaction.filter({ owner_id: user.id, type: 'transfer_out', created_date: { $gte: since } });
        const rec = recent || [];
        if (bankRules.daily_max_count > 0 && rec.length >= bankRules.daily_max_count)
          return Response.json({ error: `Limite quotidienne atteinte (${bankRules.daily_max_count} virements / 24h)` }, { status: 400 });
        const sum24 = rec.reduce((s: number, t: any) => s + Math.abs(t.amount || 0), 0);
        if (bankRules.daily_max_amount > 0 && sum24 + amount > bankRules.daily_max_amount)
          return Response.json({ error: `Limite quotidienne atteinte (${bankRules.daily_max_amount} crédits / 24h)` }, { status: 400 });
      }
    } catch {}
    const fee = Math.floor(amount * (Number(bankRules.fee_percent) || 0) / 100);
    const netReceived = amount - fee;

    if (user.bank_frozen)
      return Response.json({ error: 'Votre compte bancaire est gelé — transferts désactivés' }, { status: 403 });

    const ident = recipientRaw.replace(/^@/, '').toLowerCase();

    // Résoudre le destinataire par email ou username
    const candidates = await base44.asServiceRole.entities.User.filter({
      $or: [{ email: ident }, { username: ident }]
    });
    const recipient = (candidates || []).find(
      (u: any) => (u.email || '').toLowerCase() === ident || (u.username || '').toLowerCase() === ident
    );
    if (!recipient) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    if (recipient.id === user.id) return Response.json({ error: 'Impossible de se transférer à soi-même' }, { status: 400 });
    if (recipient.bank_frozen)
      return Response.json({ error: 'Le compte bancaire destinataire est gelé' }, { status: 403 });

    // Vérifier le solde source
    let sourceBalance = 0;
    let sourceWalletName = 'Principal';
    if (sourceWalletId === 'primary') {
      sourceBalance = Number(user.referral_credits || 0);
    } else {
      const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id });
      const w = (wallets || []).find((x: any) => x.id === sourceWalletId);
      if (!w) return Response.json({ error: 'Portefeuille source introuvable' }, { status: 404 });
      if (w.frozen) return Response.json({ error: `Portefeuille « ${w.name} » gelé par l'administration` }, { status: 400 });
      sourceBalance = Number(w.balance || 0);
      sourceWalletName = w.name;
    }
    if (sourceBalance < amount) return Response.json({ error: 'Solde insuffisant' }, { status: 400 });

    // Débiter la source
    const newSenderCredits = Math.max(0, sourceBalance - amount);
    if (sourceWalletId === 'primary') {
      await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newSenderCredits });
    } else {
      await base44.asServiceRole.entities.Wallet.update(sourceWalletId, { balance: sourceBalance - amount });
    }

    // Créditer le destinataire (compte principal) — déduction des frais
    const newReceiverCredits = Number(recipient.referral_credits || 0) + netReceived;
    await base44.asServiceRole.entities.User.update(recipient.id, { referral_credits: newReceiverCredits });

    // Ledger : un enregistrement côté expéditeur, un côté destinataire
    const senderLabel = user.display_name || user.full_name || user.username || user.email;
    const recipLabel = recipient.display_name || recipient.full_name || recipient.username || recipient.email;
    await base44.asServiceRole.entities.CreditTransaction.bulkCreate([
      {
        owner_id: user.id,
        type: 'transfer_out',
        amount: -amount,
        counterparty_id: recipient.id,
        counterparty_name: recipLabel,
        counterparty_username: recipient.username || '',
        from_wallet_name: sourceWalletName,
        to_wallet_name: 'Principal',
        note,
        status: 'completed'
      },
      {
        owner_id: recipient.id,
        type: 'transfer_in',
        amount: netReceived,
        counterparty_id: user.id,
        counterparty_name: senderLabel,
        counterparty_username: user.username || '',
        from_wallet_name: sourceWalletName,
        to_wallet_name: 'Principal',
        note,
        status: 'completed'
      }
    ]);

    // Notification au destinataire
    try {
      await base44.asServiceRole.entities.Notification.create({
        user_email: recipient.email,
        type: 'system',
        title: 'Crédits reçus',
        content: `${senderLabel} vous a envoyé ${amount} crédits${note ? ' — ' + note : ''}.`,
        sender_id: user.id,
        sender_name: senderLabel,
      });
    } catch {}

    // Emails branded d'annonce du virement (destinataire + expéditeur)
    const esc = (s: any) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const senderEsc = esc(senderLabel);
    const recipEsc = esc(recipLabel);
    const noteEsc = esc(note);
    const feeLine = fee > 0 ? ` (frais ${fee} cr déduits)` : '';
    const noteLine = note ? ` — ${noteEsc}${feeLine}` : (fee > 0 ? ` —${feeLine}` : '');
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const sourceNewBalance = sourceWalletId === 'primary' ? newSenderCredits : (sourceBalance - amount);

    // Email destinataire (réception)
    try {
      const recipContent = `
        <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Bonjour <strong style="color:#f1f5f9;">${recipEsc}</strong>,</p>
        <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Vous avez reçu un virement de <strong style="color:#f1f5f9;">${amount} crédits Eza</strong> de la part de <strong style="color:#f1f5f9;">${senderEsc}</strong>${noteLine}.</p>
        <div style="background:#0b1220;border:1px solid #1e293b;border-radius:14px;padding:20px;margin:16px 0;text-align:center;">
          <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Crédits reçus</p>
          <p style="font-size:34px;font-weight:800;margin:0;color:#34d399;">＋ ${netReceived.toLocaleString('fr-FR')} crédits</p>
          <div style="display:flex;justify-content:center;gap:24px;margin-top:18px;">
            <div><p style="color:#64748b;font-size:10px;margin:0;letter-spacing:1px;text-transform:uppercase;">Nouveau solde</p><p style="color:#34d399;font-size:18px;font-weight:700;margin:4px 0 0;">${newReceiverCredits.toLocaleString('fr-FR')}</p></div>
          </div>
        </div>
        <p style="color:#64748b;font-size:12px;margin:16px 0 0;">Date de l'opération : <strong style="color:#94a3b8;">${dateStr}</strong></p>
        <p style="color:#64748b;font-size:12px;margin:10px 0 0;">Retrouvez l'historique dans la <a href="/banque" style="color:#38bdf8;text-decoration:none;">Banque Eza</a>.</p>`;
      const recipHtml = ezaEmailShell('Crédits reçus', recipContent, { accent: '#34d399', tagline: 'Virement Eza' });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient.email,
        subject: `eza — ✅ ${netReceived} crédits reçus de ${senderEsc}`,
        body: recipHtml,
        from_name: 'eza — Banque',
      });
    } catch {}

    // Email expéditeur (confirmation d'envoi)
    if (user?.email) {
      try {
        const senderContent = `
          <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Bonjour <strong style="color:#f1f5f9;">${senderEsc}</strong>,</p>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Votre virement de <strong style="color:#f1f5f9;">${amount} crédits Eza</strong> à destination de <strong style="color:#f1f5f9;">${recipEsc}</strong> a bien été effectué${noteLine}.</p>
          <div style="background:#0b1220;border:1px solid #1e293b;border-radius:14px;padding:20px;margin:16px 0;text-align:center;">
            <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Virement envoyé</p>
            <p style="font-size:34px;font-weight:800;margin:0;color:#38bdf8;">－ ${amount.toLocaleString('fr-FR')} crédits</p>
            <div style="display:flex;justify-content:center;gap:24px;margin-top:18px;">
              <div><p style="color:#64748b;font-size:10px;margin:0;letter-spacing:1px;text-transform:uppercase;">Portefeuille source</p><p style="color:#94a3b8;font-size:16px;font-weight:700;margin:4px 0 0;">${esc(sourceWalletName)}</p></div>
              <div style="width:1px;background:#1e293b;"></div>
              <div><p style="color:#64748b;font-size:10px;margin:0;letter-spacing:1px;text-transform:uppercase;">Nouveau solde source</p><p style="color:#38bdf8;font-size:18px;font-weight:700;margin:4px 0 0;">${sourceNewBalance.toLocaleString('fr-FR')}</p></div>
            </div>
          </div>
          <p style="color:#64748b;font-size:12px;margin:16px 0 0;">Date de l'opération : <strong style="color:#94a3b8;">${dateStr}</strong></p>
          <p style="color:#64748b;font-size:12px;margin:10px 0 0;">Retrouvez l'historique dans la <a href="/banque" style="color:#38bdf8;text-decoration:none;">Banque Eza</a>.</p>`;
        const senderHtml = ezaEmailShell('Virement envoyé', senderContent, { accent: '#38bdf8', tagline: 'Virement Eza' });
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `eza — ✅ ${amount} crédits envoyés à ${recipEsc}`,
          body: senderHtml,
          from_name: 'eza — Banque',
        });
      } catch {}
    }

    return Response.json({
      success: true,
      message: `${amount} crédits envoyés à ${recipLabel}`,
      newBalance: sourceWalletId === 'primary' ? newSenderCredits : null
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur' }, { status: 500 });
  }
}