import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const OFFICIAL_ACCOUNTS = [
  { email: 'contact.astuceson@gmail.com', name: 'Astuceson Officiel' },
  { email: 'lefoulonmeyer0@gmail.com', name: 'EZA group' },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Récupérer tous les utilisateurs
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const userInfos = allUsers
      .map(u => ({
        email: u.email,
        name: u.display_name || u.full_name || u.email,
      }))
      .filter(u => u.email && !OFFICIAL_ACCOUNTS.some(o => o.email === u.email));

    // Récupérer les abonnements existants vers les comptes officiels
    const existing = await base44.asServiceRole.entities.Follow.filter({
      following_email: { $in: OFFICIAL_ACCOUNTS.map(o => o.email) },
    }, '-created_date', 2000);

    const existingSet = new Set();
    for (const f of existing || []) {
      existingSet.add(`${f.follower_email}|${f.following_email}`);
    }

    // Construire la liste des abonnements manquants
    const toCreate = [];
    for (const user of userInfos) {
      for (const official of OFFICIAL_ACCOUNTS) {
        const key = `${user.email}|${official.email}`;
        if (!existingSet.has(key)) {
          toCreate.push({
            follower_email: user.email,
            follower_name: user.name,
            following_email: official.email,
            following_name: official.name,
          });
        }
      }
    }

    // Créer par lots de 100
    let created = 0;
    for (let i = 0; i < toCreate.length; i += 100) {
      const batch = toCreate.slice(i, i + 100);
      await base44.asServiceRole.entities.Follow.bulkCreate(batch);
      created += batch.length;
    }

    return Response.json({
      success: true,
      totalUsers: userInfos.length,
      alreadySubscribed: existingSet.size,
      created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}