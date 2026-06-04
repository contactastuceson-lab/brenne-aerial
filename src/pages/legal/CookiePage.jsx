import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cookie, Shield, BarChart3, Target, Settings, Clock, Globe, AlertTriangle,
  ChevronDown, ChevronUp, Mail, ExternalLink, CheckCircle, Lock,
  Smartphone, Server, RefreshCw, Eye, Trash2, Download, Bell, FileText, Monitor
} from 'lucide-react';

const ACCENT_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: 'text-primary' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'text-rose-400' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'text-orange-400' },
  { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', icon: 'text-indigo-400' },
  { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', icon: 'text-teal-400' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', icon: 'text-pink-400' },
  { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400', icon: 'text-lime-400' },
];

const SECTIONS = [
  {
    icon: Cookie,
    num: '01',
    title: 'Qu\'est-ce qu\'un cookie ?',
    summary: 'Définition, fonctionnement et types',
    subsections: [
      {
        label: 'Définition technique',
        content: 'Un cookie (ou "témoin de connexion") est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre visite sur brenneaerial.fr. Il est stocké par votre navigateur et renvoyé à notre serveur à chaque visite ultérieure.\n\nLes cookies ne contiennent pas de programme exécutable — ils sont incapables d\'endommager votre appareil. Ce sont de simples données textuelles permettant de mémoriser des informations pour améliorer votre expérience.',
      },
      {
        label: 'Exemple concret',
        highlight: {
          icon: '💡',
          text: 'Lorsque vous vous connectez à votre espace client Brenne Aerial, un cookie de session mémorise votre identifiant de connexion. Cela vous évite de devoir vous authentifier à nouveau à chaque page visitée pendant votre session.'
        },
      },
      {
        label: 'Les deux grandes familles',
        cards: [
          { icon: '🔒', title: 'Cookies first-party', desc: 'Déposés directement par Brenne Aerial. Essentiels au fonctionnement de nos propres services : authentification, préférences, sécurité des formulaires.' },
          { icon: '🌐', title: 'Cookies third-party', desc: 'Déposés par nos partenaires (Google, Stripe, Meta…) dont nous intégrons les services. Chaque tiers possède sa propre politique de confidentialité.' },
        ],
      },
      {
        label: 'Classification par durée de vie',
        cards: [
          { icon: '⚡', title: 'Cookies de session', desc: 'Temporaires. Supprimés automatiquement à la fermeture de votre navigateur. Utilisés pour la navigation sécurisée.' },
          { icon: '📅', title: 'Cookies persistants', desc: 'Conservés jusqu\'à leur date d\'expiration ou jusqu\'à ce que vous les supprimiez manuellement.' },
        ],
      },
    ],
  },
  {
    icon: Shield,
    num: '02',
    title: 'Cookies strictement nécessaires',
    summary: 'Toujours actifs — aucun consentement requis',
    subsections: [
      {
        label: 'Pourquoi sont-ils obligatoires ?',
        content: 'Ces cookies sont indispensables au fonctionnement du site. Sans eux, des fonctionnalités essentielles — comme la connexion à votre compte, la sécurisation des formulaires ou la mémorisation de vos préférences de langue — seraient impossibles. Ils ne peuvent pas être désactivés via notre bandeau de consentement.',
      },
      {
        label: 'Données collectées',
        list: [
          'Jeton d\'authentification et identifiant de session utilisateur',
          'Protection CSRF (Cross-Site Request Forgery) contre les attaques malveillantes',
          'Mémorisation de votre consentement cookies (ce choix)',
          'Préférences d\'interface : thème clair/sombre, langue d\'affichage',
          'Données de formulaire multi-étapes (devis, inscription)',
          'Sécurisation des paiements en ligne (Stripe)',
          'Équilibrage de charge et performance serveur',
        ],
      },
      {
        label: 'Exemples de noms de cookies',
        cookies: ['session_id', 'csrf_token', 'brenne_theme', 'brenne_cookie_consent', 'auth_token', '__stripe_mid', '__stripe_sid'],
      },
      {
        label: 'Durée de conservation',
        table: [
          { type: 'Session utilisateur', duree: 'Durée de session', detail: 'Supprimé à la fermeture du navigateur' },
          { type: 'Préférences interface', duree: '12 mois', detail: 'Renouvelé à chaque visite' },
          { type: 'Consentement cookies', duree: '13 mois', detail: 'Conformément aux lignes CNIL' },
          { type: 'Sécurité CSRF', duree: 'Session', detail: 'Régénéré à chaque session' },
        ],
      },
    ],
  },
  {
    icon: BarChart3,
    num: '03',
    title: 'Cookies analytiques & performance',
    summary: 'Mesure d\'audience anonymisée — optionnel',
    subsections: [
      {
        label: 'À quoi servent-ils ?',
        content: 'Ces cookies nous permettent de comprendre comment vous utilisez notre site afin de l\'améliorer en continu. Les données collectées sont anonymisées : elles ne permettent pas de vous identifier personnellement. Votre consentement est requis avant leur activation.',
      },
      {
        label: 'Données collectées (anonymisées)',
        list: [
          'Pages visitées et durée de consultation',
          'Parcours de navigation sur le site (pages vues dans l\'ordre)',
          'Source d\'acquisition : Google, réseaux sociaux, accès direct, campagnes email',
          'Taux de rebond (vous avez quitté le site sans interaction) et taux de conversion',
          'Erreurs techniques rencontrées lors de la navigation',
          'Temps de chargement des pages et performances techniques',
          'Résolution d\'écran, type d\'appareil (mobile, tablette, desktop)',
          'Localisation géographique approximative (région / pays — jamais l\'adresse exacte)',
          'Clics sur les boutons d\'appel à l\'action (devis, contact, portfolio)',
        ],
      },
      {
        label: 'Exemples de noms de cookies',
        cookies: ['_ga', '_gid', '_gat', 'plausible_id', '_pk_id', '_pk_ses', 'ahoy_visitor'],
      },
      {
        label: 'Services tiers utilisés',
        cards: [
          { icon: '📊', title: 'Google Analytics 4', desc: 'Analyse comportementale avancée, entonnoirs de conversion, rapports d\'audience. Politique : policies.google.com/privacy' },
          { icon: '🏷️', title: 'Google Tag Manager', desc: 'Gestionnaire de balises centralisé. Ne collecte pas de données lui-même mais orchestre les autres outils.' },
        ],
      },
      {
        label: 'Durée de conservation',
        content: 'Conformément aux recommandations de la CNIL, les cookies analytiques sont conservés pour une durée maximale de 13 mois. Au-delà, un nouveau consentement vous sera demandé.',
      },
    ],
  },
  {
    icon: Target,
    num: '04',
    title: 'Cookies marketing & publicité',
    summary: 'Publicité ciblée et réseaux sociaux — optionnel',
    subsections: [
      {
        label: 'Objectif',
        content: 'Ces cookies peuvent être utilisés pour vous présenter des publicités pertinentes en dehors de notre site, mesurer l\'efficacité de nos campagnes publicitaires et permettre l\'intégration des boutons de partage sur les réseaux sociaux. Votre consentement est requis.',
      },
      {
        label: 'Données collectées',
        list: [
          'Centres d\'intérêt déduits de votre navigation (catégories de services consultés)',
          'Fréquence d\'exposition à nos publicités pour éviter la saturation',
          'Interactions avec nos boutons de partage sociaux (Facebook, Instagram, TikTok)',
          'Conversion après visualisation d\'une publicité Brenne Aerial',
          'Création d\'audiences personnalisées sur les plateformes publicitaires',
          'Attribution des ventes aux campagnes marketing correspondantes',
          'Mesure de l\'efficacité des campagnes email marketing',
          'Reciblage des visiteurs n\'ayant pas finalisé une demande de devis',
        ],
      },
      {
        label: 'Partenaires et leurs cookies',
        cards: [
          { icon: '📘', title: 'Meta (Facebook/Instagram)', desc: 'Pixel Meta pour le ciblage et la mesure des conversions. Cookies : _fbp, _fbc, fr. Politique : facebook.com/policy/cookies/' },
          { icon: '🎵', title: 'TikTok Pixel', desc: 'Mesure des conversions et ciblage publicitaire sur TikTok. Cookies : tt_webid, tt_pixel_session_index. Politique : tiktok.com/legal/cookie-policy' },
          { icon: '💼', title: 'LinkedIn Insight', desc: 'Retargeting B2B et mesure des conversions professionnelles. Cookies : li_sugr, bcookie, lidc.' },
          { icon: '▶️', title: 'YouTube', desc: 'Lecture de vidéos intégrées dans le portfolio. Cookies : VISITOR_INFO1_LIVE, YSC, PREF. Politique : youtube.com/intl/fr/about/policies/' },
        ],
      },
      {
        label: 'Exemples de noms de cookies',
        cookies: ['_fbp', '_fbc', 'fr', 'IDE', 'tt_webid', 'li_sugr', 'VISITOR_INFO1_LIVE', 'YSC'],
      },
    ],
  },
  {
    icon: Settings,
    num: '05',
    title: 'Cookies de personnalisation',
    summary: 'Mémorisation de vos préférences avancées — optionnel',
    subsections: [
      {
        label: 'Rôle',
        content: 'Ces cookies mémorisent vos préférences avancées pour personnaliser votre expérience sur la plateforme Brenne Aerial : contenu recommandé, paramètres d\'affichage, historique de navigation dans l\'application.',
      },
      {
        label: 'Données concernées',
        list: [
          'Préférences de tri et filtres dans le portfolio (catégorie, type de prestation)',
          'Contenu et articles de blog récemment consultés',
          'Paramètres d\'accessibilité (taille de police, contraste élevé)',
          'Mode d\'affichage compact ou étendu de l\'interface',
          'Préférences de notification (alertes activées/désactivées)',
          'Position de défilement dans les longs documents',
          'Onglet actif dans les interfaces multi-vues',
        ],
      },
      {
        label: 'Exemples de noms de cookies',
        cookies: ['brenne_prefs', 'brenne_view_mode', 'brenne_compact', 'brenne_lang', 'brenne_notif'],
      },
      {
        label: 'Durée',
        content: 'Ces cookies de personnalisation sont conservés jusqu\'à 6 mois. Vous pouvez les supprimer à tout moment via les paramètres de votre navigateur sans perdre l\'accès au site.',
      },
    ],
  },
  {
    icon: Globe,
    num: '06',
    title: 'Services tiers et cookies partenaires',
    summary: '6 partenaires identifiés — transparence totale',
    subsections: [
      {
        label: 'Nos partenaires tiers',
        content: 'Certains services intégrés à notre site déposent leurs propres cookies. Brenne Aerial n\'a pas de contrôle direct sur ces cookies une fois votre consentement donné au tiers concerné. Voici une liste exhaustive :',
      },
      {
        label: 'Google Analytics & Tag Manager',
        list: [
          'Finalité : mesure d\'audience, analyse comportementale, optimisation des contenus',
          'Données : navigation anonymisée, conversions, performances',
          'Politique : policies.google.com/privacy',
          'Opt-out : tools.google.com/dlpage/gaoptout',
          'Cookies : _ga, _gid, _gat_UA-*, _gcl_au',
        ],
      },
      {
        label: 'Stripe (paiements)',
        list: [
          'Finalité : traitement sécurisé des paiements (certifications, dons)',
          'Données : session de paiement, détection de fraude — aucune donnée bancaire stockée',
          'Politique : stripe.com/fr/privacy',
          'Cookies : __stripe_mid, __stripe_sid, __stripe_orig_props',
        ],
      },
      {
        label: 'Brevo / Sendinblue (emailing)',
        list: [
          'Finalité : envoi de newsletters, emails transactionnels (confirmations de devis)',
          'Données : ouvertures et clics dans nos emails, désabonnements',
          'Politique : brevo.com/fr/legal/privacypolicy/',
          'Cookies : sib_cuid, sib_c, sib_s',
        ],
      },
      {
        label: 'YouTube',
        list: [
          'Finalité : lecture des vidéos portfolio sans déposer de cookies avant clic (mode confidentialité)',
          'Données : historique de lecture, préférences de qualité',
          'Politique : youtube.com/intl/fr/about/policies/',
          'Cookies : VISITOR_INFO1_LIVE, YSC, PREF, GPS',
        ],
      },
      {
        label: 'Meta (Facebook/Instagram)',
        list: [
          'Finalité : Pixel Meta pour mesurer les conversions et permettre le retargeting',
          'Données : actions réalisées sur notre site (pages vues, formulaires soumis)',
          'Politique : facebook.com/policy/cookies/',
          'Désinscription : facebook.com/ads/preferences',
          'Cookies : _fbp, _fbc, fr, datr',
        ],
      },
      {
        label: '⚠️ Important',
        highlight: {
          icon: '⚠️',
          text: 'En refusant les cookies optionnels via notre bandeau, nous bloquons autant que possible les cookies tiers marketing et analytiques. Cependant, certains cookies de services essentiels (comme Stripe pour les paiements sécurisés) restent actifs car indispensables à la transaction.'
        },
      },
    ],
  },
  {
    icon: Clock,
    num: '07',
    title: 'Durée de conservation globale',
    summary: 'Tableau récapitulatif de toutes les durées',
    subsections: [
      {
        label: 'Récapitulatif par catégorie',
        table: [
          { type: 'Essentiels (session)', duree: 'Fermeture navigateur', detail: 'Suppression automatique' },
          { type: 'Essentiels (préférences)', duree: '12 mois', detail: 'Manuelle ou expiration' },
          { type: 'Consentement cookies', duree: '13 mois', detail: 'Recommandation CNIL' },
          { type: 'Analytiques (Google)', duree: '13 mois', detail: 'Anonymisés — manuelle ou expiration' },
          { type: 'Marketing (Meta, TikTok)', duree: '13 mois', detail: 'Manuelle ou expiration' },
          { type: 'Personnalisation', duree: '6 mois', detail: 'Manuelle ou expiration' },
          { type: 'Tiers (variable)', duree: 'Selon tiers', detail: 'Consulter politique du tiers' },
          { type: 'Stripe (paiements)', duree: '90 jours', detail: 'Sécurité et prévention fraude' },
        ],
      },
      {
        label: 'Principe général',
        content: 'Conformément aux lignes directrices de la CNIL (délibération n°2020-091), aucun cookie soumis au consentement n\'est conservé plus de 13 mois sans un renouvellement de votre accord. À l\'expiration de ce délai, un nouveau bandeau de consentement vous sera présenté.',
      },
    ],
  },
  {
    icon: Eye,
    num: '08',
    title: 'Vos droits RGPD liés aux cookies',
    summary: '6 droits fondamentaux garantis par la loi',
    subsections: [
      {
        label: 'Vos droits',
        rights: [
          { icon: Eye, label: 'Droit d\'accès', desc: 'Obtenir la liste complète des cookies déposés sur votre terminal et les données traitées.' },
          { icon: Settings, label: 'Droit de rectification', desc: 'Corriger des données personnelles inexactes collectées via les cookies.' },
          { icon: Trash2, label: 'Droit à l\'effacement', desc: 'Demander la suppression des données personnelles liées aux cookies analytiques et marketing.' },
          { icon: Lock, label: 'Droit à la limitation', desc: 'Restreindre le traitement de vos données dans certaines situations définies par le RGPD.' },
          { icon: Download, label: 'Droit à la portabilité', desc: 'Récupérer vos données dans un format structuré, lisible par machine (JSON, CSV).' },
          { icon: AlertTriangle, label: 'Droit d\'opposition', desc: 'Vous opposer à tout moment au dépôt de cookies marketing ou analytiques.' },
        ],
      },
      {
        label: 'Comment exercer vos droits ?',
        list: [
          '✉️ Par email : contact@brenneaerial.fr (réponse sous 30 jours maximum)',
          '🏛️ Réclamation auprès de la CNIL : www.cnil.fr/fr/plaintes',
          '🔒 Via les paramètres de votre compte Brenne Aerial (section Confidentialité)',
          '⚙️ Via le bandeau cookies présent sur le site (réinitialiser vos préférences)',
        ],
      },
    ],
  },
  {
    icon: Settings,
    num: '09',
    title: 'Gérer et refuser les cookies',
    summary: 'Bandeau, navigateur, outils de désinscription',
    subsections: [
      {
        label: '1. Via notre bandeau de consentement',
        content: 'La solution la plus simple. Lors de votre première visite, un bandeau vous permet d\'accepter ou de refuser chaque catégorie de cookies individuellement. Vous pouvez modifier vos choix à tout moment.',
        resetButton: true,
      },
      {
        label: '2. Via les paramètres de votre navigateur',
        browsers: [
          { name: 'Google Chrome', desc: 'Paramètres → Confidentialité → Cookies', href: 'https://support.google.com/chrome/answer/95647' },
          { name: 'Mozilla Firefox', desc: 'Préférences → Vie privée → Cookies', href: 'https://support.mozilla.org/fr/kb/activer-desactiver-cookies-preferences' },
          { name: 'Apple Safari', desc: 'Préférences → Confidentialité → Gérer', href: 'https://support.apple.com/fr-fr/guide/safari/sfri11471/mac' },
          { name: 'Microsoft Edge', desc: 'Paramètres → Confidentialité → Cookies', href: 'https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge' },
          { name: 'Opera', desc: 'Préférences → Avancé → Cookies', href: 'https://help.opera.com/en/latest/web-preferences/#cookies' },
          { name: 'Brave', desc: 'Paramètres → Boucliers → Bloquer les cookies', href: 'https://support.brave.com/hc/en-us/articles/360050634931' },
        ],
      },
      {
        label: '3. Outils de désinscription publicitaire',
        list: [
          '🔗 Google Ad Settings : adssettings.google.com',
          '🔗 YourOnlineChoices (Europe) : youronlinechoices.eu',
          '🔗 NAI Opt-out : optout.networkadvertising.org',
          '🔗 Meta Ad Preferences : facebook.com/ads/preferences',
          '🔗 TikTok Ads Preferences : tiktok.com/settings/privacy',
        ],
      },
      {
        label: '⚠️ Conséquences du refus',
        highlight: {
          icon: '⚠️',
          text: 'Désactiver tous les cookies peut altérer le fonctionnement du site. Les cookies essentiels étant indispensables, leur blocage peut empêcher la connexion à votre espace client, la soumission de formulaires ou le traitement des paiements.'
        },
      },
    ],
  },
  {
    icon: Smartphone,
    num: '10',
    title: 'Applications mobiles & technologies similaires',
    summary: 'Au-delà des cookies : pixels, localStorage, fingerprinting',
    subsections: [
      {
        label: 'Autres technologies de traçage utilisées',
        cards: [
          { icon: '📱', title: 'Identifiants mobiles', desc: 'IDFA (iOS) et GAID (Android) pour le ciblage publicitaire mobile. Désactivables dans Paramètres > Confidentialité de votre OS.' },
          { icon: '💾', title: 'LocalStorage & SessionStorage', desc: 'Stockage local dans le navigateur pour mémoriser vos préférences. Effaçables via les paramètres du navigateur.' },
          { icon: '👁️', title: 'Web beacons (pixels espions)', desc: 'Petites images 1×1 pixel invisibles intégrées dans nos emails pour mesurer les ouvertures. Désactivables en bloquant les images distantes.' },
          { icon: '🔒', title: 'Fingerprinting', desc: 'Brenne Aerial n\'utilise PAS de fingerprinting à des fins de tracking. Nous le mentionnons uniquement à titre informatif sur son existence.' },
          { icon: '🗺️', title: 'Géolocalisation', desc: 'Non collectée automatiquement. Uniquement si vous l\'autorisez explicitement pour calculer des frais de déplacement dans les devis.' },
          { icon: '🔔', title: 'Notifications push', desc: 'Si vous les acceptez, des notifications peuvent être envoyées. Désactivables à tout moment dans les paramètres du navigateur ou de votre compte.' },
        ],
      },
      {
        label: 'Application mobile (si applicable)',
        content: 'Si Brenne Aerial lance une application mobile, celle-ci utilisera les identifiants publicitaires natifs de l\'OS (IDFA/GAID) uniquement avec votre consentement explicite, conformément aux politiques de l\'App Store et du Play Store.',
      },
    ],
  },
  {
    icon: Server,
    num: '11',
    title: 'Sécurité et protection des cookies',
    summary: 'Mesures techniques pour protéger vos données',
    subsections: [
      {
        label: 'Mesures de sécurité en place',
        security: [
          { icon: '🔐', label: 'Flag HttpOnly', desc: 'Les cookies d\'authentification ne sont pas accessibles via JavaScript' },
          { icon: '🛡️', label: 'Flag Secure', desc: 'Les cookies ne transitent que via HTTPS (connexion chiffrée)' },
          { icon: '🚫', label: 'Flag SameSite', desc: 'Protection contre les attaques CSRF (Cross-Site Request Forgery)' },
          { icon: '⏱️', label: 'Expiration courte', desc: 'Les tokens de session expirent rapidement pour limiter l\'exposition' },
          { icon: '🔒', label: 'Chiffrement TLS', desc: 'Toutes les communications entre votre navigateur et nos serveurs sont chiffrées' },
          { icon: '🔑', label: 'Rotation des tokens', desc: 'Les tokens de session sont régénérés à chaque connexion' },
        ],
      },
      {
        label: 'En cas de violation',
        content: 'En cas de violation de données impliquant vos cookies ou données personnelles, Brenne Aerial s\'engage à :\n• Notifier la CNIL dans les 72 heures (art. 33 RGPD)\n• Vous informer directement si le risque est élevé (art. 34 RGPD)\n• Publier un avis sur le site en cas d\'incident majeur',
      },
    ],
  },
  {
    icon: RefreshCw,
    num: '12',
    title: 'Historique des modifications',
    summary: 'Transparence sur les évolutions de cette politique',
    subsections: [
      {
        label: 'Journal des versions',
        table: [
          { type: 'v3.0 — Juin 2026', duree: 'Version actuelle', detail: 'Refonte complète : 12 sections, tiers détaillés, sécurité cookies, technologies similaires' },
          { type: 'v2.0 — Juin 2026', duree: 'Version précédente', detail: 'Ajout des cookies tiers, tableau de durées, droits RGPD complets' },
          { type: 'v1.0 — Juin 2025', duree: 'Première version', detail: 'Politique initiale avec 3 catégories de cookies' },
        ],
      },
      {
        label: 'Comment sommes-nous informés des modifications ?',
        list: [
          '📧 Email envoyé aux utilisateurs inscrits en cas de modification substantielle',
          '🔔 Bandeau d\'information affiché sur le site web',
          '📅 Mise à jour de la date de révision en haut de ce document',
          '🗂️ Archivage de toutes les versions précédentes sur demande',
        ],
      },
      {
        label: 'Date de dernière mise à jour',
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

              {sub.highlight && (
                <div className={`p-4 rounded-xl ${color.bg} border ${color.border} flex gap-3`}>
                  <span className="text-xl flex-shrink-0">{sub.highlight.icon}</span>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">{sub.highlight.text}</p>
                </div>
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
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Catégorie / Type</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Durée</th>
                        <th className="px-4 py-2.5 text-left font-grotesk text-xs font-bold">Détail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sub.table.map((row, ri) => (
                        <tr key={ri} className="border-t border-border">
                          <td className="px-4 py-2.5 font-inter text-xs font-medium">{row.type}</td>
                          <td className={`px-4 py-2.5 font-mono text-xs font-bold ${color.text}`}>{row.duree}</td>
                          <td className="px-4 py-2.5 font-inter text-xs text-muted-foreground">{row.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sub.cookies && (
                <div className="flex flex-wrap gap-2">
                  {sub.cookies.map((c, ci) => (
                    <span key={ci} className={`font-mono text-[11px] px-2.5 py-1 rounded-lg ${color.bg} border ${color.border} ${color.text}`}>{c}</span>
                  ))}
                </div>
              )}

              {sub.rights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sub.rights.map((right, ri) => {
                    const RIcon = right.icon;
                    return (
                      <div key={ri} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
                        <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                          <RIcon className={`w-3.5 h-3.5 ${color.icon}`} />
                        </div>
                        <div>
                          <p className="font-grotesk font-semibold text-xs mb-0.5">{right.label}</p>
                          <p className="font-inter text-xs text-muted-foreground">{right.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {sub.browsers && (
                <div className="space-y-2">
                  {sub.browsers.map((b, bi) => (
                    <a key={bi} href={b.href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl border ${color.border} bg-card hover:${color.bg} transition-all group`}>
                      <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                        <Monitor className={`w-4 h-4 ${color.icon}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-grotesk font-semibold text-sm text-foreground">{b.name}</p>
                        <p className="font-inter text-xs text-muted-foreground">{b.desc}</p>
                      </div>
                      <ExternalLink className={`w-3.5 h-3.5 ${color.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </a>
                  ))}
                </div>
              )}

              {sub.security && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sub.security.map((item, ii) => (
                    <div key={ii} className={`rounded-xl p-3 text-center ${color.bg} border ${color.border}`}>
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="font-grotesk font-semibold text-xs mb-0.5">{item.label}</p>
                      <p className="font-inter text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {sub.resetButton && (
                <button
                  onClick={() => { localStorage.removeItem('brenne_cookie_consent'); window.location.reload(); }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border ${color.border} ${color.bg} ${color.text} font-inter text-sm font-semibold hover:opacity-80 transition-opacity`}
                >
                  <RefreshCw className="w-4 h-4" /> Réinitialiser mes préférences cookies
                </button>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CookiePage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-amber-400 border border-amber-400/30 bg-amber-400/5 px-4 py-2 rounded-full mb-6">
              <Cookie className="w-3.5 h-3.5" /> Document légal — Politique Cookies v3.0
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Politique des <span className="gradient-text">Cookies</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Transparence totale sur les cookies utilisés par Brenne Aerial, leur finalité, leur durée de vie et vos droits pour les contrôler. Conforme RGPD et recommandations CNIL.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Conforme RGPD & CNIL
              </span>
              <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" /> 4 catégories documentées
              </span>
              <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full">
                <Globe className="w-3 h-3" /> 6 partenaires identifiés
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
          className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-primary/10 border border-amber-500/20 text-center sky-glow"
        >
          <Cookie className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="font-grotesk font-bold text-xl mb-2">Une question sur nos cookies ?</h3>
          <p className="font-inter text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Notre équipe répond à toute demande relative aux cookies et à la protection de vos données dans les meilleurs délais.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:contact@brenneaerial.fr"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-grotesk font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
              <Mail className="w-4 h-4" /> Nous contacter
            </a>
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary border border-border text-sm px-5 py-2.5 rounded-xl hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4" /> CNIL — www.cnil.fr
            </a>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4 pt-4 text-xs font-inter text-muted-foreground">
          <Link to="/legal/privacy" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Politique de confidentialité
          </Link>
          <span>·</span>
          <Link to="/legal/terms" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Conditions d'utilisation
          </Link>
          <span>·</span>
          <Link to="/" className="hover:text-primary transition-colors">Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  );
}