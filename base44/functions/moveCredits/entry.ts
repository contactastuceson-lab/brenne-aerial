import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const fromId = String(body?.from || 'primary');
    const toId = String(body?.to || '');
    const amount = Math.floor(Number(body?.amount) || 0);
    const note = String(body?.note || '').trim();

    if (user.bank_frozen)
      return Response.json({ error: 'Votre compte bancaire est gelé — déplacements désactivés' }, { status: 403 });
    if (!toId) return Response.json({ error: 'Portefeuille destination requis' }, { status: 400 });
    if (fromId === toId) return Response.json({ error: 'Source et destination identiques' }, { status: 400 });
    if (amount <= 0) return Response.json({ error: 'Montant invalide' }, { status: 400 });

    const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: user.id });

    let fromBalance = 0;
    let fromName = 'Principal';
    if (fromId === 'primary') {
      fromBalance = Number(user.referral_credits || 0);
    } else {
      const w = (wallets || []).find((x: any) => x.id === fromId);
      if (!w) return Response.json({ error: 'Portefeuille source introuvable' }, { status: 404 });
      if (w.frozen) return Response.json({ error: `Portefeuille « ${w.name} » gelé par l'administration` }, { status: 400 });
      fromBalance = Number(w.balance || 0);
      fromName = w.name;
    }
    if (fromBalance < amount) return Response.json({ error: 'Solde insuffisant' }, { status: 400 });

    const toWallet = (wallets || []).find((x: any) => x.id === toId);
    if (!toWallet) return Response.json({ error: 'Portefeuille destination introuvable' }, { status: 404 });
    if (toWallet.frozen) return Response.json({ error: `Portefeuille destination « ${toWallet.name} » gelé` }, { status: 400 });
    const toName = toWallet.name;
    const toBalance = Number(toWallet.balance || 0);

    // Débiter la source
    if (fromId === 'primary') {
      await base44.asServiceRole.entities.User.update(user.id, { referral_credits: Math.max(0, fromBalance - amount) });
    } else {
      await base44.asServiceRole.entities.Wallet.update(fromId, { balance: fromBalance - amount });
    }
    // Créditer la destination
    await base44.asServiceRole.entities.Wallet.update(toId, { balance: toBalance + amount });

    // Ledger (un enregistrement)
    await base44.asServiceRole.entities.CreditTransaction.create({
      owner_id: user.id,
      type: 'wallet_move',
      amount,
      from_wallet_name: fromName,
      to_wallet_name: toName,
      note,
      status: 'completed'
    });

    const newReferralCredits = fromId === 'primary'
      ? Math.max(0, fromBalance - amount)
      : Number(user.referral_credits || 0);

    return Response.json({
      success: true,
      message: `${amount} crédits déplacés vers ${toName}`,
      newBalance: newReferralCredits
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur' }, { status: 500 });
  }
}