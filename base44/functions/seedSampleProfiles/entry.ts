import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FIRST = ['Léa','Lucas','Manon','Hugo','Emma','Gabriel','Camille','Louis','Jules','Chloé','Sarah','Adam','Inès','Nino','Roma','Tim','Elena','Yanis','Noé','Lana','Théo','Maya','Ethan','Jade','Noah','Lina','Aaron','Sofia','Liam','Mila','Zoé','Nathan','Alice','Raphaël','Anna','Tom','Lola','Gaspard','Maxime','Clara','Eden','Naël','Romane','Sacha','Lison','Côme','Capucine','Victor','Mahina','Malik','Yuna','Kais','Nola','Aya','Tiago','Mia','Sasha','Esteban','Lila','Achille','Calista','Dries','Mona','Souleymane','Inaya','Tao','Naomi','Léana','Aria','Léon','Idriss','Senna','Lou','Milan','Lya','Neïla','Augustin','Vincen','Shana','Hana','Léonie','Garance','Suvan','Aïssa','Aïcha','Naomi','Louna','Doria','Nael','Maelys','Suvan','Selena','Kylian','Soraya','Tristan','Anissa'];
const LAST = ['Martin','Bernard','Dubois','Moreau','Laurent','Simon','Michel','Lefebvre','Garcia','Roux','Fournier','Girard','Bonnet','Gautier','Fontaine','Mercier','Lopez','Nguyen','Robin','Renard','Picard','Garnier','Chevalier','Raynaud','Dumont','Brun','Marchand','Aubert','Lemoine','Vidal'];

const NICHES = [
  { key: 'films', niche: 'Cinéma & Vidéo', emoji: '🎬', suffix: 'films', bios: [
    'Réalisateur & monteur 🎬 | Paris → partout | 📸 portfolio ↓',
    'Créateur de contenus vidéo 🎥 | pub & collab → DM',
    'Filmmaker 🎬 | drone addict | nouveau court-métrage ↓',
    'Storyteller visuel 📹 | marques & artistes | book en bio',
  ] },
  { key: 'food', niche: 'Food', emoji: '🍃', suffix: 'food', bios: [
    'Vegan food lover & recipe creator 🌿 | 📖 ebook dispo',
    'Chef à domicile 👨‍🍳 | recettes faciles | #foodporn',
    'Pâtissière amateur 🧁 | astuces & sweet vibes | collab → DM',
    'Food explorer 🍜 | bonnes adresses & restaurants testés',
  ] },
  { key: 'gaming', niche: 'Gaming', emoji: '🎮', suffix: 'gg', bios: [
    'Streamer FPS | Top 500 EU ⚡ | live chaque soir 20h',
    'Pro player 🎯 | compétitions & setups | partner Twitch',
    'Gamer & créateur 🕹️ | speedrun, retro & chill',
    'Esports commentator 🎙️ | analyses & highlight clips',
  ] },
  { key: 'travel', niche: 'Voyage', emoji: '✈️', suffix: 'travel', bios: [
    'Travel creator 🌍 | 42 pays | meilleurs spots ↓',
    'Backpacker & photographe 📸 | budget travel tips',
    'Nomade digital 💻 | working from everywhere',
    'Aventure & trek 🏔️ | guides & itinéraires en bio',
  ] },
  { key: 'fit', niche: 'Fitness & Sport', emoji: '💪', suffix: 'fit', bios: [
    'Coach sportif certifié 💪 | programmes en ligne | #fitfam',
    'Yoga & bien-être 🧘 | retraites & cours en ligne',
    'Calisthenics athlete 🤸 | progressions & tutos',
    'Running & marathon 🏃 | plans d\'entraînement gratuits',
  ] },
  { key: 'music', niche: 'Musique', emoji: '🎧', suffix: 'music', bios: [
    'Producer & beatmaker 🎧 | placements & collabs',
    'Chanteuse & autrice-compositrice 🎤 | nouveau single ↓',
    'DJ | house & techno 🎛️ | bookings → DM',
    'Multi-instrumentiste 🎸 | covers & sessions live',
  ] },
  { key: 'tech', niche: 'Tech', emoji: '💻', suffix: 'tech', bios: [
    'Dev & créateur tech 💻 | tutos & reviews',
    'Maker & hardware hacker 🤖 | projets open source',
    'AI builder 🤖 | ship fast, break things',
    'Reviewer hardware ⚙️ | tests & benchmarks',
  ] },
  { key: 'style', niche: 'Mode & Beauté', emoji: '💄', suffix: 'style', bios: [
    'Makeup artist 💄 | tutoriels & collabs marques',
    'Styliste & créatrice de bijoux ✨ | boutique ↓',
    'Fashion creator 👗 | lookbook & thrift hauls',
    'Skincare addict 🧴 | routine & conseils',
  ] },
  { key: 'art', niche: 'Photo & Art', emoji: '📸', suffix: 'art', bios: [
    'Photographe portrait 📸 | lumière naturelle | book ↓',
    'Illustratrice & character designer 🎨 | commissions ouvertes',
    'Street photographer 📷 | noir & blanc | prints dispo',
    'Peintre & muraliste 🖌️ | fresques & expositions',
  ] },
  { key: 'hq', niche: 'Business & Mindset', emoji: '🚀', suffix: 'hq', bios: [
    'Entrepreneur & fondateur 🚀 | build in public',
    'Coach business & mindset 💡 | 7-figure habits',
    'Investisseur angel 📈 | tech & saas',
    'Side-project builder 🛠️ | no-code & growth',
  ] },
];

