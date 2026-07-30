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
      const days = 30;
      const until = new Date(); until.setDate(until.getDate() + days);
      // Épingler la communauté directement sur l'entité
      await base44.asServiceRole.entities.Community.update(targetId, {
        is_pinned: true,
        pinned_until: until.toISOString(),
      });
      const newTokens = { ...tokens, community_pin: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Communauté épinglée 30 jours en haut de la liste !', remainingTokens: newTokens.community_pin });
    }

    if (tokenType === 'community_capacity') {
      let community;
      try { community = await base44.asServiceRole.entities.Community.get(targetId); } catch {
        return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
      }
      if (community.owner_id !== user.id) {
        return Response.json({ error: 'Action restreinte au propriétaire' }, { status: 403 });
      }
      // Étendre la capacité directement sur la communauté
      await base44.asServiceRole.entities.Community.update(targetId, { capacity_limit: 1000 });
      const newTokens = { ...tokens, community_capacity: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Capacité communauté étendue à 1000 membres !', remainingTokens: newTokens.community_capacity });
    }

    if (tokenType === 'community_premium_design') {
      if (!targetId || targetId === 'request') return Response.json({ error: 'Communauté requise' }, { status: 400 });
      let community;
      try { community = await base44.asServiceRole.entities.Community.get(targetId); } catch {
        return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
      }
      if (community.owner_id !== user.id) {
        return Response.json({ error: 'Action restreinte au propriétaire' }, { status: 403 });
      }
      // Appliquer le design premium directement sur la communauté
      await base44.asServiceRole.entities.Community.update(targetId, { is_premium: true });
      const newTokens = { ...tokens, community_premium_design: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      return Response.json({ success: true, message: 'Design premium appliqué à votre communauté !', remainingTokens: newTokens.community_premium_design });
    }

    if (tokenType === 'community_space' || tokenType === 'sponsored_event') {
      const newTokens = { ...tokens, [tokenType]: available - 1 };
      const newPerks = { ...perks, tokens: newTokens };
      await base44.asServiceRole.entities.User.update(user.id, { perks: newPerks });
      // Notifier l'admin
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_email: 'contact.astuceson@gmail.com',
          type: 'system',
          title: tokenType === 'community_space' ? '🎧 Demande de Space communautaire' : '📢 Demande d\'événement sponsorisé',
          content: `${user.display_name || user.username} (${user.email}) demande: ${tokenType}. Communauté: ${targetId}`,
          sender_name: user.display_name || user.username,
        });
      } catch {}
      return Response.json({ success: true, message: 'Demande transmise — notre équipe vous contactera.', remainingTokens: newTokens[tokenType] });
    }

    return Response.json({ error: 'Type de token non supporté' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}