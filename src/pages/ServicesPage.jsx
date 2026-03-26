import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Building2, HardHat, Camera, Briefcase, Wifi, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, SERVICE_PRICES } from '@/lib/droneUtils';

const SERVICES = [
  {
    key: 'video_evenement', icon: Video, color: 'text-primary',
    title: 'Vidéo événement',
    tagline: 'Captez chaque instant depuis les airs',
    desc: "Mariages, concerts, festivals, compétitions sportives — faites vivre vos événements avec des prises de vue aériennes spectaculaires en 4K. Chaque moment devient une œuvre cinématographique.",
    features: ['Vidéo 4K Ultra HD', 'Stabilisation 3 axes', 'Montage professionnel', 'Livraison sous 48h', 'Photos aériennes incluses'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'inspection_toiture', icon: Building2, color: 'text-accent',
    title: 'Inspection toiture',
    tagline: 'Diagnostic précis, zéro risque',
    desc: "Évaluez l'état de vos toitures, cheminées, façades et structures en hauteur sans échafaudage ni intervention risquée. Images haute résolution et rapport technique complet.",
    features: ['Caméra thermique optionnel', 'Images 48 MP', 'Rapport PDF détaillé', 'Géolocalisation des défauts', 'Sans interruption d\'activité'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'suivi_chantier', icon: HardHat, color: 'text-chart-5',
    title: 'Suivi de chantier',
    tagline: "L'œil aérien de votre chantier",
    desc: "Monitoring continu de l'avancement de vos projets de construction. Cartographie 3D, modélisation numérique et rapports périodiques pour une gestion optimale.",
    features: ['Modélisation 3D', 'Cartographie précise', 'Rapports hebdomadaires', 'Comparatif d\'avancement', 'Intégration BIM'],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'captation_particulier', icon: Camera, color: 'text-green-400',
    title: 'Captation particulier',
    tagline: 'Vos souvenirs vus du ciel',
    desc: "Propriétés, portraits, anniversaires, aventures — immortalisez vos moments de vie avec une perspective unique. Un regard aérien personnel et authentique.",
    features: ['Photos & vidéo 4K', 'Retouche incluse', 'Galerie privée en ligne', 'Droits d\'utilisation', 'Tarifs accessibles'],
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'captation_entreprise', icon: Briefcase, color: 'text-primary',
    title: 'Captation entreprise',
    tagline: 'Valorisez votre image de marque',
    desc: "Clips institutionnels, présentations immobilières, vidéos marketing — donnez une dimension aérienne exceptionnelle à votre communication d'entreprise.",
    features: ['Brief personnalisé', 'Script & storyboard', 'Tournage multi-jours', 'Post-production avancée', 'Formats multi-plateformes'],
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'retour_temps_reel', icon: Wifi, color: 'text-destructive',
    title: 'Retour temps réel',
    tagline: 'Opérations critiques en live',
    desc: "Diffusion vidéo en direct depuis le drone vers vos équipes au sol ou en salle de crise. Parfait pour la sécurité, la gestion d'événements et les opérations industrielles.",
    features: ['Latence < 100ms', 'Cryptage sécurisé', 'Multi-récepteurs', 'Intégration streaming', 'Support 24/7 on-site'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=70',
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-32 px-5 lg:px-10 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Nos services</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-4">
              Solutions <span className="gradient-text">drone</span><br />professionnelles
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-xl mx-auto">
              De l'inspection technique à la captation cinématographique — six prestations premium 
              pour répondre à tous vos besoins aériens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="px-5 lg:px-10 max-w-7xl mx-auto pb-24">
        <div className="space-y-8">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            const price = SERVICE_PRICES[svc.key];
            return (
              <motion.div key={svc.key}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border bg-card ${
                  i % 2 !== 0 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <img src={svc.image} alt={svc.title}
                    className="w-full h-full object-cover min-h-[250px] lg:min-h-0"
                    style={{ filter: 'brightness(0.7) contrast(1.1) saturate(0.8)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent lg:bg-gradient-to-r lg:from-card/40 lg:to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className={`inline-flex items-center gap-2 font-mono text-xs border rounded-full px-3 py-1 bg-background/60 backdrop-blur-sm ${svc.color} border-current/30`}>
                      <Icon className="w-3 h-3" />
                      {svc.title}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-8 lg:p-12 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <Icon className={`w-8 h-8 ${svc.color} mb-4`} />
                  <p className="font-mono text-xs text-muted-foreground mb-2">{svc.tagline}</p>
                  <h3 className="font-grotesk font-bold text-2xl mb-4">{svc.title}</h3>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-6">{svc.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {svc.features.map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-inter text-xs text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">À partir de</p>
                      <p className="font-grotesk font-bold text-xl text-primary">{formatPrice(price.base)}</p>
                    </div>
                    <Link to="/quote">
                      <Button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-grotesk font-semibold">
                        Devis <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}