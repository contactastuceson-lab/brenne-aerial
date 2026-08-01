// Actions exécutables par Nexus sur les tickets support.
// RESERVED (escalade humaine obligatoire) :
//   account_deletion, stripe_refund, ban, content_removal, fraud_dispute

export const AUTO_ACTIONS = ['recalc_post', 'create_default_wallet', 'close_ticket', 'reopen_ticket'];
export const CONFIRMABLE_ACTIONS = ['grant_credits', 'refund_credits', 'cancel_event_registration', 'move_credits', 'unfreeze_wallet'];
export const ALL_ACTIONS = [...AUTO_ACTIONS, ...CONFIRMABLE_ACTIONS];

export const COURTESY_CREDIT_CAP = 100;

export function describeAction(type, params = {}) {
  switch (type) {
    case 'grant_credits': return `Octroyer ${params.amount || 0} crédits de courtoisie${params.wallet_name ? ` → ${params.wallet_name}` : ''}`;
    case 'refund_credits': return `Rembourser ${params.amount || 0} crédits${params.wallet_name ? ` → ${params.wallet_name}` : ''}`;
    case 'cancel_event_registration': return `Annuler l'inscription${params.event_title ? ` à « ${params.event_title} »` : ''} + remboursement`;
    case 'move_credits': return `Déplacer ${params.amount || 0} crédits ${params.from_name || ''} → ${params.to_name || ''}`;
    case 'unfreeze_wallet': return `Dégeler le portefeuille ${params.wallet_name || ''}`;
    case 'recalc_post': return `Recalculer les compteurs de la publication`;
    case 'create_default_wallet': return `Créer le portefeuille par défaut`;
    case 'close_ticket': return `Fermer le ticket`;
    case 'reopen_ticket': return `Rouvrir le ticket`;
    default: return type;
  }
}

async function getOrCreateDefaultWallet(base44, userId, userEmail) {
  const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: userId }).catch(() => []);
  if (wallets && wallets.length) return wallets[0];
  return await base44.asServiceRole.entities.Wallet.create({
    owner_id: userId, owner_email: userEmail, name: 'Dépenses', type: 'depenses', balance: 0,
  }).catch(() => null);
}

