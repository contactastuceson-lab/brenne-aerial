import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Enregistre un vote de sondage côté serveur (service-role) pour contourner le RLS
// de l'entité Post qui n'autorise la modification qu'à l'auteur ou à un admin.
// Un utilisateur ne peut voter qu'une seule fois (vérifié côté serveur).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const postId = body?.postId;
    const optionId = body?.optionId;
    if (!postId || !optionId) {
      return Response.json({ error: 'postId and optionId required' }, { status: 400 });
    }

    const post = await base44.asServiceRole.entities.Post.get(postId);
    const poll = post.poll;
    if (!poll || !Array.isArray(poll.options)) {
      return Response.json({ error: 'No poll on this post' }, { status: 400 });
    }

    // Déjà voté ? on refuse
    const alreadyVoted = poll.options.some(o => (o.voted_by || []).includes(user.id));
    if (alreadyVoted) {
      return Response.json({ error: 'Already voted', poll }, { status: 409 });
    }

    // Sondage expiré ?
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return Response.json({ error: 'Poll expired', poll }, { status: 409 });
    }

    const updatedOptions = poll.options.map(o => {
      if (o.id === optionId) {
        return { ...o, votes: (o.votes || 0) + 1, voted_by: [...(o.voted_by || []), user.id] };
      }
      return o;
    });
    const newTotal = updatedOptions.reduce((s, o) => s + (o.votes || 0), 0);
    const updatedPoll = { ...poll, options: updatedOptions, total_votes: newTotal };

    await base44.asServiceRole.entities.Post.update(postId, { poll: updatedPoll });

    return Response.json({ poll: updatedPoll });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}