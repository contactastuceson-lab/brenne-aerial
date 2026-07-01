import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown, Star, Shield, TrendingUp, MessageCircle, BarChart2, Megaphone, Palette, ChevronRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PLANS = {
  monthly: [
    {
      id: 'essential',
      name: 'Essentiel',
      badge: null,
      price: 4.99,
      oldPrice: null,
      color: 'sky',
      colorClass: 'text-sky-400',
      borderClass: 'border-sky-500/50',
      bgClass: 'bg-sky-500/5',
      glowClass: 'shadow-sky-500/10',
      icon: Shield,
      features: [
        { text: 'Coche de vérification EZA', highlight: true },
        { text: 'Moins de publicités dans votre fil' },
        { text: 'Réponses boostées dans le feed' },
        { text: 'Accès au forum étendu' },
        { text: 'Badge "Essentiel" sur votre profil' },
      ],
      cta: 'Commencer',
    },
    {
      id: 'premium',
      name: 'Premium',
      badge: 'Populaire',
      price: 9.99,
      oldPrice: null,
      color: 'cyan',
      colorClass: 'text-cyan-400',
      borderClass: 'border-cyan-400/70',
      bgClass: 'bg-cyan-400/5',
      glowClass: 'shadow-cyan-400/20',
      icon: Sparkles,
      popular: true,
      features: [
        { text: 'Coche Premium dorée', highlight: true },
        { text: 'Aucune publicité dans votre fil', highlight: true },
        { text: 'Statistiques avancées de vos posts' },
        { text: 'Boostage maximal des réponses' },
        { text: 'Rédaction d\'articles longs' },
        { text: 'Mise en avant dans l\'explorateur' },
        { text: 'Badge "Premium" animé sur votre profil' },
        { text: 'Tous les avantages Essentiel' },
      ],
      cta: 'Passer Premium',
    },
    {
      id: 'elite',
      name: 'Élite',
      badge: 'Nouveau',
      price: 19.99,
      oldPrice: null,
      color: 'amber',
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-400/60',
      bgClass: 'bg-amber-400/5',
      glowClass: 'shadow-amber-400/15',
      icon: Crown,
      features: [
        { text: 'Coche Élite exclusive ✦', highlight: true },
        { text: 'Priorité absolue dans les recherches', highlight: true },
        { text: 'IA Aria illimitée (résumés, rédaction)' },
        { text: 'Analyse d\'audience complète' },
        { text: 'Publications sponsorisées gratuites (2/mois)' },
        { text: 'Accès bêta aux nouvelles fonctionnalités' },
        { text: 'Support prioritaire 24h' },
        { text: 'Badge animé "Élite" + couronne sur profil' },
        { text: 'Tous les avantages Premium' },
      ],
      cta: 'Devenir Élite',
    },
  ],
  yearly: [
    {
      id: 'essential',
      name: 'Essentiel',
      badge: '2 mois offerts',
      price: 3.99,
      oldPrice: 4.99,
      color: 'sky',
      colorClass: 'text-sky-400',
      borderClass: 'border-sky-500/50',
      bgClass: 'bg-sky-500/5',
      glowClass: 'shadow-sky-500/10',
      icon: Shield,
      features: [
        { text: 'Coche de vérification EZA', highlight: true },
        { text: 'Moins de publicités dans votre fil' },
        { text: 'Réponses boostées dans le feed' },
        { text: 'Accès au forum étendu' },
        { text: 'Badge "Essentiel" sur votre profil' },
      ],
      cta: 'Commencer',
    },
    {
      id: 'premium',
      name: 'Premium',
      badge: '2 mois offerts',
      price: 7.99,
      oldPrice: 9.99,
      color: 'cyan',
      colorClass: 'text-cyan-400',
      borderClass: 'border-cyan-400/70',
      bgClass: 'bg-cyan-400/5',
      glowClass: 'shadow-cyan-400/20',
      icon: Sparkles,
      popular: true,
      features: [
        { text: 'Coche Premium dorée', highlight: true },
        { text: 'Aucune publicité dans votre fil', highlight: true },
        { text: 'Statistiques avancées de vos posts' },
        { text: 'Boostage maximal des réponses' },
        { text: 'Rédaction d\'articles longs' },
        { text: 'Mise en avant dans l\'explorateur' },
        { text: 'Badge "Premium" animé sur votre profil' },
        { text: 'Tous les avantages Essentiel' },
      ],
      cta: 'Passer Premium',
    },
    {
      id: 'elite',
      name: 'Élite',
      badge: '2 mois offerts',
      price: 15.99,
      oldPrice: 19.99,
      color: 'amber',
      colorClass: 'text-amber-400',
      borderClass: 'border-amber-400/60',
      bgClass: 'bg-amber-400/5',
      glowClass: 'shadow-amber-400/15',
      icon: Crown,
      features: [
        { text: 'Coche Élite exclusive ✦', highlight: true },
        { text: 'Priorité absolue dans les recherches', highlight: true },
        { text: 'IA Aria illimitée (résumés, rédaction)' },
        { text: 'Analyse d\'audience complète' },
        { text: 'Publications sponsorisées gratuites (2/mois)' },
        { text: 'Accès bêta aux nouvelles fonctionnalités' },
        { text: 'Support prioritaire 24h' },
        { text: 'Badge animé "Élite" + couronne sur profil' },
        { text: 'Tous les avantages Premium' },
      ],
      cta: 'Devenir Élite',
    },
  ],
};

