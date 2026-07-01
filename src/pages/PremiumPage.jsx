import { useState, useEffect } from 'react';
import { Check, Sparkles, Crown, Shield, TrendingUp, MessageCircle, BarChart2, Megaphone, Palette, ChevronRight, CheckCircle, Gem, BadgeCheck, Building2, ShieldCheck, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import CertificationRequest from '@/components/profile/CertificationRequest';

const BADGE_LEVELS = [
  {
    key: 'verified',
    label: 'Vérifié',
    icon: CheckCircle,
    color: 'text-sky-400',
    colorHex: '#38bdf8',
    border: 'border-sky-400/30',
    bg: 'bg-sky-400/8',
    price: 5,
    priceDesc: '0 profil',
    desc: 'Prouvez que votre identité est réelle',
    perks: [
      'Coche de vérification bleue',
      'Identité confirmée publiquement',
      'Réponses boostées dans le feed',
      'Accès au forum étendu',
      'Badge "Vérifié" sur votre profil',
    ],
  },
  {
    key: 'pro',
    label: 'Pro',
    icon: Gem,
    color: 'text-emerald-400',
    colorHex: '#34d399',
    border: 'border-emerald-400/30',
    bg: 'bg-emerald-400/8',
    price: 10,
    priceDesc: '1 profil',
    desc: 'Montrez que vous exercez à titre professionnel',
    perks: [
      'Coche Pro verte',
      'Profil professionnel mis en avant',
      'Statistiques avancées de vos posts',
      'Mise en avant dans l\'explorateur',
      'Badge animé "Pro" sur votre profil',
    ],
  },
  {
    key: 'certified',
    label: 'Certifié',
    icon: BadgeCheck,
    color: 'text-amber-400',
    colorHex: '#f59e0b',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/8',
    price: 20,
    priceDesc: '4 profils',
    desc: 'Expertise reconnue et références solides',
    popular: true,
    perks: [
      'Coche Certifiée dorée',
      'Expertise validée par notre équipe',
      'Priorité dans les recherches',
      'Accès aux fonctionnalités exclusives',
      'Badge "Certifié" premium sur votre profil',
    ],
  },
  {
    key: 'official',
    label: 'Officiel',
    icon: Building2,
    color: 'text-purple-400',
    colorHex: '#a855f7',
    border: 'border-purple-400/30',
    bg: 'bg-purple-400/8',
    price: 40,
    priceDesc: '2 profils',
    desc: 'Pour les entités, marques ou organisations reconnues',
    perks: [
      'Coche Officielle violette',
      'Entité / marque reconnue officiellement',
      'Support prioritaire dédié',
      'Publications sponsorisées gratuites',
      'Badge "Officiel" exclusif sur votre profil',
    ],
  },
  {
    key: 'supreme',
    label: 'Suprême',
    icon: ShieldCheck,
    color: 'text-yellow-400',
    colorHex: '#f59e0b',
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-400/8',
    price: null,
    priceDesc: 'Invitation uniquement',
    desc: 'Sur invitation uniquement — Le badge le plus rare',
    locked: true,
    perks: [
      'Badge le plus rare de la plateforme',
      'Sur invitation de l\'équipe EZA uniquement',
      'Tous les avantages des niveaux inférieurs',
    ],
  },
];

const PERKS = [
  { icon: Shield, label: 'Identité vérifiée', desc: 'Badge exclusif sur votre profil et vos posts' },
  { icon: TrendingUp, label: 'Boost de visibilité', desc: 'Vos publications apparaissent en priorité' },
  { icon: BarChart2, label: 'Statistiques', desc: 'Suivez vos performances en temps réel' },
  { icon: MessageCircle, label: 'Réponses boostées', desc: 'Remontez dans les fils de discussion' },
  { icon: Megaphone, label: 'Mise en avant', desc: 'Apparaissez dans la section Découverte' },
  { icon: Palette, label: 'Badge animé', desc: 'Profil et badge personnalisés selon votre niveau' },
];

function BadgeCard({ level, onSelect, badgeCounts }) {
  const Icon = level.icon;
  const count = badgeCounts[level.key] || 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-200 ${level.border} ${level.bg} ${level.popular ? 'ring-1 ring-amber-400/30' : ''}`}
    >
      {level.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-grotesk font-bold uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/40">
            ★ Populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${level.border}`}
          style={level.key === 'supreme' ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #f59e0b' } : { background: 'rgba(255,255,255,0.04)' }}>
          <Icon className={`w-5 h-5 ${level.color}`} style={level.key === 'supreme' ? { color: '#fde68a' } : {}} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-grotesk font-bold text-base ${level.color}`}>{level.label}</span>
            <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full text-muted-foreground">
              {count} {count <= 1 ? 'profil' : 'profils'}
            </span>
            {level.price && (
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full border ${level.color} border-current/30 font-bold`}>
                {level.price}€/mois
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="font-inter text-xs text-muted-foreground mb-4 leading-relaxed">{level.desc}</p>

      {/* Perks */}
      <ul className="flex flex-col gap-2 mb-5 flex-1">
        {level.perks.map((perk, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${level.color}`} />
            <span className="font-inter text-xs text-muted-foreground leading-snug">{perk}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {level.locked ? (
        <div className="w-full py-2.5 rounded-xl text-center font-grotesk font-bold text-sm text-muted-foreground border border-white/10 bg-white/3 cursor-not-allowed">
          Sur invitation uniquement
        </div>
      ) : (
        <button
          onClick={() => onSelect(level)}
          className={`w-full py-2.5 rounded-xl font-grotesk font-bold text-sm transition-all duration-200 border ${level.border} ${level.color} hover:bg-white/5`}
        >
          Demander ce badge →
        </button>
      )}
    </div>
  );
}

export default function PremiumPage() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({});

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (ok) setUser(await base44.auth.me());
    });

    base44.entities.User.list().then(users => {
      const counts = { verified: 0, pro: 0, certified: 0, official: 0, supreme: 0 };
      users.forEach(u => {
        if (u.verifications?.includes('verified')) counts.verified++;
        if (u.verifications?.includes('pro')) counts.pro++;
        if (u.verifications?.includes('certified')) counts.certified++;
        if (u.verifications?.includes('official')) counts.official++;
        if (u.verifications?.includes('supreme')) counts.supreme++;
      });
      setBadgeCounts(counts);
    }).catch(() => {});
  }, []);

  const handleSelect = () => {
    if (!user) { window.location.href = '/login'; return; }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-8"
            style={{ background: 'radial-gradient(ellipse, #a855f7 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 border border-primary/30 bg-primary/10">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-grotesk font-black text-4xl md:text-5xl text-white mb-3 leading-tight">
            Demande de <span className="text-primary">vérification</span>
          </h1>
          <p className="font-inter text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Sélectionnez le niveau correspondant à votre profil. Chaque niveau comporte plusieurs étapes de validation.
          </p>
        </div>
      </div>

      {/* Badges grid */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
          {BADGE_LEVELS.map(level => (
            <BadgeCard key={level.key} level={level} onSelect={handleSelect} badgeCounts={badgeCounts} />
          ))}
        </div>

        {/* Perks grid */}
        <div className="mt-14">
          <h2 className="font-grotesk font-bold text-xl text-center text-foreground mb-6">
            Pourquoi se faire vérifier ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PERKS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/6 bg-white/2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-grotesk font-semibold text-sm text-foreground">{p.label}</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40 font-inter mt-10 max-w-xl mx-auto leading-relaxed">
          Les abonnements sont renouvelés automatiquement. Vous pouvez annuler à tout moment depuis votre espace client. En vous abonnant, vous acceptez nos{' '}
          <Link to="/legal/terms" className="underline hover:text-muted-foreground/70">Conditions d'utilisation</Link>.
        </p>
      </div>

      {/* Certification modal */}
      {showModal && user && (
        <CertificationRequest user={user} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}