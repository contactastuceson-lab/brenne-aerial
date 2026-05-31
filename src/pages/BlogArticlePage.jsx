import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Eye, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DEMO_POSTS = [
  { id: 'b1', title: 'Comment choisir votre prestataire drone : 5 critères essentiels', excerpt: 'Certifications DGAC, équipement, expérience, assurance... voici tout ce que vous devez vérifier avant de signer.', category: 'conseil', cover_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 5, views: 1247, created_date: '2024-11-15', content: `## Pourquoi bien choisir son prestataire drone ?

Le marché du drone professionnel s'est considérablement développé ces dernières années. Face à la multitude d'offres, il est essentiel de savoir distinguer un prestataire sérieux d'un amateur mal équipé.

## 1. Les certifications DGAC obligatoires

Tout pilote de drone professionnel doit être titulaire d'une attestation de compétences théoriques (LATP) et d'une déclaration de niveau. Depuis le règlement européen de 2021, les certifications UAS sont également requises selon les catégories de vol.

**Vérifiez impérativement :**
- L'attestation DGAC valide
- L'enregistrement de l'exploitant sur le portail Alphatango
- La qualification STS si applicable

## 2. L'équipement utilisé

La qualité des images dépend directement du matériel. Un drone de consommation ne peut pas rivaliser avec un appareil professionnel 45 mégapixels équipé d'un stabilisateur 3 axes.

## 3. L'expérience et le portfolio

Demandez systématiquement un portfolio de missions similaires à la vôtre. Un prestataire sérieux sera en mesure de vous présenter des références vérifiables.

## 4. L'assurance responsabilité civile

Obligatoire pour tout vol professionnel, l'assurance RC spécifique aux drones doit couvrir les dommages causés à des tiers. Exigez une attestation à jour.

## 5. La réactivité et le suivi

Un bon prestataire drone répond rapidement, établit un devis détaillé et assure un suivi post-mission (livraison des fichiers, retouches si nécessaire).` },
  { id: 'b2', title: 'Inspection de toiture par drone : révolution dans le BTP', excerpt: 'Le drone transforme l\'inspection technique. Plus rapide, moins coûteux, zéro risque pour les techniciens.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 7, views: 892, created_date: '2024-10-28', content: `## L'inspection de toiture traditionnelle : des risques inutiles

Pendant des années, l'inspection de toiture impliquait l'installation d'échafaudages, la montée en hauteur de techniciens, et des risques d'accidents significatifs. Le drone change fondamentalement cette réalité.

## Ce que le drone apporte

**Sécurité absolue :** aucun technicien ne monte sur un toit potentiellement instable.

**Précision centimétrique :** avec un capteur 45MP et un zoom optique x10, chaque fissure, chaque tuile déplacée, chaque joint dégradé est identifiable avec une précision que les jumelles ne peuvent pas égaler.

**Rapidité d'intervention :** une toiture de 300m² peut être inspectée et documentée en moins de 2 heures, rapport illustré inclus.

**Coût réduit :** pas d'échafaudage, pas de nacelle. La réduction des coûts peut atteindre 60% par rapport aux méthodes traditionnelles.

## Le processus en pratique

1. Prise de contact et devis (24h)
2. Mission de vol (1-3h selon surface)
3. Analyse des images et rapport détaillé
4. Remise du rapport illustré avec zones problématiques géolocalisées

## Cas concrets

Nous avons récemment accompagné une copropriété de 48 logements : l'inspection complète des toitures et façades a permis d'identifier 7 zones nécessitant une intervention urgente, évitant des dégâts d'eau majeurs.` },
  { id: 'b3', title: 'Réglementation drone 2024 : ce qui a changé', excerpt: 'La DGAC a mis à jour les règles. Zones interdites, formations obligatoires — faisons le point.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 4, views: 2103, created_date: '2024-10-10', content: `## Le cadre réglementaire européen unifié

Depuis 2021, la réglementation drone en France s'inscrit dans le cadre européen défini par l'EASA. Les anciennes catégories françaises (S1, S2, S3) ont été remplacées par les catégories Ouverte, Spécifique et Certifiée.

## Catégorie Ouverte : le vol loisir et professionnel basique

La catégorie Ouverte concerne les drones de moins de 25kg évoluant à moins de 120m du sol, hors zones sensibles. Elle est divisée en sous-catégories A1, A2 et A3 selon la masse du drone.

## Ce qui change en 2026

À partir de 2026, les drones de classe C5 et C6 deviennent obligatoires pour certains usages professionnels en catégorie Spécifique. Les anciens BAPD ne seront plus valides.

## Les zones interdites à vérifier

Avant chaque vol, consultez la carte Géoportail des restrictions UAS. De nombreuses zones sont permanentes (aérodromes, zones militaires, centrales nucléaires), d'autres temporaires.

## Notre engagement

Chez Brenne Aerial, tous nos pilotes maintiennent leurs certifications à jour et effectuent une vérification systématique des espaces aériens avant chaque mission.` },
  { id: 'b4', title: 'Mariage 2024 : pourquoi la vidéo drone est incontournable', excerpt: 'Un angle unique, des souvenirs inoubliables. Découvrez comment le drone a révolutionné la vidéo mariage.', category: 'projet', cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 3, views: 3421, created_date: '2024-09-22', content: `## Un point de vue que personne d'autre ne peut offrir

Le jour de votre mariage, chaque détail compte. La vidéo drone apporte une dimension cinématographique que ni un caméraman au sol ni un photographe classique ne peut capturer.

## Les plans qui font la différence

**La vue d'ensemble du lieu :** découvrir votre château, mas provençal ou domaine viticole depuis les airs donne immédiatement une dimension spectaculaire à votre film de mariage.

**Les travelling latéraux :** accompagner les mariés dans leur promenade depuis les airs crée des plans d'une douceur incomparable.

**Les plans de révélation :** partir d'un plan serré pour révéler progressivement le cadre entier — une signature visuelle mémorable.

## Ce que nos clients disent

*"On a montré la vidéo à nos invités 6 mois après, ils étaient encore bouche bée devant les plans aériens du château."* — Marie & Thomas, mariés en Indre-et-Loire.

## Organisation pratique

Pour un mariage, nous recommandons de réserver au minimum 3 mois à l'avance. Nous travaillons en coordination avec votre vidéaste principal pour créer un film cohérent et homogène.` },
  { id: 'b5', title: 'Suivi de chantier aérien : ROI et bonnes pratiques', excerpt: 'Comment nos clients BTP ont réduit leurs coûts de 15% grâce au monitoring drone hebdomadaire.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 6, views: 678, created_date: '2024-09-05', content: `## Le défi du suivi de chantier classique

Les conducteurs de travaux passent en moyenne 30% de leur temps à effectuer des relevés manuels, des comptes-rendus photographiques et des constats d'avancement. Le drone rationalise tout cela.

## Orthophotographie et modélisation 3D

Avec des vols réguliers (hebdomadaires ou mensuels selon les besoins), nous produisons :

- Des **orthophotos** précises à 2cm/pixel du site
- Des **modèles 3D** de l'évolution du chantier
- Des **métrés volumétriques** automatisés (terrassement, remblais)
- Des **comparaisons temporelles** pour visualiser l'avancement

## Le ROI en chiffres

Un de nos clients, constructeur de maisons individuelles avec 12 chantiers simultanés, a mesuré :
- **-15% de coûts** liés aux déplacements de contrôle
- **-40% de temps** consacré aux reportings photos
- **Détection précoce** de 3 non-conformités évitant des reprises coûteuses

## Mise en place

Le déploiement est rapide : après un premier vol de calibration, le système de monitoring est opérationnel en moins d'une semaine. Les données sont accessibles via une plateforme en ligne sécurisée.` },
  { id: 'b6', title: 'Formation pilote drone : notre centre ouvre en 2025', excerpt: 'Grande annonce : Brenne Aerial lance son centre de formation certifié. Tout ce que vous devez savoir.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85', author: 'Enor Lefoulon Meyer', reading_time: 4, views: 4892, created_date: '2024-08-18', content: `## Une nouvelle étape pour Brenne Aerial

Après 4 ans d'activité opérationnelle et plus de 500 missions réalisées, Brenne Aerial franchit une nouvelle étape : l'ouverture d'un centre de formation certifié pour pilotes de drones professionnels.

## Les formations proposées

**Formation A1/A3 (Catégorie Ouverte) :**
Idéale pour les débutants souhaitant piloter légalement des drones de loisir ou débuter une activité professionnelle légère. Durée : 1 jour.

**Formation A2 (Catégorie Ouverte avancée) :**
Pour les pilotes souhaitant voler à proximité des personnes. Comprend une partie pratique obligatoire. Durée : 2 jours.

**Qualification STS (Catégorie Spécifique) :**
Formation complète pour les professionnels exerçant en zones peuplées ou pour des missions complexes. Durée : 5 jours.

## Notre approche pédagogique

Nos formateurs sont tous des pilotes professionnels actifs. Les formations combinent théorie (réglementation, météorologie, gestion des risques) et pratique intensive sur le terrain.

## Calendrier et tarifs

Les premières sessions débutent au printemps 2025. Les inscriptions sont ouvertes. Contactez-nous pour recevoir le programme complet et les tarifs.` },
];

const CAT_COLORS = {
  actualite: 'text-primary bg-primary/10 border-primary/20',
  conseil: 'text-accent bg-accent/10 border-accent/20',
  technique: 'text-chart-5 bg-chart-5/10 border-chart-5/20',
  projet: 'text-green-400 bg-green-400/10 border-green-400/20',
  formation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function BlogArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: dbPost } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      try {
        const posts = await base44.entities.BlogPost.filter({ is_published: true });
        return posts.find(p => p.id === id) || null;
      } catch {
        return null;
      }
    },
  });

  const post = dbPost || DEMO_POSTS.find(p => p.id === id);

  if (!post) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-5">
        <p className="font-grotesk font-bold text-2xl">Article introuvable</p>
        <Link to="/blog" className="font-inter text-sm text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen pb-20">
      {/* Cover */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.55) saturate(0.8)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 lg:px-10 pb-8 max-w-4xl mx-auto">
          <span className={`inline-block font-mono text-[10px] px-2.5 py-1 rounded-full border mb-3 ${CAT_COLORS[post.category] || 'text-muted-foreground bg-muted border-border'}`}>
            {post.category}
          </span>
          <h1 className="font-grotesk font-bold text-2xl sm:text-4xl text-white leading-tight">{post.title}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-10">
        {/* Back + meta */}
        <div className="flex items-center justify-between py-5 border-b border-border mb-8">
          <button onClick={() => navigate('/blog')} className="flex items-center gap-1.5 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </button>
          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
            {post.reading_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min</span>}
            {post.views && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views} vues</span>}
            {post.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>}
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8 italic border-l-2 border-primary pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {post.content ? (
            <ReactMarkdown
              className="prose prose-invert prose-sm max-w-none font-inter
                prose-headings:font-grotesk prose-headings:font-bold
                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-foreground
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-foreground prose-strong:font-semibold
                prose-li:text-muted-foreground prose-li:leading-relaxed
                prose-ul:my-4 prose-ol:my-4
                prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:italic"
            >
              {post.content}
            </ReactMarkdown>
          ) : (
            <p className="font-inter text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}
        </motion.div>

        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="font-inter text-sm text-muted-foreground mb-4">Vous avez des questions sur nos prestations ?</p>
          <Link to="/quote" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-grotesk font-semibold text-sm hover:bg-primary/90 transition-colors">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}