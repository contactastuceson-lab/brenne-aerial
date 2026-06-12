import React from 'react';
import { motion } from 'framer-motion';
import { Music, Plane, Code, Award, Calendar } from 'lucide-react';

export default function EnorBiographyPage() {
  const sections = [
    {
      title: 'Biographie',
      icon: Award,
      content: (
        <div className="space-y-4 text-muted-foreground">
          <p>
            Enor Lefoulon Meyer, né le <strong className="text-foreground">9 août 2007</strong> à Aldan, en République de Sakha (Iakoutie), Russie, est un artiste lyrique, musicien, créateur de contenu et entrepreneur français. Il est notamment connu pour son activité dans le domaine du chant classique ainsi que pour avoir fondé <strong className="text-foreground">Brenne Aerial</strong>, société spécialisée dans les services aériens par drone.
          </p>
          <p>
            Depuis son plus jeune âge, Enor développe une passion pour la musique, les technologies numériques et l'aéronautique. Son parcours se caractérise par la combinaison de disciplines artistiques et techniques rarement réunies chez une même personne.
          </p>
        </div>
      ),
    },
    {
      title: 'Formation',
      icon: Calendar,
      content: (
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-primary font-semibold">2019-2025</span>
            <span>Conservatoire à Rayonnement Régional de Paris — Piano et Chant</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-semibold">2020-2023</span>
            <span>Double cursus : Lycées Lamartine & Octave Gréard + Conservatoire à Rayonnement Régional de Paris</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-semibold">2023-2025</span>
            <span>Lycée Bergson (Paris 19e) — Mathématiques, Physique, Musique</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-semibold">2025</span>
            <span>Collège d'Alma (Québec, Canada) — Filière Technologies Sonores</span>
          </li>
        </ul>
      ),
    },
    {
      title: 'Parcours Musical',
      icon: Music,
      content: (
        <div className="space-y-6 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-2">Ténor — Chant Classique</p>
            <p>Enor se distingue particulièrement dans le domaine du chant classique en tant que ténor.</p>
          </div>
          
          <div>
            <p className="font-semibold text-foreground mb-3">Maîtrise de Paris (2019-2023)</p>
            <ul className="space-y-2 ml-4 border-l border-primary/30 pl-4">
              <li>• <strong>Levantine Symphony n°1</strong> d'Ibrahim Maalouf</li>
              <li>• <strong>Stabat Mater</strong> de Giovanni Battista Pergolesi à la Chapelle du Château de Versailles</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-foreground mb-3">Chœur de Jeunes de l'Orchestre de Paris (2023-2025)</p>
            <ul className="space-y-2 ml-4 border-l border-primary/30 pl-4">
              <li>• <strong>Carmina Burana</strong> de Carl Orff</li>
              <li>• Œuvres de <strong>Gabriel Fauré</strong></li>
              <li>• Spectacles <strong>Luminescence</strong></li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: 'Brenne Aerial',
      icon: Plane,
      content: (
        <div className="space-y-4 text-muted-foreground">
          <p>
            Passionné d'aéronautique, de photographie et de vidéo, Enor fonde en <strong className="text-foreground">2026</strong> <strong className="text-foreground">brenneaerial.fr</strong>.
          </p>
          <p className="font-semibold text-foreground">Spécialisations :</p>
          <ul className="space-y-2 ml-4 border-l border-primary/30 pl-4">
            <li>• Captation aérienne par drone</li>
            <li>• Photographie et vidéo professionnelles</li>
            <li>• Inspections techniques</li>
            <li>• Suivi de chantiers</li>
            <li>• Valorisation du patrimoine et du tourisme</li>
            <li>• Prestations audiovisuelles (entreprises, collectivités, associations)</li>
          </ul>
          <p className="text-sm italic mt-4">
            L'entreprise s'inscrit dans une démarche de professionnalisation du secteur des drones civils et des technologies aériennes.
          </p>
        </div>
      ),
    },
    {
      title: 'Compétences Techniques',
      icon: Code,
      content: (
        <div className="space-y-4 text-muted-foreground">
          <p className="font-semibold text-foreground">Domaines de compétence :</p>
          <ul className="space-y-2 ml-4 border-l border-primary/30 pl-4">
            <li>• Développement informatique</li>
            <li>• Administration de communautés en ligne</li>
            <li>• Production audiovisuelle</li>
            <li>• Montage vidéo</li>
            <li>• Mixage audio</li>
            <li>• Technologies web</li>
            <li>• Communication numérique</li>
          </ul>
          
          <p className="font-semibold text-foreground mt-6">Outils maîtrisés :</p>
          <p className="text-sm">Pro Tools, Reaper, Cubase, Adobe Premiere Pro, Visual Studio Code, GitHub, et diverses plateformes de développement modernes.</p>
        </div>
      ),
    },
    {
      title: 'Centres d\'Intérêt',
      icon: Award,
      content: (
        <ul className="grid grid-cols-2 gap-3">
          {['Aéronautique', 'Drones', 'Musique classique', 'Piano', 'Développement web', 'Communautés numériques', 'Réseaux sociaux', 'Spéléologie', 'Technologies innovantes'].map((interest, idx) => (
            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {interest}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-16"
      >
        <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <h1 className="text-4xl md:text-5xl font-grotesk font-bold mb-4 text-foreground">Enor Lefoulon Meyer</h1>
          <p className="text-lg text-muted-foreground">
            Artiste lyrique • Musicien • Créateur de contenu • Entrepreneur
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            🎤 Ténor classique • 🚁 Fondateur Brenne Aerial • 💻 Développeur
          </p>
        </div>
      </motion.div>

      {/* Sections */}
      <motion.div
        className="max-w-4xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="rounded-2xl p-6 md:p-8 border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-grotesk font-semibold">{section.title}</h2>
              </div>
              
              <div className="text-base leading-relaxed">
                {section.content}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto mt-16 text-center"
      >
        <p className="text-muted-foreground mb-4">
          Reconnu pour sa créativité, sa curiosité et sa polyvalence, Enor développe simultanément des projets dans les domaines artistiques, technologiques et entrepreneuriaux.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-inter text-sm hover:bg-primary/90 transition">
            Brenne Aerial
          </a>
          <a href="/blog" className="px-6 py-2 rounded-lg border border-primary/30 text-primary font-inter text-sm hover:bg-primary/5 transition">
            Découvrir nos projets
          </a>
        </div>
      </motion.div>
    </div>
  );
}