import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Globe, Plane, UserCheck, ShoppingCart, CreditCard,
  Copyright, AlertTriangle, Scale, ChevronDown, ChevronUp, Mail,
  ExternalLink, CheckCircle, Shield, Award, Network
} from 'lucide-react';

const ACCENT_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: 'text-primary' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'text-rose-400' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: 'text-indigo-400' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
];

const SECTIONS = [
  {
    icon: Globe,
    num: '01',
    title: 'Objet et champ d\'application',
    summary: 'Plateforme eza — communauté & services',
    subsections: [
      {
        label: 'À propos de ce document',
        content: 'Les présentes Conditions Générales d\'Utilisation (« CGU ») régissent l\'utilisation de la plateforme eza, éditée par Brenne Aerial, représentée par son fondateur Enor Lefoulon Meyer (« eza », « la Plateforme », « nous »).\n\neza est une plateforme communautaire mêlant un réseau social de créateurs et de passionnés de drone, un forum d\'entraide, un portfolio de prestations aériennes professionnelles, un espace de certification, un système de donations et d\'affiliations organisationnelles.\n\nEn accédant et en utilisant la Plateforme, vous acceptez sans réserve les présentes CGU. Si vous n\'acceptez pas ces conditions, veuillez cesser immédiatement toute utilisation.',
      },
      {
        label: 'Évolution des CGU',
        content: 'Brenne Aerial se réserve le droit de modifier les présentes CGU à tout moment pour refléter l\'évolution de la Plateforme, des fonctionnalités ou du cadre légal. Les modifications prennent effet dès leur publication. En cas de changement substantiel, les utilisateurs concernés sont notifiés par message ou par email. La poursuite de l\'utilisation vaut acceptation des CGU en vigueur.',
      },
      {
        label: 'Définitions',
        list: [
          '« Utilisateur » : toute personne physique ou morale accédant à la Plateforme',
          '« Membre » : Utilisateur ayant créé un compte et un profil public',
          '« Contenu » : tout texte, média, post, commentaire, message publié',
          '« Profil » : page publique d\'un Membre (username, bio, médias, badges)',
          '« Fondateurs » : le PDG (Enor Lefoulon Meyer) et le PDG-Adjoint',
          '« Équipe de modération » : Fondateurs, administrateurs et directeurs désignés',
        ],
      },
    ],
  },
  {
    icon: Plane,
    num: '02',
    title: 'Description des services',
    summary: 'Réseau social, prestations drone & outils',
    subsections: [
      {
        label: 'Services communautaires',
        cards: [
          { icon: '📰', title: 'Fil & publications', desc: 'Posts, réponses, likes, sondages, hashtags, mentions, médias.' },
          { icon: '👥', title: 'Profils publics', desc: 'Page personnalisée, username, vérifications, abonnés.' },
          { icon: '💬', title: 'Messagerie', desc: 'Demandes de contact, conversations privées, modération.' },
          { icon: '🗣️', title: 'Forum & discussions', desc: 'Sujets, catégories, tags, solutions, épinglage.' },
          { icon: '🔍', title: 'Découverte & recherche', desc: 'Annuaire de membres, profils suggérés, recherche par hashtag.' },
          { icon: '🔔', title: 'Notifications', desc: 'Mentions, likes, suivis, messages, annonces push.' },
        ],
      },
      {
        label: 'Services aériens professionnels',
        cards: [
          { icon: '🎬', title: 'Vidéographie événementielle', desc: 'Mariages, concerts, manifestations sportives, clips.' },
          { icon: '🔍', title: 'Inspection technique', desc: 'Toitures, façades, structures industrielles, pylônes.' },
          { icon: '🏗️', title: 'Suivi de chantier', desc: 'Avancement aérien, cartographie, relevé topographique.' },
          { icon: '🏢', title: 'Captation entreprise', desc: 'Immobilier, publicité, communication corporate 4K.' },
          { icon: '📡', title: 'Retour temps réel', desc: 'Opérations critiques, sécurité, surveillance.' },
          { icon: '📅', title: 'Planning & RDV', desc: 'Demandes de devis, réservation de créneaux, rendez-vous.' },
        ],
      },
      {
        label: 'Outils & programmes',
        list: [
          'Certification eza : parcours vérifié, badges de vérification et statut « Suprême »',
          'Programme de badges communautaires (Fondateur, Collaborateur, Pilote, etc.)',
          'Donations participatives et badge Donateur',
          'Affiliations organisationnelles (logo d\'orga sur un profil)',
          'Abonnement Premium (fonctionnalités avancées, en développement)',
          'Documentation, statut site et maintenance transparente',
        ],
      },
      {
        label: '✈️ Conformité aérienne',
        content: 'Nos pilotes sont certifiés DGAC (Direction Générale de l\'Aviation Civile). Les prestations aériennes sont réalisées conformément à la réglementation européenne EASA et aux arrêtés français en vigueur. Le survol de zones réglementées reste soumis à autorisation.',
      },
    ],
  },
  {
    icon: UserCheck,
    num: '03',
    title: 'Accès, compte et profil',
    summary: 'Inscription, identité, sécurité',
    subsections: [
      {
        label: 'Accès à la Plateforme',
        content: 'La consultation publique des profils, du portfolio, du forum et de la documentation est libre. Certaines fonctionnalités (publication, messagerie, abonnements, certifications, donations) requièrent la création d\'un compte. eza se réserve le droit de restreindre ou suspendre l\'accès pour maintenance, mise à jour ou sécurité, sans préavis ni responsabilité.',
      },
      {
        label: 'Inscription et identité',
        content: 'L\'inscription se fait par adresse email et mot de passe, ou via Google. Vous vous engagez à fournir des informations exactes. Les comptes sont personnels ; leur prêt ou cession est interdit. Tout Membre choisit un username unique affiché publiquement.',
      },
      {
        label: 'Vos obligations',
        list: [
          'Fournir des informations exactes, complètes et à jour',
          'Ne pas usurper l\'identité d\'une personne ou organisation, y compris un profil suggéré eza',
          'Ne pas créer de compte à des fins frauduleuses, de spam ou de manipulation',
          'Ne pas tenter de perturber le fonctionnement technique de la Plateforme',
          'Signaler immédiatement tout usage frauduleux de votre compte',
          'Respecter les autres Membres, l\'Équipe et la réglementation applicable',
        ],
      },
      {
        label: 'Sécurité du compte',
        content: 'Vous êtes responsable de la confidentialité de vos identifiants et de toute activité issue de votre compte. Une authentification à deux facteurs est disponible et recommandée pour les comptes sensibles. eza peut proposer la gestion des sessions actives et la révocation à distance.',
      },
      {
        label: '⚠️ Suspension et suppression',
        content: 'eza peut suspendre, restreindre ou supprimer définitivement tout compte en cas de violation des CGU, comportement abusif, contenu illicite, spam ou fraude, sans préavis ni indemnisation. Les données associées au compte peuvent être conservées pour les besoins légaux puis effacées selon notre Politique de Confidentialité.',
      },
    ],
  },
  {
    icon: FileText,
    num: '04',
    title: 'Contenu et conduite communautaire',
    summary: 'Règles de publication et modération',
    subsections: [
      {
        label: 'Vos responsabilités de Membre',
        content: 'Vous êtes seul responsable du Contenu que vous publiez (posts, réponses, médias, sondages, messages). En publiant, vous garantissez disposer de tous les droits nécessaires et que le Contenu ne viole ni les CGU, ni les droits des tiers, ni la loi.',
      },
      {
        label: 'Contenu autorisé et valorisé',
        list: [
          'Partages de créations aériennes, photos, vidéos',
          'Questions techniques, entraide, retours d\'expérience',
          'Annonces d\'événements, projets, missions (utiles à la communauté)',
          'Critiques constructives et débats respectueux',
        ],
      },
      {
        label: '🚫 Contenu prohibé',
        list: [
          'Discours de haine, racisme, sexisme, homophobie, discrimination',
          'Harcèlement, menaces, incitation à la violence ou au suicide',
          'Contenu à caractère sexuel impliquant des mineurs (signalement automatique aux autorités)',
          'Apologie du terrorisme ou de crimes',
          'Diffusion d\'informations privées d\'autrui sans consentement (doxxing)',
          'Spam, publicité non sollicitée, escroqueries, phishing',
          'Contrefaçon ou violation de droits de propriété intellectuelle',
          'Usurpation d\'identité ou faux comptes',
        ],
      },
      {
        label: '🛡️ Modération',
        content: 'L\'Équipe de modération contrôle les contenus (signalements par la communauté, surveillance proactive). Toute sanction (suppression de contenu, restriction, bannissement) est motivée. Les recours sont possibles via le canal de support.',
      },
      {
        label: 'Signalement',
        content: 'Tout Utilisateur peut signaler un contenu ou un compte via le bouton « Signaler ». Les signalements sont traités par l\'Équipe de modération. Le signalement abusif ou de mauvaise foi est lui-même sanctionnable.',
      },
    ],
  },
  {
    icon: ShoppingCart,
    num: '05',
    title: 'Messagerie et échanges privés',
    summary: 'Demandes, conversations, modération',
    subsections: [
      {
        label: 'Demande de contact',
        content: 'Le premier message à un autre Membre est une demande de contact en attente d\'acceptation. Tant que la demande n\'est pas acceptée, la conversation reste bloquée. Ce mécanisme protège les Membres du spam et du harcèlement.',
      },
      {
        label: 'Conversations privées',
        content: 'Les messages privés ne sont visibles que par les participants. eza applique une modération limitée aux messages privés (signalements, contrevenance avérée, injonctions légales) et ne les lit pas à des fins commerciales.',
      },
      {
        label: 'Blocage et contrôle',
        list: [
          'Bloquer un Membre empêche tout nouveau message de sa part',
          'Une conversation peut être verrouillée unilatéralement ou pour les deux participants',
          'Les messages officiels eza sont signalés comme tels',
          'L\'Équipe peut intervenir en cas de litige, harcèlement ou obligation légale',
        ],
      },
    ],
  },
  {
    icon: Award,
    num: '06',
    title: 'Certifications, badges & vérifications',
    summary: 'Vérification d\'identité et statut communautaire',
    subsections: [
      {
        label: 'Vérifications',
        content: 'eza attribue des vérifications (verified, pro, certified, official, supreme) pour confirmer l\'authenticité d\'un compte ou d\'une compétence. Ces vérifications sont délivrées par l\'Équipe selon des critères internes (preuves, antécédents, notoriété) et peuvent être retirées à tout moment en cas d\'abus.',
      },
      {
        label: 'Statut Suprême',
        content: 'Le statut « Suprême » est réservé à un nombre très limité de comptes, attribué à la discrétion des Fondateurs. Il ne constitue pas une certification d\'aptitude professionnelle et n\'engage pas eza sur les compétences du Membre.',
      },
      {
        label: 'Badges communautaires',
        content: 'Les badges (Fondateur, Collaborateur, Pilote, Beta Testeur, Partenaire, Donateur, etc.) récompensent l\'engagement. Ils sont attribués par l\'Équipe et peuvent évoluer. L\'usurpation ou l\'imitation d\'un badge est interdite.',
      },
      {
        label: 'Certification professionnelle',
        content: 'Le parcours de certification eza implique un questionnaire et, le cas échéant, un paiement. L\'approbation reste à l\'appréciation de l\'Équipe. Le remboursement s\'applique uniquement en cas de refus express et dans les conditions prévues au parcours.',
      },
    ],
  },
  {
    icon: CreditCard,
    num: '07',
    title: 'Donations, abonnement Premium & prestations',
    summary: 'Financement participatif et services payants',
    subsections: [
      {
        label: 'Donations',
        content: 'Les donations soutiennent eza et ses projets. Elles sont effectuées via Stripe (paiement sécurisé). Les donations sont définitives et non remboursables, sauf erreur manifeste ou disposition légale. Un badge Donateur peut être attribué selon les paliers définis.',
      },
      {
        label: 'Abonnement Premium',
        content: 'Premium (en développement) offre des fonctionnalités avancées. Les conditions précises (prix, durée, reconduction, résiliation) seront publiées à son lancement. Tant que Premium n\'est pas activé, aucune somme n\'est due au titre de l\'abonnement.',
      },
      {
        label: 'Prestations aériennes — devis',
        content: 'Les demandes de devis via la Plateforme ne constituent pas une offre ferme. Un devis envoyé par eza est valable 30 jours. La commande n\'est ferme qu\'après signature du devis, versement de l\'acompte (généralement 30 %) et confirmation écrite.',
      },
      {
        label: '📋 Annulation des prestations',
        table: [
          { type: 'Plus de 7 jours avant', delai: '> 7 jours', condition: 'Acompte remboursable moins 50€ de frais administratifs' },
          { type: 'Entre 72h et 7 jours', delai: '72h – 7j', condition: '50% du montant total dû' },
          { type: 'Moins de 72h avant', delai: '< 72h', condition: 'Acompte intégralement conservé' },
        ],
      },
      {
        label: '🌦️ Force majeure météorologique',
        content: 'En cas de conditions météo incompatibles avec le vol de drone, eza peut reporter la prestation sans pénalité et propose un nouveau créneau dans les 30 jours suivants.',
      },
      {
        label: 'Modalités de paiement & retards',
        content: 'Paiements via Stripe (carte bancaire) ou virement. Une facture est émise pour chaque prestation. Tout retard entraîne de plein droit intérêts de retard au taux légal majoré de 10 points et l\'indemnité forfaitaire de 40€ (art. L. 441-10 C. com.).',
      },
    ],
  },
  {
    icon: Network,
    num: '08',
    title: 'Affiliations et organisations',
    summary: 'Liens entre Membres et structures',
    subsections: [
      {
        label: 'Principe',
        content: 'Un Membre peut être affilié à une organisation (entreprise, association) qui gère son compte. L\'affiliation affiche publiquement le logo et le nom de l\'organisation sur le profil du Membre, sous réserve d\'acceptation par celui-ci.',
      },
      {
        label: 'Gestion',
        list: [
          'L\'organisation invite le Membre ; ce dernier accepte ou refuse',
          'La visibilité du logo (public/privé) est contrôlée par le Membre',
          'L\'organisation peut demander la suppression de l\'affiliation ; le Membre décide',
          'L\'Équipe peut intervenir en cas de litige ou de comportement abusif',
        ],
      },
      {
        label: 'Responsabilité',
        content: 'eza n\'est pas partie au contrat liant un Membre et son organisation. La Plateforme se borne à afficher l\'affiliation validée par les deux parties. Toute fausse déclaration d\'affiliation est sanctionnée.',
      },
    ],
  },
  {
    icon: Copyright,
    num: '09',
    title: 'Propriété intellectuelle',
    summary: 'Contenu de la Plateforme et des Membres',
    subsections: [
      {
        label: 'Contenu de la Plateforme',
        content: 'L\'ensemble du contenu éditorial de eza (textes, logos, design, code, documentation, portfolio de prestations) est la propriété exclusive de Brenne Aerial, protégé par le Code de la Propriété Intellectuelle français et le droit d\'auteur de l\'UE.',
      },
      {
        label: 'Contenu publié par les Membres',
        content: 'Vous conservez la propriété de vos contenus. En publiant sur eza, vous accordez une licence non exclusive, gratuite, mondiale et révocable permettant d\'héberger, d\'afficher, de reproduire et de communiquer votre Contenu dans le cadre du fonctionnement de la Plateforme. Vous pouvez supprimer votre Contenu à tout moment, ce qui n\'affecte pas les reproductions nécessaires (caches, partages déjà réalisés par d\'autres).',
      },
      {
        label: 'Productions aériennes commandées',
        content: 'Sauf accord contraire au devis, eza conserve les droits d\'auteur sur les productions (vidéos, photos, cartographies). Le client reçoit une licence d\'utilisation non exclusive, non transférable, limitée aux usages et territoire définis au contrat. Toute utilisation commerciale étendue requiert un accord écrit et une facturation complémentaire.',
      },
      {
        label: '📸 Droit à l\'image',
        content: 'Le Membre ou le client garantit disposer des autorisations nécessaires pour filmer les lieux, bâtiments privés et personnes présents. eza ne saurait être tenu responsable de l\'absence de telles autorisations.',
      },
      {
        label: 'Signalement de contrefaçon',
        content: 'Tout titulaire de droits peut signaler une atteinte à sa propriété intellectuelle via le canal de support. eza procède au retrait prompt des contenus manifestement illicites après vérification.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    num: '10',
    title: 'Responsabilité',
    summary: 'Limites, garanties et assurances',
    subsections: [
      {
        label: 'Rôle de la Plateforme',
        content: 'eza est un hébergeur et un prestataire technique. Nous ne contrôlons pas a priori l\'ensemble des contenus publiés. La responsabilité de eza ne peut être engagée pour les contenus, propos ou actes des Membres, sous réserve des obligations légales applicables aux hébergeurs (loi pour la confiance dans l\'économie numérique).',
      },
      {
        label: 'Responsabilité du Membre',
        content: 'Le Membre indemnise eza contre toute réclamation, condamnation ou frais découlant d\'un contenu qu\'il a publié ou d\'un manquement aux CGU. eza se réserve le droit d\'engager des poursuites en cas de préjudice.',
      },
      {
        label: 'Engagement de moyens (prestations)',
        content: 'Pour les prestations aériennes, eza s\'engage à réaliser ses missions dans les règles de l\'art (obligation de moyens). Il s\'agit d\'une obligation de moyens et non de résultat pour les aspects dépendant de conditions extérieures.',
      },
      {
        label: 'Causes d\'exonération',
        list: [
          'Conditions météorologiques imprévisibles ou dégradées',
          'Refus d\'autorisation de survol par les autorités (DGAC, mairie, armée)',
          'Pannes matérielles imprévues malgré entretien régulier',
          'Faits du client, de tiers ou cas de force majeure',
          'Perturbations des fréquences radio (brouillage, interférences)',
          'Indisponibilité d\'infrastructures tierces (hébergeur, paiements, push)',
        ],
      },
      {
        label: '🛡️ Assurances',
        content: 'Brenne Aerial est couvert par une Assurance Responsabilité Civile Professionnelle et une assurance spécifique drone (RC aéronef télépilote). Une attestation peut être fournie sur demande avant toute prestation.',
      },
      {
        label: 'Disponibilité du service',
        content: 'eza s\'efforce d\'assurer une disponibilité maximale mais ne garantit pas un accès ininterrompu. La maintenance, les mises à jour et les opérations de sécurité peuvent occasionner des interruptions. Un statut du service est publié sur la page dédiée.',
      },
    ],
  },
  {
    icon: Shield,
    num: '11',
    title: 'Données personnelles',
    summary: 'Voir la Politique de Confidentialité',
    subsections: [
      {
        label: 'Traitement des données',
        content: 'Le traitement de vos données personnelles est décrit dans notre Politique de Confidentialité, accessible depuis le pied de page. Vous y trouverez la liste des données collectées, les finalités, la base légale, les durées de conservation, vos droits RGPD et les modalités d\'exercice.',
      },
      {
        label: 'Principes essentiels',
        list: [
          'Aucune vente de données à des tiers',
          'Hébergement dans l\'Union Européenne (avec exceptions encadrées)',
          'Sécurité : chiffrement, accès restreint, sauvegardes, audit',
          'Respect du Règlement UE 2016/679 (RGPD) et de la loi Informatique & Libertés',
        ],
      },
    ],
  },
  {
    icon: Scale,
    num: '12',
    title: 'Droit applicable et juridiction',
    summary: 'Médiation, litiges et loi française',
    subsections: [
      {
        label: 'Droit applicable',
        content: 'Les présentes CGU sont soumises exclusivement au droit français. Elles sont rédigées en langue française, seule version faisant foi. En cas de traduction, la version française prévaut en cas de divergence.',
      },
      {
        label: 'Résolution amiable',
        content: 'En cas de litige, les parties s\'engagent à rechercher une solution amiable avant tout recours judiciaire. Un délai de 30 jours de négociation amiable est requis à compter de la notification du différend par lettre recommandée ou via le canal de support.',
      },
      {
        label: '⚖️ Médiation de la consommation',
        content: 'Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, pour tout litige non résolu dans le délai de 30 jours, vous pouvez recourir gratuitement à un médiateur de la consommation agréé.',
      },
      {
        label: 'Juridiction compétente',
        content: 'À défaut d\'accord amiable, tout litige relatif aux prestations sera soumis à la compétence exclusive des tribunaux français, et notamment du Tribunal de Commerce de Châteauroux (Indre), nonobstant pluralité de défendeurs. Les litiges relatifs au Contenu des Membres relèvent des tribunaux compétents selon le droit commun.',
      },
      {
        label: 'Contact',
        content: 'Pour toute question juridique : contact@brenneaerial.fr. La Plateforme est éditée par Brenne Aerial, représentée par Enor Lefoulon Meyer.',
      },
      {
        label: '📅 Date de dernière mise à jour',
        content: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
      },
    ],
  },
];

function Accordion({ section, index }) {
  const [open, setOpen] = useState(false);
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border ${color.border} bg-card overflow-hidden`}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color.icon}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-mono text-xs ${color.text} font-bold`}>{section.num}</span>
            <h2 className="font-grotesk font-bold text-base sm:text-lg">{section.title}</h2>
          </div>
          <p className="font-inter text-xs text-muted-foreground">{section.summary}</p>
        </div>
        <div className={`w-7 h-7 rounded-full ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
          {open ? <ChevronUp className={`w-4 h-4 ${color.text}`} /> : <ChevronDown className={`w-4 h-4 ${color.text}`} />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-6 space-y-5"
        >
          <div className={`h-px w-full ${color.bg}`} />
          {section.subsections.map((sub, si) => (
            <div key={si} className="space-y-3">
              <p className={`font-grotesk font-semibold text-sm ${color.text}`}>{sub.label}</p>

              {sub.content && (
                <p className="font-inter text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{sub.content}</p>
              )}

              {sub.list && (
                <ul className="space-y-1.5">
                  {sub.list.map((item, li) => (
                    <li key={li} className="flex items-start gap-2.5 font-inter text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${color.text} bg-current`} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sub.cards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sub.cards.map((card, ci) => (
                    <div key={ci} className={`rounded-xl p-4 ${color.bg} border ${color.border}`}>
                      <p className="text-xl mb-1">{card.icon}</p>
                      <p className="font-grotesk font-semibold text-sm mb-1">{card.title}</p>
                      <p className="font-inter text-xs text-muted-foreground">{card.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {sub.table && (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className={`${color.bg}`}>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Situation</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Délai</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Condition financière</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sub.table.map((row, ri) => (
                        <tr key={ri} className="border-t border-border">
                          <td className="px-4 py-2.5 font-inter text-xs font-medium">{row.type}</td>
                          <td className={`px-4 py-2.5 font-mono text-xs font-bold ${color.text}`}>{row.delai}</td>
                          <td className="px-4 py-2.5 font-inter text-xs text-muted-foreground">{row.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-accent border border-accent/30 bg-accent/5 px-4 py-2 rounded-full mb-6">
              <FileText className="w-3.5 h-3.5" /> Document légal — CGU v3.0
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Conditions <span className="gradient-text">d'utilisation</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              eza est une plateforme communautaire mêlant réseau social, forum, prestations aériennes, certifications et donations. Ces conditions définissent les règles d'utilisation et les engagements mutuels entre vous et eza. Lisez-les attentivement.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Pilotes certifiés DGAC
              </span>
              <span className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" /> RC Pro & assurance drone
              </span>
              <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full">
                <Scale className="w-3 h-3" /> Droit français applicable
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary bar */}
      <div className="bg-card border-y border-border py-4 px-5 mb-12">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-inter text-muted-foreground">
          <span>📅 Mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>📄 {SECTIONS.length} sections — Cliquez pour développer</span>
          <a href="mailto:contact@brenneaerial.fr" className="flex items-center gap-1.5 text-primary hover:underline">
            <Mail className="w-3 h-3" /> contact@brenneaerial.fr
          </a>
        </div>
      </div>

      {/* Sections */}
      <section className="px-5 pb-24 max-w-4xl mx-auto space-y-4">
        {SECTIONS.map((section, i) => (
          <Accordion key={i} section={section} index={i} />
        ))}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-primary/10 border border-accent/20 text-center sky-glow"
        >
          <Scale className="w-10 h-10 text-accent mx-auto mb-4" />
          <h3 className="font-grotesk font-bold text-xl mb-2">Des questions sur nos conditions ?</h3>
          <p className="font-inter text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe répond à toute demande de clarification juridique ou commerciale dans les meilleurs délais.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:contact@brenneaerial.fr"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              <Mail className="w-4 h-4" /> Nous contacter
            </a>
            <Link to="/contact"
              className="inline-flex items-center gap-2 bg-secondary border border-border text-sm px-5 py-2.5 rounded-xl hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4" /> Page contact
            </Link>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4 pt-4 text-xs font-inter text-muted-foreground">
          <Link to="/legal/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Politique de confidentialité
          </Link>
          <span>·</span>
          <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}