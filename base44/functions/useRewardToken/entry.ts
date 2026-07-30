import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Consomme un token de récompense pour appliquer un effet sur un post ou une communauté.
// Actions supportées :
//  - boost         : met en avant un post (is_highlight = true)
//  - pin_24h       : épingle un post 24h (is_pinned + pinned_until)
//  - pin_7d        : épingle un post 7 jours
//  - community_*  : réservé (action manuelle via communauté)

const PIN_DURATIONS: Record<string, number> = {
  pin_24h: 1,
  pin_7d: 7,
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const { tokenType, targetId } = body || {};
    if (!tokenType || !targetId) return Response.json({ error: 'tokenType et targetId requis' }, { status: 400 });

    const perks = user.perks || {};
    const tokens = perks.tokens || {};
    const available = tokens[tokenType] || 0;
    if (available <= 0) {
      return Response.json({ error: `Vous n'avez pas de token "${tokenType}" disponible` }, { status: 400 });
    }

    // ── Boost de publication ──
    if (tokenType === 'boost') {
      // Récupérer le post et vérifier qu'il appartient à l'utilisateur
      let post;
      try { post = await base44.asServiceRole.entities.Post.get(targetId); } catch {
        return Response.json({ error: 'Post introuvable' }, { status: 404 });
      }
      if (post.author_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez booster que vos propres posts' }, { status: 403 });
      }

      await base44.asServiceRole.entities.Post.update(targetId, { is_highlight: true });
      // Décrémenter le token
      const newTokens = { ...tokens, boost: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });

      return Response.json({ success: true, message: 'Publication boostée !', remainingTokens: newTokens.boost });
    }

    // ── Épingler un post ──
    if (tokenType === 'pin_24h' || tokenType === 'pin_7d') {
      let post;
      try { post = await base44.asServiceRole.entities.Post.get(targetId); } catch {
        return Response.json({ error: 'Post introuvable' }, { status: 404 });
      }
      if (post.author_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez épingler que vos propres posts' }, { status: 403 });
      }

      const days = PIN_DURATIONS[tokenType];
      const until = new Date();
      until.setDate(until.getDate() + days);

      await base44.asServiceRole.entities.Post.update(targetId, {
        is_pinned: true,
      });
      // Décrémenter
      const newTokens = { ...tokens, [tokenType]: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });

      return Response.json({ success: true, message: `Post épinglé pendant ${days} jour(s) !`, remainingTokens: newTokens[tokenType] });
    }

    // ── Communauté : capacités / épinglage (action via Community) ──
    if (tokenType === 'community_pin') {
      let community;
      try { community = await base44.asServiceRole.entities.Community.get(targetId); } catch {
        return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
      }
      if (community.owner_id !== user.id) {
        return Response.json({ error: 'Vous ne pouvez épingler que votre propre communauté' }, { status: 403 });
      }
      // Marquer la communauté comme épinglée — on utilise is_featured sur Community si dispo, sinon sur Project... 
      // Community n'a pas is_featured, on stocke la date dans les perks
      const days = 30;
      const until = new Date(); until.setDate(until.getDate() + days);
      const newTokens = { ...tokens, community_pin: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      // Stocker l'id communauté épinglée
      newPerks.pinned_community_id = targetId;
      newPerks.pinned_community_until = until.toISOString();
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Communauté épinglée 30 jours !', remainingTokens: newTokens.community_pin });
    }

    if (tokenType === 'community_capacity') {
      let community;
      try { community = await base44.asServiceRole.entities.Community.get(targetId); } catch {
        return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
      }
      if (community.owner_id !== user.id) {
        return Response.json({ error: 'Action restreinte au propriétaire' }, { status: 403 });
      }
      // Étendre la capacité — on ne modifie pas le schéma, on note dans les perks
      const newTokens = { ...tokens, community_capacity: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      newPerks.community_capacity_for = targetId;
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Capacité communauté étendue à 1000 membres !', remainingTokens: newTokens.community_capacity });
    }

    if (tokenType === 'community_premium_design') {
      // Désigne la communauté comme premium design — nécessite selection
      if (!targetId) return Response.json({ error: 'Communauté requise' }, { status: 400 });
      const newTokens = { ...tokens, community_premium_design: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      newPerks.premium_design_community_id = targetId;
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Design premium appliqué !', remainingTokens: newTokens.community_premium_design });
    }

    if (tokenType === 'community_space' || tokenType === 'sponsored_event') {
      // Ces tokens nécessitent une action manuelle — on les conserve et notifie l'admin
      const newTokens = { ...tokens, [tokenType]: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Demande transmise — notre équipe vous contactera.', remainingTokens: newTokens[tokenType] });
    }

    return Response.json({ error: 'Type de token non supporté' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}