const LOCATIONS = ['Paris','Lyon','Marseille','Lille','Bordeaux','Toulouse','Nantes','Strasbourg','Bruxelles','Genève','Montréal','Lausanne','Nice','Rennes','Montpellier','Tours','Le Mans','Orléans','Aix-en-Provence','Annecy'];

function pickVerifs(i) {
  const v = [];
  if (i % 7 === 0) v.push('verified');
  if (i % 13 === 0) v.push('pro');
  if (i % 23 === 0) v.push('certified');
  if (i % 41 === 0) v.push('official');
  return v;
}

function pickBadges(i) {
  const b = [];
  if (i % 11 === 0) b.push('Pilote');
  if (i % 17 === 0) b.push('VIP');
  if (i % 19 === 0) b.push('Partenaire');
  if (i % 29 === 0) b.push('Officiel');
  return b;
}

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Idempotent: clear existing sample profiles
  try {
    await base44.asServiceRole.entities.SampleProfile.deleteMany({});
  } catch (_) {}

  const total = 100;
  const records = [];
  for (let i = 0; i < total; i++) {
    const fn = FIRST[i % FIRST.length];
    const ln = LAST[(i * 7) % LAST.length];
    const niche = NICHES[i % NICHES.length];
    const bio = niche.bios[i % niche.bios.length];
    const username = `${slug(fn)}${niche.suffix}${i}`;
    const displayName = `${fn} ${ln}`;
    const followersCount = i % 3 === 0 ? ((i * 97) % 900000) + 100000 : ((i * 131) % 48000) + 2000;
    const website = i % 2 === 0 ? `https://linktr.ee/${username}` : '';
    const rec = {
      username,
      display_name: displayName,
      full_name: displayName,
      bio,
      avatar_url: `https://i.pravatar.cc/300?u=${username}`,
      cover_url: '',
      location: LOCATIONS[i % LOCATIONS.length],
      website,
      niche: niche.niche,
      verifications: pickVerifs(i),
      badges: pickBadges(i),
      social_instagram: `https://instagram.com/${username}`,
      social_tiktok: `https://tiktok.com/@${username}`,
      social_twitter: i % 2 === 0 ? `https://x.com/${username}` : '',
      social_youtube: i % 4 === 0 ? `https://youtube.com/@${username}` : '',
      followers_count: followersCount,
      following_count: (i * 11) % 2000 + 50,
      posts_count: (i * 3) % 300 + 5,
      is_featured: i < 6 || i % 31 === 0,
    };
    records.push(rec);
  }

  let created = 0;
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100);
    const res = await base44.asServiceRole.entities.SampleProfile.bulkCreate(batch);
    created += (Array.isArray(res) ? res.length : (res?.length || batch.length));
  }

  return Response.json({ success: true, created: created });
});