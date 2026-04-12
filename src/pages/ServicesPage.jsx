import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Building2, HardHat, Camera, Briefcase, Wifi, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatPrice, SERVICE_PRICES } from '@/lib/droneUtils';

const ICON_MAP = {
  Video, Building2, HardHat, Camera, Briefcase, Wifi,
};

const SERVICE_DESCRIPTIONS = {
  video_evenement: { tagline: 'Captez chaque instant depuis les airs', desc: "Mariages, concerts, festivals, compétitions sportives — faites vivre vos événements avec des prises de vue aériennes spectaculaires en 4K. Chaque moment devient une œuvre cinématographique.", features: ['Vidéo 4K Ultra HD', 'Stabilisation 3 axes', 'Montage professionnel', 'Livraison sous 48h', 'Photos aériennes incluses'], color: 'text-primary', icon: 'Video', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=70' },
  inspection_toiture: { tagline: 'Diagnostic précis, zéro risque', desc: "Évaluez l'état de vos toitures, cheminées, façades et structures en hauteur sans échafaudage ni intervention risquée. Images haute résolution et rapport technique complet.", features: ['Caméra thermique optionnel', 'Images 48 MP', 'Rapport PDF détaillé', 'Géolocalisation des défauts', 'Sans interruption d\'activité'], color: 'text-accent', icon: 'Building2', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=70' },
  suivi_chantier: { tagline: "L'œil aérien de votre chantier", desc: "Monitoring continu de l'avancement de vos projets de construction. Cartographie 3D, modélisation numérique et rapports périodiques pour une gestion optimale.", features: ['Modélisation 3D', 'Cartographie précise', 'Rapports hebdomadaires', 'Comparatif d\'avancement', 'Intégration BIM'], color: 'text-chart-5', icon: 'HardHat', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=70' },
  captation_particulier: { tagline: 'Vos souvenirs vus du ciel', desc: "Propriétés, portraits, anniversaires, aventures — immortalisez vos moments de vie avec une perspective unique. Un regard aérien personnel et authentique.", features: ['Photos & vidéo 4K', 'Retouche incluse', 'Galerie privée en ligne', 'Droits d\'utilisation', 'Tarifs accessibles'], color: 'text-green-400', icon: 'Camera', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop&q=70' },
  captation_entreprise: { tagline: 'Valorisez votre image de marque', desc: "Clips institutionnels, présentations immobilières, vidéos marketing — donnez une dimension aérienne exceptionnelle à votre communication d'entreprise.", features: ['Brief personnalisé', 'Script & storyboard', 'Tournage multi-jours', 'Post-production avancée', 'Formats multi-plateformes'], color: 'text-primary', icon: 'Briefcase', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=70' },
  retour_temps_reel: { tagline: 'Opérations critiques en live', desc: "Diffusion vidéo en direct depuis le drone vers vos équipes au sol ou en salle de crise. Parfait pour la sécurité, la gestion d'événements et les opérations industrielles.", features: ['Latence < 100ms', 'Cryptage sécurisé', 'Multi-récepteurs', 'Intégration streaming', 'Support 24/7 on-site'], color: 'text-destructive', icon: 'Wifi', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=70' },
  photogrammetrie_3d: { tagline: 'Modélisation numérique précise', desc: "Créez des modèles 3D détaillés par photogramm métrie aérienne. Parfait pour la documentation, la conservation du patrimoine et les projets d'architecture.", features: ['Nuages de points HD', 'Maillage 3D haute précision', 'Ortho-mosaïques', 'Rapport de mesure', 'Export multi-formats'], color: 'text-primary', icon: 'Building2', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=70' },
  cartographie_releves: { tagline: 'Cartographie aérienne topographique', desc: "Cartes précises géoréférencées et relevés topographiques pour vos projets d'aménagement, d'études d'impact et de planification urbaine.", features: ['Cartes géoréférencées', 'Relevés précis', 'Plans topographiques', 'Intégration SIG', 'Certification RTK'], color: 'text-chart-5', icon: 'HardHat', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=70' },
  thermographie: { tagline: 'Inspection thermique aérienne', desc: "Détectez les déperditions énergétiques, diagnostiquez les problèmes mécaniques et inspectez les installations électriques sans contact.", features: ['Caméra thermique 640x512', 'Analyse radiométrique', 'Rapports d\'anomalie', 'Haute précision', 'Industries variées'], color: 'text-destructive', icon: 'Camera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=70' },
  surveillance: { tagline: 'Couverture aérienne continue', desc: "Surveillance de sites sensibles, gardiennage aérien et monitoring de zones étendues. Dissuasion efficace et documentation en temps réel.", features: ['Couverture 24/7', 'Alertes temps réel', 'Archivage sécurisé', 'Intégration CMS', 'Intervention rapide'], color: 'text-destructive', icon: 'Video', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=70' },
  contenu_social: { tagline: 'Vidéos créatives pour vos plateformes', desc: "Reels, shorts, TikToks avec perspective aérienne. Contenu viral et engageant pour amplifier votre présence sur les réseaux.", features: ['Format verticaux/horizontaux', 'Effets & transitions', 'Musique & colorisation', 'Optimisation SEO', 'Multi-plateforme'], color: 'text-primary', icon: 'Video', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=70' },
  reportage: { tagline: 'Contenu documentaire professionnel', desc: "Reportages aériens, documentaires et contenus éditoriaux avec production cinématographique complète. Narration, montage et post-production avancés.", features: ['Production complète', 'Narration professionnelle', 'Montage cinéma', 'Étalonnage couleur', 'Master DCI 4K'], color: 'text-accent', icon: 'Video', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=70' },
  mariage_aero: { tagline: 'Photos aériennes d\'amour', desc: "Captez votre plus beau jour depuis le ciel. Photos aériennes romantiques et vidéo cinématographique pour vos plus beaux souvenirs.", features: ['Séance d\'une journée', 'Photos retouchées', 'Album numérique', 'Diaporama musical', 'Tirage premium'], color: 'text-green-400', icon: 'Camera', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=70' },
  immobilier_virtuelle: { tagline: 'Tour 360° de vos propriétés', desc: "Visite virtuelle immersive 360° de vos biens immobiliers. Décuplé la visibilité et facilitez les visites à distance.", features: ['Visite 360° complète', 'Navigation fluide', 'Géolocalisation', 'Intégration portails', 'Multidevices'], color: 'text-primary', icon: 'Building2', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop&q=70' },
  agriculture: { tagline: 'Monitoring aérien agricole intelligent', desc: "Surveillance de cultures, détection de maladies, cartographie d'irrigation. Optimisez vos rendements avec l'analyse aérienne.", features: ['Imagerie multispectrale', 'Indices NDVI', 'Cartographie d\'humidité', 'Alertes anomalies', 'Rapports agronomes'], color: 'text-chart-5', icon: 'HardHat', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=70' },
};

export default function ServicesPage() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'order'),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          {services.map((svc, i) => {
            const desc = SERVICE_DESCRIPTIONS[svc.slug];
            const Icon = ICON_MAP[desc?.icon];
            const price = { base: svc.base_price, per_hour: svc.price_per_hour };
            return (
              <motion.div key={svc.key}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border bg-card ${
                  i % 2 !== 0 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <img src={desc?.image} alt={svc.name}
                    className="w-full h-full object-cover min-h-[250px] lg:min-h-0"
                    style={{ filter: 'brightness(0.7) contrast(1.1) saturate(0.8)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent lg:bg-gradient-to-r lg:from-card/40 lg:to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className={`inline-flex items-center gap-2 font-mono text-xs border rounded-full px-3 py-1 bg-background/60 backdrop-blur-sm ${desc?.color} border-current/30`}>
                      <Icon className="w-3 h-3" />
                      {svc.name}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-8 lg:p-12 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <Icon className={`w-8 h-8 ${desc?.color} mb-4`} />
                  <p className="font-mono text-xs text-muted-foreground mb-2">{desc?.tagline}</p>
                  <h3 className="font-grotesk font-bold text-2xl mb-4">{svc.name}</h3>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-6">{desc?.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {desc?.features.map(f => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-inter text-xs text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">À partir de</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-grotesk font-bold text-xl text-primary">{formatPrice(price?.base || 0)}</p>
                        <span className="font-mono text-[10px] px-2 py-1 rounded-full bg-chart-5/10 text-chart-5 font-semibold">Bientôt</span>
                      </div>
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