import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ── "People you may know" — suggestions basées sur connexions mutuelles ───────
// Algorithme style Facebook : trouve les amis de vos amis (connexions mutuelles)
// et les classe par nombre de connexions partagées.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const limit = Math.min(payload.limit || 8, 20);

    // 1. Récupérer la liste des gens que je suis
    const myFollowing = await base44.asServiceRole.entities.Follow.filter({
      follower_email: user.email,
    });

    const followingEmails = new Set(myFollowing.map(f => f.following_email).filter(Boolean));
    followingEmails.add(user.email); // Exclure moi-même

    if (myFollowing.length === 0) {
      // Pas encore de follows → suggestions par défaut (comptes vérifiés / populaires)
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 50);
      const candidates = allUsers
        .filter(u => u.id !== user.id && u.username && !followingEmails.has(u.email))
        .slice(0, limit)
        .map(u => ({
          id: u.id,
          username: u.username,
          display_name: u.display_name || u.full_name || u.username,
          avatar_url: u.avatar_url || null,
          verifications: u.verifications || [],
          bio: u.bio || '',
          mutual_count: 0,
          mutual_names: [],
          reason: 'suggested',
        }));
      return Response.json({ suggestions: candidates });
    }

    // 2. Pour chaque personne que je suis, récupérer qui elle suit (amis d'amis)
    const friendOfFriendMap = new Map(); // email → { count, mutualNames: Set }

    // Limiter le nombre de follows à scanner pour éviter trop de requêtes
    const followingToScan = myFollowing.slice(0, 30);

    for (const follow of followingToScan) {
      try {
        const theirFollows = await base44.asServiceRole.entities.Follow.filter({
          follower_email: follow.following_email,
        });

        for (const f of theirFollows) {
          const candidateEmail = f.following_email;
          if (!candidateEmail || followingEmails.has(candidateEmail)) continue;

          if (!friendOfFriendMap.has(candidateEmail)) {
            friendOfFriendMap.set(candidateEmail, { count: 0, mutualNames: new Set() });
          }
          const entry = friendOfFriendMap.get(candidateEmail);
          entry.count += 1;
          if (follow.following_name) entry.mutualNames.add(follow.following_name);
        }
      } catch (_) {}
    }

    // 3. Trier par nombre de connexions mutuelles (desc)
    const ranked = [...friendOfFriendMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit * 2); // On prend plus pour filtrer ensuite

    if (ranked.length === 0) {
      // Fallback : comptes vérifiés si pas d'amis d'amis
      const verifiedUsers = await base44.asServiceRole.entities.User.list('-created_date', 50);
      const candidates = verifiedUsers
        .filter(u => u.id !== user.id && u.username && !followingEmails.has(u.email))
        .slice(0, limit)
        .map(u => ({
          id: u.id,
          username: u.username,
          display_name: u.display_name || u.full_name || u.username,
          avatar_url: u.avatar_url || null,
          verifications: u.verifications || [],
          bio: u.bio || '',
          mutual_count: 0,
          mutual_names: [],
          reason: 'suggested',
        }));
      return Response.json({ suggestions: candidates });
    }

    // 4. Récupérer les profils des candidats
    const candidateEmails = ranked.map(([email]) => email);
    const candidateUsers = await base44.asServiceRole.entities.User.filter({
      email: { $in: candidateEmails },
    });

    const userMap = new Map(candidateUsers.map(u => [u.email, u]));

    // 5. Construire la liste finale
    const suggestions = ranked
      .map(([email, data]) => {
        const u = userMap.get(email);
        if (!u || !u.username) return null;
        return {
          id: u.id,
          username: u.username,
          display_name: u.display_name || u.full_name || u.username,
          avatar_url: u.avatar_url || null,
          verifications: u.verifications || [],
          bio: u.bio || '',
          mutual_count: data.count,
          mutual_names: [...data.mutualNames].slice(0, 3),
          reason: 'mutual_friends',
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}