export async function executeNexusAction(base44, action, ticket, user) {
  const { type, params = {} } = action;
  const userId = user?.id || ticket?.user_id;
  const userEmail = user?.email || ticket?.user_email;
  const label = describeAction(type, params);
  try {
    if (type === 'grant_credits' || type === 'refund_credits') {
      const amount = Math.max(0, Math.min(Number(params.amount) || 0, COURTESY_CREDIT_CAP));
      if (amount <= 0) throw new Error('Montant invalide (1-100)');
      let wallet = null;
      if (params.wallet_id) wallet = await base44.asServiceRole.entities.Wallet.get(params.wallet_id).catch(() => null);
      if (!wallet) wallet = await getOrCreateDefaultWallet(base44, userId, userEmail);
      if (!wallet) throw new Error('Aucun portefeuille disponible');
      await base44.asServiceRole.entities.Wallet.update(wallet.id, {
        balance: Number(wallet.balance || 0) + amount,
      }).catch(() => {});
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: userId, type: 'admin_credit', amount: +amount,
        to_wallet_name: wallet.name,
        note: type === 'grant_credits' ? (params.reason || 'Crédit de courtoisie Nexus') : (params.reason || 'Remboursement Nexus'),
        status: 'completed',
      }).catch(() => {});
      await base44.asServiceRole.entities.RewardLog.create({
        user_email: userEmail, user_id: userId,
        action: type === 'grant_credits' ? 'courtesy_credit' : 'refund_credit',
        action_label: label, credits: amount,
        metadata: { ticket_id: ticket?.id, reason: params.reason },
      }).catch(() => {});
      return { ok: true, label, result: { amount, wallet: wallet.name } };
    }

    if (type === 'cancel_event_registration') {
      const regId = params.registration_id;
      if (!regId) throw new Error('registration_id requis');
      const reg = await base44.asServiceRole.entities.EventRegistration.get(regId).catch(() => null);
      if (!reg) throw new Error('Inscription introuvable');
      if (reg.user_id !== userId) throw new Error('Inscription non assignable à cet utilisateur');
      if (reg.status !== 'registered') throw new Error('Inscription non annulable');
      if (Number(reg.credits_paid) > 0) {
        const wallet = await getOrCreateDefaultWallet(base44, userId, userEmail);
        if (wallet) {
          await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            balance: Number(wallet.balance || 0) + Number(reg.credits_paid),
          }).catch(() => {});
          await base44.asServiceRole.entities.CreditTransaction.create({
            owner_id: userId, type: 'admin_credit', amount: +Number(reg.credits_paid),
            to_wallet_name: wallet.name,
            note: `Remboursement annulation event ${reg.event_title || ''}`,
            status: 'completed',
          }).catch(() => {});
        }
      }
      await base44.asServiceRole.entities.EventRegistration.update(regId, {
        status: 'cancelled', cancelled_at: new Date().toISOString(),
        refund_note: params.reason || 'Annulation par Nexus support',
      }).catch(() => {});
      return { ok: true, label, result: { registration_id: regId, credits_refunded: reg.credits_paid } };
    }

    if (type === 'move_credits') {
      const amount = Number(params.amount) || 0;
      if (amount <= 0) throw new Error('Montant invalide');
      const fromW = await base44.asServiceRole.entities.Wallet.get(params.from_wallet_id).catch(() => null);
      const toW = await base44.asServiceRole.entities.Wallet.get(params.to_wallet_id).catch(() => null);
      if (!fromW || !toW) throw new Error('Portefeuilles introuvables');
      if (fromW.owner_id !== userId || toW.owner_id !== userId) throw new Error('Portefeuilles non assignables');
      if (Number(fromW.balance || 0) < amount) throw new Error('Solde insuffisant');
      await base44.asServiceRole.entities.Wallet.update(fromW.id, { balance: Number(fromW.balance) - amount }).catch(() => {});
      await base44.asServiceRole.entities.Wallet.update(toW.id, { balance: Number(toW.balance || 0) + amount }).catch(() => {});
      await base44.asServiceRole.entities.CreditTransaction.create({
        owner_id: userId, type: 'wallet_move', amount: -amount,
        from_wallet_name: fromW.name, to_wallet_name: toW.name,
        note: params.reason || 'Déplacement par Nexus', status: 'completed',
      }).catch(() => {});
      return { ok: true, label, result: { amount, from: fromW.name, to: toW.name } };
    }

    if (type === 'unfreeze_wallet') {
      const w = await base44.asServiceRole.entities.Wallet.get(params.wallet_id).catch(() => null);
      if (!w) throw new Error('Portefeuille introuvable');
      if (w.owner_id !== userId) throw new Error('Portefeuille non assignable');
      await base44.asServiceRole.entities.Wallet.update(w.id, { frozen: false }).catch(() => {});
      return { ok: true, label, result: { wallet: w.name } };
    }

    if (type === 'recalc_post') {
      const post = await base44.asServiceRole.entities.Post.get(params.post_id).catch(() => null);
      if (!post) throw new Error('Publication introuvable');
      const likesCount = Array.isArray(post.liked_by) ? post.liked_by.length : (post.likes_count || 0);
      await base44.asServiceRole.entities.Post.update(post.id, { likes_count: likesCount }).catch(() => {});
      return { ok: true, label, result: { likes_count: likesCount } };
    }

    if (type === 'create_default_wallet') {
      const wallet = await getOrCreateDefaultWallet(base44, userId, userEmail);
      return { ok: true, label, result: { wallet: wallet?.name, already: !!(wallet && wallet.balance === 0 && wallet.created_date) } };
    }

    if (type === 'close_ticket') {
      if (ticket?.id) await base44.asServiceRole.entities.SupportTicket.update(ticket.id, { status: 'closed' }).catch(() => {});
      return { ok: true, label, result: {} };
    }
    if (type === 'reopen_ticket') {
      if (ticket?.id) await base44.asServiceRole.entities.SupportTicket.update(ticket.id, { status: 'open', assignee: 'ai' }).catch(() => {});
      return { ok: true, label, result: {} };
    }

    throw new Error('Action inconnue: ' + type);
  } catch (e) {
    return { ok: false, label, error: String(e?.message || e) };
  }
}