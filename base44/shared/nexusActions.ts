// Actions exécutables par Nexus sur les tickets support.
// RESERVED (escalade humaine obligatoire) :
//   account_deletion, stripe_refund, ban, content_removal, fraud_dispute

export const AUTO_ACTIONS = ['recalc_post', 'create_default_wallet', 'close_ticket', 'reopen_ticket'];
export const CONFIRMABLE_ACTIONS = ['grant_credits', 'refund_credits', 'cancel_event_registration', 'move_credits', 'unfreeze_wallet', 'register_event'];
export const ALL_ACTIONS = [...AUTO_ACTIONS, ...CONFIRMABLE_ACTIONS];

export const COURTESY_CREDIT_CAP = 100;

export function describeAction(type, params = {}) {
  switch (type) {
    case 'grant_credits': return `Octroyer ${params.amount || 0} crédits de courtoisie${params.wallet_name ? ` → ${params.wallet_name}` : ''}`;
    case 'refund_credits': return `Rembourser ${params.amount || 0} crédits${params.wallet_name ? ` → ${params.wallet_name}` : ''}`;
    case 'cancel_event_registration': return `Annuler l'inscription${params.event_title ? ` à « ${params.event_title} »` : ''} + remboursement`;
    case 'move_credits': return `Déplacer ${params.amount || 0} crédits ${params.from_name || ''} → ${params.to_name || ''}`;
    case 'unfreeze_wallet': return `Dégeler le portefeuille ${params.wallet_name || ''}`;
    case 'register_event': return `Inscrire à l'événement${params.event_title ? ` « ${params.event_title} »` : ''}${Number(params.credits) > 0 ? ` (${params.credits} crédits)` : ' (gratuit)'}`;
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

    if (type === 'register_event') {
      let eventId = params.event_id || params.id;
      // Filet : si le LLM a omis l'event_id mais fourni un titre, on résout
      // l'événement par son titre pour éviter l'échec "event_id requis".
      if (!eventId && params.event_title) {
        try {
          const found = await base44.asServiceRole.entities.Event.filter({}, 'start_date', 50).catch(() => []);
          const match = (found || []).find((e) => e.title === params.event_title)
            || (found || []).find((e) => (e.title || '').toLowerCase().includes(String(params.event_title).toLowerCase()));
          if (match) eventId = match.id;
        } catch {}
      }
      if (!eventId) throw new Error('event_id requis');
      const event = await base44.asServiceRole.entities.Event.get(eventId).catch(() => null);
      if (!event) throw new Error('Événement introuvable');
      if (event.status === 'cancelled') throw new Error('Événement annulé');
      const end = event.end_date ? new Date(event.end_date).getTime() : 0;
      if (end && end < Date.now()) throw new Error('Événement terminé');
      if (event.capacity > 0 && (event.attendees_count || 0) >= event.capacity) throw new Error('Événement complet');
      const existing = await base44.asServiceRole.entities.EventRegistration.filter(
        { event_id: eventId, user_id: userId, status: 'registered' }, '-created_date', 50,
      ).catch(() => []);
      if (existing && existing.length) throw new Error('Vous êtes déjà inscrit');
      const credits = Number(event.price_credits || 0);
      const balance = Number(user?.referral_credits || 0);
      if (credits > 0 && balance < credits) throw new Error(`Crédits insuffisants (${balance}/${credits})`);
      if (credits > 0) {
        await base44.asServiceRole.entities.User.update(userId, { referral_credits: balance - credits }).catch(() => {});
        await base44.asServiceRole.entities.CreditTransaction.create({
          owner_id: userId, type: 'boutique_spend', amount: -credits,
          note: `Inscription Nexus : ${event.title}`, status: 'completed',
        }).catch(() => {});
      }
      const reg = await base44.asServiceRole.entities.EventRegistration.create({
        event_id: eventId, event_title: event.title || '', event_image_url: event.image_url || '',
        event_start_date: event.start_date || '', event_city: event.city || '',
        user_id: userId, user_email: userEmail, user_name: user?.full_name || '', user_username: user?.username || '',
        credits_paid: credits, status: 'registered', registered_at: new Date().toISOString(),
      }).catch(() => null);
      let ticketCode = null;
      if (reg) {
        ticketCode = `EZA-${(reg.id || '').replace(/-/g, '').slice(0, 8).toUpperCase()}`;
        await base44.asServiceRole.entities.EventRegistration.update(reg.id, { ticket_code: ticketCode }).catch(() => {});
      }
      await base44.asServiceRole.entities.Event.update(eventId, {
        registered_ids: [...(event.registered_ids || []), userId],
        attendees_count: (event.attendees_count || 0) + 1,
      }).catch(() => {});
      return { ok: true, label, result: { event: event.title, credits_paid: credits, ticket_code: ticketCode } };
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