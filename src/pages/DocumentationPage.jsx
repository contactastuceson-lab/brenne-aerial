import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, Github, Shield, Bell, Users, MessageSquare, Map, FileText, Award, Heart, Smartphone, Lock, Database, Palette, Zap } from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview', icon: Book, title: "Vue d'ensemble",
    body: "EZA est une plateforme communautaire et sociale (PWA installable sur iOS/Android) qui regroupe un fil d'actualité, une messagerie, un forum, un portfolio, un blog, des certifications, des affiliations et des donations — le tout dans une seule application responsive.",
    items: [
      "Réseau social : publications, médias, sondages, likes, réponses, mentions, hashtags, suivi.",
      "Messagerie 1-à-1 avec demandes de contact et modération.",
      "Forum thématique avec discussions, réponses et annonces.",
      "Portfolio de projets + comparaisons avant/après + avis clients.",
      "Blog d'actualités et de conseils.",
      "Certifications, badges de vérification, affiliations d'organisations.",
    ],
  },
  {
    id: 'stack', icon: Zap, title: "Stack technique",
    body: "Application construite sur React + Vite, Tailwind CSS et shadcn/ui, avec un backend Base44 (entités, auth, fonctions, intégrations).",
    items: [
      "UI : React 18, Tailwind CSS, shadcn/ui, framer-motion, lucide-react.",
      "Data : @tanstack/react-query, SDK Base44.",
      "Routing : react-router-dom v6.",
      "Cartes : react-leaflet · Éditeur : react-quill · Graphiques : recharts.",
      "Backend : Base44 BaaS (entités, auth, fonctions backend, intégrations Core).",
      "Paiements : Stripe · Push : web-push (VAPID) + Firebase.",
    ],
  },
  {
    id: 'social', icon: Users, title: "Fil d'actualité & réseau social",
    body: "Le fil central affiche les publications. Chaque publication peut contenir du texte (hashtags et mentions), des médias (images, vidéos, GIFs), et un sondage.",
    items: [
      "Likes, réponses, vues, épinglage, visibilité (public / abonnés).",
      "Hashtags extraits automatiquement + tendances dans la sidebar.",
      "Mentions @username avec autocomplétion à la saisie.",
      "Recherche de GIFs via GIPHY.",
      "Partage par lien, signalement, édition et suppression par l'auteur.",
      "Suivi d'utilisateurs (Follow) + suggestions.",
    ],
  },
  {
    id: 'messaging', icon: MessageSquare, title: "Messagerie",
    body: "Conversations 1-à-1 avec statut en ligne, lecture en temps réel, demandes de contact et modération.",
    items: [
      "Identifiant de conversation basé sur les emails (triés).",
      "Demandes de contact : premier message = demande (accepter / refuser).",
      "Messages officiels de l'équipe et avertissements mis en forme.",
      "Modération : verrouillage, blocage unidirectionnel, notes internes.",
      "Raffinement du message par IA (composer).",
      "Marquage automatique lu + auto-scroll.",
    ],
  },
  {
    id: 'forum', icon: MessageSquare, title: "Forum / Discussions",
    body: "Discussions thématiques classées (général, technique, aide, partages, autres) avec réponses, likes et marquage de solution.",
    items: [
      "Épinglage, verrouillage, sujets officiels et annonces.",
      "Badges et vérifications de l'auteur affichés (snapshot).",
      "Rendu Markdown style Discord + gestion des liens externes.",
      "Compteurs de réponses, vues et dernière réponse.",
    ],
  },
  {
    id: 'portfolio', icon: Map, title: "Portfolio",
    body: "Galerie de projets réalisés (immobilier, événementiel, inspection, chantier, particulier, entreprise, formation) avec filtres, détail et avis clients.",
    items: [
      "Filtres par catégorie + grille de cartes cliquables.",
      "Détail : média (image / embed YouTube / lien externe), description, tags, avis.",
      "Avis clients : note en étoiles 1-5, commentaire, badge « client vérifié ».",
      "Comparaisons avant/après avec slider glissable.",
    ],
  },
  {
    id: 'blog', icon: FileText, title: "Blog & articles",
    body: "Articles d'actualité, de conseils, techniques, projets et formation.",
    items: [
      "Liste des articles publiés sur /blog.",
      "Article complet sur /blog/:id avec contenu rendu.",
      "Catégories, tags, temps de lecture, image de couverture, vues.",
    ],
  },
  {
    id: 'profile', icon: Users, title: "Profil & profils publics",
    body: "Chaque utilisateur dispose d'un profil paramétrable et d'un profil public consultable.",
    items: [
      "Paramètres : compte, préférences, notifications, sécurité, affiliations, facturation.",
      "Profil public /@username avec publications, statistiques, badges, vérifications.",
      "Badges (Fondateur, Pilote, VIP, Partenaire…) et vérifications (verified, certified, official).",
      "Affichichage des affiliations d'organisation (logo public).",
    ],
  },
  {
    id: 'certifs', icon: Award, title: "Certifications",
    body: "Un utilisateur peut demander une certification via un questionnaire puis un paiement Stripe.",
    items: [
      "Flux : questionnaire → paiement → confirmation par email.",
      "Statut : en attente, approuvé, refusé.",
      "Remboursement possible.",
      "Page de succès /certification-success.",
    ],
  },
  {
    id: 'affiliations', icon: Users, title: "Affiliations & Écosystème",
    body: "Rattachement d'un utilisateur à une organisation, avec visibilité publique du logo.",
    items: [
      "Invitation d'un utilisateur par une organisation (ou l'inverse).",
      "Statut : en attente, accepté, refusé, supprimé.",
      "Visibilité du logo (public / privé).",
      "Page Écosystème présentant les partenaires.",
    ],
  },
  {
    id: 'notifications', icon: Bell, title: "Notifications",
    body: "Trois canaux : in-app, push web, email.",
    items: [
      "In-app : entité Notification avec types (like, reply, follow, mention, message…).",
      "Push web : abonnement VAPID, envoi via service web-push, désinscription auto 404/410.",
      "Email : utilisateurs enregistrés uniquement (inscriptions, confirmations, badges).",
      "Page /notifications + panneau de notifications.",
    ],
  },
  {
    id: 'pwa', icon: Smartphone, title: "PWA & installation",
    body: "L'application est installable (iOS/Android) depuis le même code, avec support offline partiel.",
    items: [
      "Manifeste + service worker (mise à jour auto, rechargement).",
      "Invite d'installation (PwaInstallPrompt).",
      "Safe areas, momentum scroll, optimisations mobile (backdrop-filter désactivé).",
      "Service worker dédié aux notifications push.",
    ],
  },
  {
    id: 'auth', icon: Lock, title: "Authentification",
    body: "La plateforme gère l'auth backend (tokens, sessions, vérification email).",
    items: [
      "Login email/password + Google (OAuth) + One Tap.",
      "Inscription → OTP → vérification → connexion (session non vérifiée interdite).",
      "Mot de passe oublié / réinitialisation par token.",
      "2FA (TOTP), sessions d'appareils, gestion de la suppression de compte.",
      "Routes protégées via ProtectedRoute ; routes publiques accessibles sans session.",
    ],
  },
  {
    id: 'data', icon: Database, title: "Modèle de données",
    body: "Les données sont stockées dans des entités (schémas JSON) avec attributs intégrés (id, created_date, updated_date, created_by_id).",
    items: [
      "Social : Post, Discussion, DiscussionReply, Follow, ChatMessage, Notification.",
      "Portfolio : Project, MapProject, BeforeAfterGallery, Review.",
      "Contenu : BlogPost, Announcement, AppUpdate.",
      "Communauté : CertificationRequest, OrganizationAffiliation, Referral, Donation.",
      "Système : User, AppSettings, PushSubscription, DeviceSession, DeletedUsername.",
      "Sécurité par ligne (RLS) sur plusieurs entités (auteur, organisation, rôle).",
    ],
  },
  {
    id: 'design', icon: Palette, title: "Système de design",
    body: "Thème Dark Sky (bleu/cyan) par défaut + thème clair, avec tokens CSS et polices Space Grotesk / Inter / JetBrains Mono.",
    items: [
      "Tokens de couleur en HSL dans index.css (root + .light), mappés dans tailwind.config.js.",
      "Utilitaires : glass, sky-glow, gradient-text, grid-bg, scan-line, skeleton-shimmer.",
      "Composants custom : VerificationIcon, BadgeChip, AffiliationModal, ImageUploadOrUrl.",
      "Mode compact et accessibilité (reduced-motion, safe areas).",
    ],
  },
  {
    id: 'integrations', icon: Zap, title: "Intégrations & services",
    body: "Intégrations Core (LLM, upload, génération image/audio/vidéo, transcription, extraction, email) + connecteurs OAuth + Stripe.",
    items: [
      "LLM : InvokeLLM (modèles multiples, contexte internet optionnel).",
      "Paiements : Stripe (certifications, donations, abonnements, portail client).",
      "Push : web-push VAPID + Firebase Cloud Messaging.",
      "OAuth : Google (login), Outlook (sync calendrier).",
      "GIPHY (GIFs), scores de football, monitoring.",
    ],
  },
  {
    id: 'security', icon: Shield, title: "Sécurité & confidentialité",
    body: "Du côté utilisateur : gestion des données personnelles, 2FA, sessions, RGPD et modération.",
    items: [
      "Demande de suppression de compte + username réservé 30 jours.",
      "2FA (TOTP) et sessions d'appareils actives (révocation).",
      "Pages légales (confidentialité, CGU, cookies) + bannière de consentement.",
      "Signalements, blocages, modération des conversations.",
      "Consentement explicite pour les notifications push.",
    ],
  },
];

