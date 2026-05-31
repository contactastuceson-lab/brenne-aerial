import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Eye, User, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DEMO_POSTS = [
  { id: 'b1', title: 'Comment choisir votre prestataire drone : 5 critères essentiels', excerpt: 'Certifications DGAC, équipement, expérience, assurance... voici tout ce que vous devez vérifier avant de signer.', category: 'conseil', cover_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 1247, created_date: '2024-11-15', content: `## Pourquoi bien choisir son prestataire drone ?

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
  { id: 'b2', title: 'Inspection de toiture par drone : révolution dans le BTP', excerpt: 'Le drone transforme l\'inspection technique. Plus rapide, moins coûteux, zéro risque pour les techniciens.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 892, created_date: '2024-10-28', content: `## L'inspection de toiture traditionnelle : des risques inutiles

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
  { id: 'b3', title: 'Réglementation drone 2024 : ce qui a changé', excerpt: 'La DGAC a mis à jour les règles. Zones interdites, formations obligatoires — faisons le point.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 2103, created_date: '2024-10-10', content: `## Le cadre réglementaire européen unifié

Depuis 2021, la réglementation drone en France s'inscrit dans le cadre européen défini par l'EASA. Les anciennes catégories françaises (S1, S2, S3) ont été remplacées par les catégories Ouverte, Spécifique et Certifiée.

## Catégorie Ouverte : le vol loisir et professionnel basique

La catégorie Ouverte concerne les drones de moins de 25kg évoluant à moins de 120m du sol, hors zones sensibles. Elle est divisée en sous-catégories A1, A2 et A3 selon la masse du drone.

## Ce qui change en 2026

À partir de 2026, les drones de classe C5 et C6 deviennent obligatoires pour certains usages professionnels en catégorie Spécifique. Les anciens BAPD ne seront plus valides.

## Les zones interdites à vérifier

Avant chaque vol, consultez la carte Géoportail des restrictions UAS. De nombreuses zones sont permanentes (aérodromes, zones militaires, centrales nucléaires), d'autres temporaires.

## Notre engagement

Chez Brenne Aerial, tous nos pilotes maintiennent leurs certifications à jour et effectuent une vérification systématique des espaces aériens avant chaque mission.` },
  { id: 'b4', title: 'Mariage 2024 : pourquoi la vidéo drone est incontournable', excerpt: 'Un angle unique, des souvenirs inoubliables. Découvrez comment le drone a révolutionné la vidéo mariage.', category: 'projet', cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 3421, created_date: '2024-09-22', content: `## Un point de vue que personne d'autre ne peut offrir

Le jour de votre mariage, chaque détail compte. La vidéo drone apporte une dimension cinématographique que ni un caméraman au sol ni un photographe classique ne peut capturer.

## Les plans qui font la différence

**La vue d'ensemble du lieu :** découvrir votre château, mas provençal ou domaine viticole depuis les airs donne immédiatement une dimension spectaculaire à votre film de mariage.

**Les travelling latéraux :** accompagner les mariés dans leur promenade depuis les airs crée des plans d'une douceur incomparable.

**Les plans de révélation :** partir d'un plan serré pour révéler progressivement le cadre entier — une signature visuelle mémorable.

## Ce que nos clients disent

*"On a montré la vidéo à nos invités 6 mois après, ils étaient encore bouche bée devant les plans aériens du château."* — Marie & Thomas, mariés en Indre-et-Loire.

## Organisation pratique

Pour un mariage, nous recommandons de réserver au minimum 3 mois à l'avance. Nous travaillons en coordination avec votre vidéaste principal pour créer un film cohérent et homogène.` },
  { id: 'b5', title: 'Suivi de chantier aérien : ROI et bonnes pratiques', excerpt: 'Comment nos clients BTP ont réduit leurs coûts de 15% grâce au monitoring drone hebdomadaire.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 678, created_date: '2024-09-05', content: `## Le défi du suivi de chantier classique

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
  { id: 'b6', title: 'Formation pilote drone : notre centre ouvre en 2025', excerpt: 'Grande annonce : Brenne Aerial lance son centre de formation certifié. Tout ce que vous devez savoir.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85', author: 'Enor Lefoulon Meyer', views: 4892, created_date: '2024-08-18', content: `## Une nouvelle étape pour Brenne Aerial

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

const CAT_CONFIG = {
  actualite: { label: 'Actualité', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  conseil:   { label: 'Conseil',   color: 'text-accent',  bg: 'bg-accent/10',  border: 'border-accent/25'  },
  technique: { label: 'Technique', color: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/25' },
  projet:    { label: 'Projet',    color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/25' },
  formation: { label: 'Formation', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25' },
};

function computeReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Custom renderers for beautiful reading experience
const MarkdownComponents = {
  h2: ({ children }) => (
    <h2 className="font-grotesk font-bold text-2xl text-foreground mt-12 mb-5 pb-3 border-b border-border/50 leading-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-grotesk font-semibold text-lg text-foreground mt-8 mb-3 leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-inter text-base text-foreground/80 leading-[1.85] mb-5">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="my-5 space-y-2 pl-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 space-y-2 pl-0 list-none counter-reset-[item]">{children}</ol>
  ),
  li: ({ children, ordered }) => (
    <li className="flex items-start gap-3 font-inter text-base text-foreground/80 leading-relaxed">
      <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-5 py-1 border-l-[3px] border-primary bg-primary/5 rounded-r-lg">
      <div className="font-inter text-base italic text-muted-foreground leading-relaxed">{children}</div>
    </blockquote>
  ),
  code: ({ children, inline }) => inline ? (
    <code className="font-mono text-sm bg-muted text-primary px-1.5 py-0.5 rounded">{children}</code>
  ) : (
    <pre className="bg-muted rounded-xl p-4 overflow-x-auto my-5">
      <code className="font-mono text-sm text-foreground/80">{children}</code>
    </pre>
  ),
  hr: () => <hr className="my-10 border-border/40" />,
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
  const readingTime = useMemo(() => computeReadingTime(post?.content), [post?.content]);
  const cat = CAT_CONFIG[post?.category] || { label: post?.category, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };

  if (!post) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-5">
        <p className="font-grotesk font-bold text-2xl">Article introuvable</p>
        <Link to="/blog" className="font-inter text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Hero cover ── */}
      <div className="relative h-[55vh] min-h-[360px] max-h-[520px] overflow-hidden">
        <img
          src={post.cover_url}
          alt={post.title}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.45) saturate(0.7)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Back nav — top left */}
        <div className="absolute top-0 left-0 right-0 pt-24 px-5 lg:px-10 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 font-inter text-xs text-white/70 hover:text-white transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au blog
          </button>
        </div>

        {/* Title area — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 lg:px-10 pb-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className={`inline-flex items-center font-mono text-[11px] font-medium px-3 py-1 rounded-full border mb-4 ${cat.color} ${cat.bg} ${cat.border}`}>
              {cat.label}
            </span>
            <h1 className="font-grotesk font-bold text-3xl sm:text-[2.4rem] text-white leading-[1.2] max-w-2xl" style={{ textWrap: 'balance' }}>
              {post.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Meta bar ── */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-5 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="font-inter text-xs text-foreground/70">{post.author}</span>
              </div>
            )}
            {post.created_date && (
              <span className="font-inter text-xs text-muted-foreground hidden sm:block">
                {formatDate(post.created_date)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} min de lecture
            </span>
            {post.views && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {post.views.toLocaleString('fr-FR')} vues
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-5 lg:px-10 pt-10">

        {/* Lead / excerpt */}
        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-inter text-xl text-foreground/60 leading-[1.7] mb-10 font-light"
            style={{ textWrap: 'pretty' }}
          >
            {post.excerpt}
          </motion.p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-border/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="h-px flex-1 bg-border/40" />
        </div>

        {/* Markdown content */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {post.content ? (
            <ReactMarkdown components={MarkdownComponents}>
              {post.content}
            </ReactMarkdown>
          ) : (
            <p className="font-inter text-base text-foreground/80 leading-[1.85]">{post.excerpt}</p>
          )}
        </motion.article>

        {/* ── Footer CTA ── */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="font-grotesk font-bold text-lg text-foreground mb-1">
            Une mission en tête ?
          </p>
          <p className="font-inter text-sm text-muted-foreground mb-6">
            Brenne Aerial intervient sur toute la France. Devis gratuit sous 24h.
          </p>
          <Link
            to="/quote"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-grotesk font-semibold text-sm hover:bg-primary/90 transition-colors duration-150 cursor-pointer"
          >
            Demander un devis gratuit <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Tous les articles
          </button>
        </div>
      </div>
    </div>
  );
}