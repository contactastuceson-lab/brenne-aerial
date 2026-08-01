// Construit un résumé contextuel complet de l'utilisateur pour que le LLM
// de support « connaisse tout » du demandeur. Utilisé par autoHandleSupportTicket
// et replySupportTicket. Defensive : aucune fetch ne fait planter le ticket.

export async function buildUserContext(base44, userId, userEmail) {
  const ctx = {
    email: userEmail || 'inconnu',
    id: userId || 'inconnu',
    role: 'user',
    inscritDepuis: null,
    verifications: [],
    badges: [],
    soldeCredits: 0,
    wallets: [],
    transactionsRecentes: [],
    postsCount: 0,
    eventsAVenir: 0,
    referralsCount: 0,
    referralsValides: 0,
    abonnement: null,
  };

  try {
    const users = await base44.asServiceRole.entities.User.list('-created_date', 200).catch(() => []);
    const u = (users || []).find((x) => x.id === userId || x.email === userEmail);
    if (u) {
      ctx.role = u.role || 'user';
      ctx.inscritDepuis = u.created_date || null;
      ctx.verifications = Array.isArray(u.verifications) ? u.verifications : [];
      ctx.badges = Array.isArray(u.badges) ? u.badges : [];
      ctx.abonnement = u.subscription_tier || u.subscription || null;
      ctx.soldeCredits = Number(u.credits || 0);
    }
  } catch {}

  try {
    const wallets = await base44.asServiceRole.entities.Wallet.filter({ owner_id: userId }).catch(() => []);
    ctx.wallets = (wallets || []).map((w) => ({ name: w.name, balance: Number(w.balance || 0), frozen: !!w.frozen }));
    if (ctx.soldeCredits === 0 && ctx.wallets.length) {
      ctx.soldeCredits = ctx.wallets.reduce((s, w) => s + (w.frozen ? 0 : w.balance), 0);
    }
  } catch {}

  try {
    const txs = await base44.asServiceRole.entities.CreditTransaction.filter({ owner_id: userId }, '-created_date', 8).catch(() => []);
    ctx.transactionsRecentes = (txs || []).map((t) => ({ type: t.type, amount: Number(t.amount || 0), note: t.note || '', at: t.created_date }));
  } catch {}

  try {
    const posts = await base44.asServiceRole.entities.Post.filter({ author_id: userId }, '-created_date', 500).catch(() => []);
    ctx.postsCount = (posts || []).length;
  } catch {}

  try {
    const regs = await base44.asServiceRole.entities.EventRegistration.filter({ user_id: userId }, '-created_date', 50).catch(() => []);
    const now = Date.now();
    ctx.eventsAVenir = (regs || []).filter((r) => r.status === 'registered' && r.event_start_date && new Date(r.event_start_date).getTime() > now).length;
  } catch {}

  try {
    const refs = await base44.asServiceRole.entities.Referral.filter({ referrer_email: userEmail }, '-created_date', 200).catch(() => []);
    ctx.referralsCount = (refs || []).length;
    ctx.referralsValides = (refs || []).filter((r) => r.status === 'validated' || r.status === 'rewarded').length;
  } catch {}

  const lines = [
    `Email: ${ctx.email}`,
    `Rôle: ${ctx.role}`,
    ctx.inscritDepuis ? `Inscrit le: ${new Date(ctx.inscritDepuis).toLocaleDateString('fr-FR')}` : null,
    ctx.abonnement ? `Abonnement: ${ctx.abonnement}` : 'Abonnement: gratuit',
    ctx.verifications.length ? `Vérifications/badges: ${[...ctx.verifications, ...ctx.badges].join(', ')}` : null,
    `Solde crédits Eza: ${ctx.soldeCredits}`,
    ctx.wallets.length ? `Portefeuilles: ${ctx.wallets.map((w) => `${w.name}=${w.balance}${w.frozen ? ' (gelé)' : ''}`).join(' | ')}` : null,
    `Publications: ${ctx.postsCount}`,
    `Événements à venir inscrits: ${ctx.eventsAVenir}`,
    `Parrainages: ${ctx.referralsCount} (${ctx.referralsValides} validés)`,
    ctx.transactionsRecentes.length
      ? `Mouvements crédits récents: ${ctx.transactionsRecentes.map((t) => `${t.type}${t.amount >= 0 ? '+' : ''}${t.amount}${t.note ? ` (${t.note})` : ''}`).join(' | ')}`
      : null,
  ].filter(Boolean);

  return { ctx, text: `--- CONTEXTE UTILISATEUR (confidentiel, Nexus) ---\n${lines.join('\n')}` };
}