function DocNav({ sections, active, onSelect }) {
  return (
    <nav className="hidden lg:block w-60 flex-shrink-0">
      <div className="sticky top-20 space-y-1">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SectionBlock({ section, innerRef }) {
  const Icon = section.icon;
  return (
    <section ref={innerRef} id={section.id} className="scroll-mt-24 pt-8 first:pt-0">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-grotesk font-bold text-xl text-foreground">{section.title}</h2>
      </div>
      <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-3">{section.body}</p>
      <ul className="space-y-2">
        {section.items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
            <ChevronRight className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
            <span className="font-inter leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DocumentationPage() {
  const [active, setActive] = useState('overview');
  const refs = SECTIONS.reduce((acc, s) => { acc[s.id] = React.createRef(); return acc; }, {});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    Object.values(refs).forEach(r => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-[11px] tracking-[3px] uppercase text-primary/70">Documentation</span>
          </div>
          <h1 className="font-grotesk font-black text-3xl sm:text-4xl leading-tight">
            Tout ce qu'il faut savoir sur <span className="gradient-text">EZA</span>
          </h1>
          <p className="font-inter text-sm text-muted-foreground mt-3 max-w-2xl">
            Guide complet des fonctionnalités publiques : réseau social, messagerie, forum, portfolio, blog, certifications, notifications, PWA et plus encore.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-10 flex gap-8">
        <DocNav sections={SECTIONS} active={active} onSelect={scrollTo} />
        <div className="flex-1 min-w-0 max-w-3xl">
          {SECTIONS.map(s => <SectionBlock key={s.id} section={s} innerRef={refs[s.id]} />)}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="font-mono text-[10px] text-muted-foreground/40">© 2026 EZA by EZA Group · Documentation publique</p>
          </div>
        </div>
      </div>
    </div>
  );
}