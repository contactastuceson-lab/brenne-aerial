import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    // Vérifier le solde source
    let sourceBalance = 0;
    let sourceWalletName = 'Principal';
    if (sourceWalletId === 'primary') {
      sourceBalance = Number(user.referral_credits || 0);
    } else {
      const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id });
      const w = (wallets || []).find((x: any) => x.id === sourceWalletId);
      if (!w) return Response.json({ error: 'Portefeuille source introuvable' }, { status: 404 });
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

    // Créditer le destinataire (compte principal)
    const newReceiverCredits = Number(recipient.referral_credits || 0) + amount;
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
        amount,
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

    return Response.json({
      success: true,
      message: `${amount} crédits envoyés à ${recipLabel}`,
      newBalance: sourceWalletId === 'primary' ? newSenderCredits : null
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur' }, { status: 500 });
  }
}