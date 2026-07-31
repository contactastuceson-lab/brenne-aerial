import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ADMIN_ROLES = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !ADMIN_ROLES.includes(user?.role)) {
      return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── Overview ──
    if (action === 'overview') {
      const [wallets, txs] = await Promise.all([
        base44.asServiceRole.entities.Wallet.list('-created_date', 1000),
        base44.asServiceRole.entities.CreditTransaction.list('-created_date', 1000),
      ]);
      const totalHeld = wallets.reduce((s: number, w: any) => s + (w.balance || 0), 0);
      const last30 = Date.now() - 30 * 86400000;
      const recentTxs = txs.filter((t: any) => new Date(t.created_date).getTime() > last30).length;
      return Response.json({
        totalWallets: wallets.length,
        totalHeld,
        totalTxs: txs.length,
        recentTxs,
        wallets: wallets.slice(0, 50),
        txs: txs.slice(0, 30),
      });
    }

    // ── Liste portefeuilles ──
    if (action === 'list_wallets') {
      const wallets = await base44.asServiceRole.entities.Wallet.list('-created_date', 1000);
      return Response.json({ wallets });
    }

    // ── Liste transactions ──
    if (action === 'list_transactions') {
      const txs = await base44.asServiceRole.entities.CreditTransaction.list('-created_date', 1000);
      return Response.json({ txs });
    }

    // ── Ajuster le solde d'un portefeuille ──
    if (action === 'adjust_wallet') {
      const { walletId, newBalance, reason } = body;
      if (!walletId) return Response.json({ error: 'walletId manquant' }, { status: 400 });
      const w: any = await base44.asServiceRole.entities.Wallet.get(walletId).catch(() => null);
      if (!w) return Response.json({ error: 'Portefeuille introuvable' }, { status: 404 });
      const oldBalance = w.balance || 0;
      const nb = Math.max(0, Math.round(Number(newBalance) || 0));
      await base44.asServiceRole.entities.Wallet.update(walletId, { balance: nb });
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: w.owner_id,
        type: nb >= oldBalance ? 'admin_credit' : 'admin_debit',
        amount: nb - oldBalance,
        to_wallet_name: w.name,
        note: reason ? `Ajustement admin : ${String(reason).slice(0, 200)}` : 'Ajustement administrateur',
        status: 'completed',
      });
      return Response.json({ success: true, newBalance: nb });
    }

    // ── Créer un portefeuille pour un utilisateur ──
    if (action === 'create_wallet') {
      const { ownerId, ownerEmail, name, type, balance } = body;
      if (!ownerId || !name) return Response.json({ error: 'Champs manquants (ownerId, name)' }, { status: 400 });
      const initial = Math.max(0, Math.round(Number(balance) || 0));
      const w = await base44.asServiceRole.entities.Wallet.create({
        owner_id: ownerId,
        owner_email: ownerEmail || '',
        name: String(name).slice(0, 80),
        type: type || 'custom',
        balance: initial,
      });
      if (initial > 0) {
        await base44.asServiceRole.entities.CreditTransaction.create({
          owner_id: ownerId,
          type: 'admin_credit',
          amount: initial,
          to_wallet_name: String(name).slice(0, 80),
          note: `Création portefeuille par admin`,
          status: 'completed',
        });
      }
      return Response.json({ success: true, wallet: w });
    }

    // ── Supprimer un portefeuille (solde doit être nul) ──
    if (action === 'delete_wallet') {
      const { walletId } = body;
      if (!walletId) return Response.json({ error: 'walletId manquant' }, { status: 400 });
      const w: any = await base44.asServiceRole.entities.Wallet.get(walletId).catch(() => null);
      if (!w) return Response.json({ error: 'Portefeuille introuvable' }, { status: 404 });
      if ((w.balance || 0) !== 0) {
        return Response.json({ error: 'Solde non nul — déplacez les crédits avant suppression' }, { status: 400 });
      }
      await base44.asServiceRole.entities.Wallet.delete(walletId);
      return Response.json({ success: true });
    }

    // ── Annuler / rembourser une transaction (re-crédit du propriétaire) ──
    if (action === 'reverse_transaction') {
      const { transactionId } = body;
      if (!transactionId) return Response.json({ error: 'transactionId manquant' }, { status: 400 });
      const tx: any = await base44.asServiceRole.entities.CreditTransaction.get(transactionId).catch(() => null);
      if (!tx) return Response.json({ error: 'Transaction introuvable' }, { status: 404 });
      const amount = Math.abs(tx.amount || 0);
      if (amount <= 0) return Response.json({ error: 'Montant nul, rien à annuler' }, { status: 400 });
      const u: any = await base44.asServiceRole.entities.User.get(tx.owner_id).catch(() => null);
      const cur = (u?.referral_credits || 0);
      await base44.asServiceRole.entities.User.update(tx.owner_id, { referral_credits: cur + amount });
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: tx.owner_id,
        type: 'admin_credit',
        amount,
        note: `Annulation transaction ${tx.type} du ${new Date(tx.created_date).toLocaleDateString('fr-FR')}`,
        status: 'completed',
      });
      return Response.json({ success: true, credited: amount });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});