const PERKS = [
  { icon: Shield, label: 'Coche vérifiée', desc: 'Badge exclusif sur votre profil et vos posts' },
  { icon: TrendingUp, label: 'Boost de visibilité', desc: 'Vos publications apparaissent en priorité' },
  { icon: BarChart2, label: 'Statistiques', desc: 'Suivez vos performances en temps réel' },
  { icon: MessageCircle, label: 'Réponses boostées', desc: 'Remontez dans les fils de discussion' },
  { icon: Megaphone, label: 'Moins de pubs', desc: 'Fil d\'actualité épuré' },
  { icon: Palette, label: 'Personnalisation', desc: 'Profil et badge personnalisables' },
];

function PlanCard({ plan, billing, onSelect }) {
  const Icon = plan.icon;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${plan.borderClass} ${plan.bgClass} ${plan.popular ? `shadow-xl ${plan.glowClass}` : ''}`}
      style={{ background: plan.popular ? undefined : 'rgba(255,255,255,0.02)' }}
    >
      {/* Popular ribbon */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className={`px-4 py-1 rounded-full text-[11px] font-grotesk font-bold uppercase tracking-widest ${plan.colorClass} bg-cyan-400/15 border border-cyan-400/40`}>
            ★ Populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-current/10 border ${plan.borderClass}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Icon className={`w-4 h-4 ${plan.colorClass}`} />
            </div>
            <span className={`font-grotesk font-bold text-lg ${plan.colorClass}`}>{plan.name}</span>
          </div>
          {plan.badge && (
            <span className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${plan.colorClass} border-current/30 bg-current/10`} style={{ color: undefined }}>
              {plan.badge}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5">
          {plan.oldPrice && (
            <span className="text-muted-foreground/50 line-through text-sm font-mono">{plan.oldPrice}€</span>
          )}
          <span className="font-grotesk font-black text-4xl text-foreground">{plan.price}€</span>
          <span className="text-muted-foreground text-sm font-inter">/ mois</span>
        </div>
        {billing === 'yearly' && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-inter">facturé annuellement</p>
        )}
      </div>

      {/* Features */}
      <ul className="flex flex-col gap-2.5 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${f.highlight ? `${plan.bgClass} border ${plan.borderClass}` : 'bg-white/5'}`}>
              <Check className={`w-2.5 h-2.5 ${f.highlight ? plan.colorClass : 'text-muted-foreground/60'}`} />
            </div>
            <span className={`text-sm font-inter leading-snug ${f.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-xl font-grotesk font-bold text-sm transition-all duration-200 ${
          plan.popular
            ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-lg shadow-cyan-400/25'
            : `border ${plan.borderClass} ${plan.colorClass} hover:bg-white/5`
        }`}
      >
        {plan.cta} →
      </button>
    </div>
  );
}

export default function PremiumPage() {
  const [billing, setBilling] = useState('monthly');
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      if (ok) setUser(await base44.auth.me());
    });
  }, []);

  const plans = PLANS[billing];

  const handleSelect = (plan) => {
    setSelected(plan);
    // Redirect to certification payment or billing flow
    // For now show a toast-like action
    alert(`Abonnement ${plan.name} (${plan.price}€/mois) — intégration paiement Stripe à connecter.`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #22d3ee 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 border border-cyan-400/30 bg-cyan-400/10">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="font-grotesk font-black text-4xl md:text-5xl text-white mb-3 leading-tight">
            EZA <span className="text-cyan-400">Premium</span>
          </h1>
          <p className="font-inter text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Obtenez votre coche de vérification, boostez votre visibilité et accédez à des fonctionnalités exclusives.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-grotesk font-semibold transition-all ${
                billing === 'monthly' ? 'bg-white text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-grotesk font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-white text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annuel
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/15 border border-cyan-400/30 px-1.5 py-0.5 rounded-full">
                −20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={handleSelect} />
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-grotesk font-bold text-sm text-foreground">Vous avez une organisation ?</p>
              <p className="font-inter text-xs text-muted-foreground">Gagnez en crédibilité et boostez votre visibilité avec EZA Business.</p>
            </div>
          </div>
          <Link to="/business">
            <button className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-400 font-grotesk font-semibold text-sm hover:bg-amber-400/25 transition-all whitespace-nowrap">
              Découvrir EZA Business →
            </button>
          </Link>
        </div>

        {/* Perks grid */}
        <div className="mt-12">
          <h2 className="font-grotesk font-bold text-xl text-center text-foreground mb-6">
            Pourquoi passer Premium ?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PERKS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-white/6 bg-white/2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-cyan-400" />
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

        {/* FAQ / Legal */}
        <p className="text-center text-[11px] text-muted-foreground/40 font-inter mt-10 max-w-xl mx-auto leading-relaxed">
          Les abonnements sont renouvelés automatiquement. Vous pouvez annuler à tout moment depuis votre espace client. En vous abonnant, vous acceptez nos{' '}
          <Link to="/legal/terms" className="underline hover:text-muted-foreground/70">Conditions d'utilisation</Link>.
        </p>
      </div>
    </div>
  );
}