import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Comptes officiels à suivre automatiquement
const OFFICIAL_ACCOUNTS = [
  {
    email: 'contact.astuceson@gmail.com',
    name: 'Astuceson Officiel',
  },
  {
    email: 'lefoulonmeyer0@gmail.com',
    name: 'EZA group',
  },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // L'automation d'entité envoie { event, data }
    // data contient le nouvel utilisateur (email, display_name, etc.)
    const newUser = payload.data || payload;
    const followerEmail = newUser?.email;
    if (!followerEmail) {
      return Response.json({ skipped: 'no_email' });
    }

    // Éviter d'auto-abonner les comptes officiels eux-mêmes
    if (OFFICIAL_ACCOUNTS.some(a => a.email === followerEmail)) {
      return Response.json({ skipped: 'is_official_account' });
    }

    const followerName = newUser?.display_name || newUser?.full_name || followerEmail;

    // Vérifier les abonnements existants
    const existing = await base44.asServiceRole.entities.Follow.filter({
      follower_email: followerEmail,
      following_email: { $in: OFFICIAL_ACCOUNTS.map(a => a.email) },
    });
    const alreadyFollowing = new Set((existing || []).map(f => f.following_email));

    // Créer les abonnements manquants
    const toCreate = OFFICIAL_ACCOUNTS
      .filter(a => !alreadyFollowing.has(a.email))
      .map(a => ({
        follower_email: followerEmail,
        follower_name: followerName,
        following_email: a.email,
        following_name: a.name,
      }));

    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.Follow.bulkCreate(toCreate);
    }

    return Response.json({
      success: true,
      follower: followerEmail,
      created: toCreate.length,
      already_following: alreadyFollowing.size,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}