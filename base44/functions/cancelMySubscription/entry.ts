import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

// Lets a user cancel their own active perk-based subscription (Premium/Business/Enterprise/VIP).
// Sets the highest active tier's *_until to now so it expires immediately.
// Only cancels — never grants.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const perks = user.perks || {};
    const now = new Date().toISOString();

    // Determine the highest currently-active tier key.
    const tierKeys = ['enterprise_until', 'vip_until', 'business_until', 'premium_until'];
    const activeKey = tierKeys.find(k => {
      const v = perks[k];
      if (!v) return false;
      if (v === true || v === null) return true;
      return new Date(v).getTime() > Date.now();
    });

    if (!activeKey) {
      return Response.json({ error: 'Aucun abonnement actif à annuler' }, { status: 400 });
    }

    const newPerks = { ...perks };
    delete newPerks[activeKey];

    await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });

    return Response.json({
      success: true,
      cancelledTier: activeKey,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}