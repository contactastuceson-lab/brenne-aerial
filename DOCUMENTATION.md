# EZA — Documentation complète

> Plateforme communautaire & sociale (fil, messagerie, forum, portfolio, blog, certifications, affiliations, donations) — application web progressive (PWA) publiée sur iOS/Android depuis le même code.

Cette documente couvre **uniquement les parties publiques et fonctionnelles** de l'application. La partie administration (panneaux, routes `/admin/*`, fonctions sensibles) n'est **pas** décrite ici.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Pages publiques & routes](#4-pages-publiques--routes)
5. [Fil d'actualité & réseau social](#5-fil-dactualité--réseau-social)
6. [Messagerie](#6-messagerie)
7. [Forum / Discussions](#7-forum--discussions)
8. [Portfolio](#8-portfolio)
9. [Blog & articles](#9-blog--articles)
10. [Profil & profils publics](#10-profil--profils-publics)
11. [Certifications](#11-certifications)
12. [Affiliations & Écosystème](#12-affiliations--écosystème)
13. [Business Space](#13-business-space)
14. [Enor (biographie)](#14-enor-biographie)
15. [Notifications (push, email, in-app)](#15-notifications)
16. [PWA & installation](#16-pwa--installation)
17. [Authentification](#17-authentification)
18. [Modèle de données (entités)](#18-modèle-de-données-entités)
19. [Système de design](#19-système-de-design)
20. [Intégrations & services externes](#20-intégrations--services-externes)
21. [Sécurité & confidentialité (côté utilisateur)](#21-sécurité--confidentialité)
22. [Conventions de code](#22-conventions-de-code)

---

## 1. Vue d'ensemble

**EZA** est une plateforme communautaire construite autour de plusieurs pôles :

- **Réseau social** : fil d'actualité, publications (texte, médias, GIFs, sondages), likes, réponses, mentions, hashtags, suivi d'utilisateurs.
- **Messagerie** : conversations 1-à-1 avec demandes de contact, modération, messages officiels.
- **Forum** : discussions thématiques, réponses, likes, catégories, épinglage, annonces.
- **Portfolio** : galerie de projets réalisés (immobilier, événementiel, inspection, chantier…), comparaisons avant/après, avis clients.
- **Blog** : articles d'actualité/conseils/techniques, catégories, temps de lecture.
- **Certifications** : demande de certification (questionnaire + paiement Stripe), badges de vérification.
- **Affiliations / Écosystème** : rattachement d'un utilisateur à une organisation, logos d'affiliation visibles publiquement.
- **Business Space** : espace dédié aux organisations/comptes business.
- **Donations** : soutien financier via Stripe.
- **Notifications** : push web (VAPID), email (utilisateurs enregistrés), in-app.

L'application est une **PWA** installable, responsive (mobile + desktop), avec support offline partiel, et publiable sur iOS/Android.

---

## 2. Stack technique

| Domaine | Technologie |
|---|---|
| Framework UI | React 18 + Vite (ESM) |
| Style | Tailwind CSS + shadcn/ui + design tokens CSS |
| Routing | react-router-dom v6 |
| Data fetching | @tanstack/react-query |
| Icônes | lucide-react |
| Animations | framer-motion |
| Cartes | react-leaflet + Leaflet |
| Éditeur riche | react-quill |
| Drag & drop | @hello-pangea/dnd |
| Graphiques | recharts |
| Dates | date-fns + moment |
| Markdown | react-markdown |
| 3D | three.js |
| Backend | Base44 BaaS (entités, auth, SDK, fonctions) |
| Auth | Base44 Auth (email/password, Google OAuth, OTP, reset) |
| Paiements | Stripe (certifications + donations) |
| Push | web-push (VAPID) + Firebase Cloud Messaging |

**Packages installés** (front) — seuls ceux-ci sont utilisables : React, tailwindcss, shadcn/ui, lucide-react, moment, recharts, react-quill-new, react-hook-form, react-router-dom, date-fns, lodash, react-markdown, framer-motion, three.js, react-leaflet, @hello-pangea/dnd, @tanstack/react-query, @/api/base44Client, @/utils.

---

## 3. Architecture du projet

```
src/
  App.jsx              # Routeur principal + providers (Auth, Theme, Lang, Query)
  main.jsx             # Entry point + service worker
  index.css            # Design tokens (couleurs, fonts) + utilitaires
  pages/               # Pages (publiques + autres)
    Home, About, Blog, BlogArticle, Dashboard, Discover, Messages,
    Profile, PublicProfile, Forum, DiscussionDetail, PostDetail,
    CreatePost, Search, Notifications, Premium, Portfolio, Enor,
    Ecosysteme, Business, Donation, DonationSuccess,
    CertificationSuccess, AccountDeletion, Uptime,
    legal/Privacy, Terms, Cookies
    Login, Register, ForgotPassword, ResetPassword
  components/
    ui/                # shadcn/ui primitives + composants custom (Verification, Badge, etc.)
    home/              # HomeFeed, HomeRightSidebar, HomeLeftSidebar, HomeCreatePost, SportsWidget, NextMissionWidget, DronWeatherWidget
    post/              # PostCard, CreatePost, LazyMedia, VideoPlayer, PollDisplay, PollCreator, MentionAutocomplete, GifPicker
    feed/              # FeedList, PostCard, RightSidebar, LeftSidebar, CreatePostCard
    messaging/         # MessageThread, MessageComposer, ConversationList, MessageRequestsPanel
    forum/             # DiscussionCard, NewDiscussionDialog, DiscordMarkdown, ExternalLinkModal
    portfolio/         # InteractiveMap, ReviewsSection
    shared/            # BeforeAfterSlider, ReportModal, OnboardingModal, UserProfileModal, BadgeDisplay, etc.
    settings/          # AccountSettings, NotificationSettings, PreferencesSettings, PreferencesApplier
    security/          # SecurityAndPrivacy, TwoFactorSetup, ActiveDevices, RGPDDashboard
    profile/           # CertificationRequest, ThemeSelector, DangerZone, UsernameChanger, ProfileNotFound
    layout/            # PublicLayout, SidebarLayout, AppHeader, Navbar, Footer, BottomTabBar, NavigationSkeleton, MainSkeleton, PageTransition
    auth/              # AuthBrandPanel, LoginVerificationModal, GoogleOneTap
    notifications/     # NotificationsPanel
    search/            # SearchInput, SearchUserResult, SearchPostResult, SearchTagResult
    client/            # OrganizationAffiliationsTab, MyAffiliationsTab, BillingTab
    dashboard/         # CertificationTracking, QuoteTracking, ReportTracking
    reglementation/    # ObligationsSection, ClassesDronesSection, SecuriteRGPDSection, etc.
    services/          # NeedSelector, WeatherWidget, ComboPacks, SecuritySection
    planning/          # CalendarViewSwitcher, SchedulerChat
    quote/             # AddressAutocomplete
  context/             # ThemeContext, LanguageContext
  lib/                 # utils, AuthContext, query-client, app-params, roles, hashtags, affiliationUtils, identityClick, etc.
  hooks/               # usePushNotifications, useOrganizationAffiliations, usePublicUser, useUserPreferences, useRegisterDevice, use-mobile
  api/base44Client.js  # SDK Base44 pré-initialisé

base44/
  entities/            # Schémas JSON des entités (data model)
  functions/           # Fonctions backend (entry.ts) — HTTP handlers, intégrations externes
  agents/              # Agents IA in-app (config JSON)
  connectors/          # Connecteurs OAuth (ex: outlook)
```

### Providers (App.jsx)

L'app est enveloppée par :
- `AuthProvider` (gestion de session, état d'auth, settings publics)
- `ThemeProvider` (dark/light)
- `LanguageProvider` (i18n)
- `QueryClientProvider` (react-query)
- `Router` (BrowserRouter)

Des composants globaux s'appliquent : `PreferencesApplier` (préférences utilisateur), `PwaInstallPrompt`, toasts (`Sonner` + shadcn `Toaster`).

---

## 4. Pages publiques & routes

### Routes publiques (accessibles sans connexion)

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Fil d'actualité + sidebars |
| `/about` | AboutPage | À propos |
| `/blog` | BlogPage | Liste des articles |
| `/blog/:id` | BlogArticlePage | Article complet |
| `/discover` | DiscoverPage | Découverte d'utilisateurs/sujets |
| `/portfolio` | PortfolioPage | Galerie de projets + avant/après |
| `/forum` | ForumPage | Liste des discussions |
| `/forum/:id` | DiscussionDetailPage | Discussion + réponses |
| `/enor` | EnorBiographyPage | Biographie Enor |
| `/ecosysteme` | EcosystemePage | Écosystème / affiliations |
| `/business` | BusinessSpacePage | Espace business |
| `/post/:id` | PostDetailPage | Détail d'une publication |
| `/:pathUsername` ou `/@username` | PublicProfilePage | Profil public d'un utilisateur |
| `/legal/privacy` | PrivacyPage | Politique de confidentialité |
| `/legal/terms` | TermsPage | CGU |
| `/legal/cookies` | CookiePage | Politique cookies |
| `/uptime` | UptimePage | Statut des services |
| `/donation` | DonationPage | Faire un don |
| `/donation-success` | DonationSuccessPage | Confirmation don |
| `/account-deletion` | AccountDeletionPage | Demande de suppression |

> Les chemins publics sont explicitement autorisés même sans session ; les autres redirigent vers `/login`.

### Routes authentifiées

| Route | Page |
|---|---|
| `/dashboard` | redirige vers `/profile` |
| `/messages` | MessagesPage |
| `/profile` | ProfilePage |
| `/notifications` | NotificationsPage |
| `/create-post` | CreatePostPage |
| `/search` | SearchPage |
| `/premium` | PremiumPage |
| `/certification-success` | CertificationSuccessPage |

### Routes d'authentification

`/login`, `/register`, `/forgot-password`, `/reset-password` — flux complets (email/password, Google OAuth, OTP, reset).

---

## 5. Fil d'actualité & réseau social

### Publications (`Post`)

Le fil central (`HomeFeed`) affiche les publications sociales. Une publication contient :

- **Contenu texte** (avec hashtags `#` et mentions `@username`)
- **Médias** : images, vidéos, GIFs (`media_urls`)
- **Sondages** : question + options + votes (`poll`)
- **Hashtags** extraits automatiquement
- **Mentions** extraites automatiquement
- **Likes** (`likes_count`, `liked_by`)
- **Réponses** (`replies_count`, `reply_to_id`)
- **Vues** (`views_count`)
- **Épinglage** (`is_pinned`)
- **Visibilité** : `public` ou `followers`
- **Auteur** (snapshot : nom, username, avatar, vérifications)

### Composants clés

- `PostCard` / `HomePostCard` : carte de publication (auteur, contenu, médias, actions like/reply/share, menu, édition, suppression, signalement).
- `CreatePost` / `HomeCreatePost` / `CreatePostPage` : création de publication avec upload média, GIF picker, créateur de sondage, autocomplétion de mentions.
- `PollDisplay` / `PollCreator` : sondages interactifs.
- `MentionAutocomplete` : suggestion de `@username` pendant la saisie.
- `GifPicker` : recherche de GIFs (intégration GIPHY).
- `LazyMedia` / `VideoPlayer` : chargement différé et lecture vidéo.

### Interactions

- **Like** : incrémente `likes_count`, ajoute l'ID utilisateur à `liked_by`.
- **Réponse** : crée un `Post` avec `reply_to_id` (et `reply_to_author_username`).
- **Partage** : lien de partage copié.
- **Signalement** : ouvre `ReportModal` (crée une entité `Report`).
- **Édition/Suppression** : par l'auteur ou un admin (RLS).

### Hashtags & tendances

- Les hashtags sont extraits du contenu (`extractHashtags` de `@/lib/hashtags`).
- La sidebar droite affiche les **tendances** (hashtags les plus utilisés, calculés depuis `Discussion` + `Post`).
- Recherche par hashtag via `/?tag=monTag`.

### Suivi (Follow)

- Entité `Follow` : `follower_id` / `following_id`.
- Suggestions d'utilisateurs dans la sidebar.
- Page `/discover` pour explorer.

---

## 6. Messagerie

### Conversations 1-à-1 (`ChatMessage`)

- Identifiant de conversation : emails triés alphabétiquement (`emailA_emailB`).
- Messages avec `sender_email`, `recipient_email`, `content`, `is_read`.
- **Demandes de contact** : premier message = demande (`is_request`, `request_status` : pending/accepted/declined).
- **Messages officiels** : envoyés par l'équipe (`is_official`), affichés différemment.
- **Avertissements** : messages admin (`is_warning`).
- **Notes internes** : `is_admin_note` (non visibles côté utilisateur).

### Modération (`ConversationControl`)

- Verrouillage pour les deux participants (`locked_for_all`).
- Verrouillage unilatéral (`locked_for_email`).
- Blocage unidirectionnel (`blocked_a_to_b` / `blocked_b_to_a`).
- Notes et raison de modération.

### Composants

- `ConversationList` : liste des conversations + demandes.
- `MessageThread` : fil de conversation temps réel (subscription, statut en ligne, auto-scroll, marquage lu).
- `MessageComposer` : saisie + raffinement IA (`refineMessageWithAI`).
- `MessageRequestsPanel` : demandes de contact entrantes.
- `ReportModal` : signalement d'un message/utilisateur.

### Realtime

Les messages utilisent les subscriptions temps réel du SDK Base44 (`entity.subscribe`) pour mettre à jour le fil en direct.

---

## 7. Forum / Discussions

### Discussions (`Discussion`)

- Titre, contenu, catégorie (`general`, `technique`, `aide`, `partages`, `autres`).
- Auteur (snapshot : nom, username, avatar, vérifications, badges, statut suprême).
- Tags, compteur de réponses, vues, dernière réponse.
- Verrouillage (`is_locked`), épinglage (`is_pinned`).
- Sujets officiels (`is_official`) et annonces (`is_announcement` + `announcement_text`).

### Réponses (`DiscussionReply`)

- Contenu + auteur (snapshot).
- Likes (`likes_count`, `liked_by`).
- Marquage comme solution (`is_solution`).

### Composants

- `DiscussionCard` : carte de discussion (forum).
- `NewDiscussionDialog` : création de discussion.
- `DiscordMarkdown` : rendu markdown style Discord.
- `ExternalLinkModal` : gestion des liens externes.

> Le forum existe aussi sous forme `ForumTopic` / `ForumPost` (modèle alternatif,uteur persistant même après suppression de compte).

---

## 8. Portfolio

### Page `/portfolio`

- **Hero** : titre « Portfolio EZA » + description.
- **Galerie de projets** : filtres par catégorie, grille de cartes, ouverture d'un détail (média, description, tags, avis clients).
- **Avant / Après** : comparaisons avec slider glissable (`BeforeAfterSlider`).

### Entités

- **`Project`** : titre, description, catégorie (`evenement`, `inspection`, `chantier`, `particulier`, `entreprise`, `formation`), type de média (`image`, `youtube`, `tiktok`, `instagram`, `vimeo`), URL média + miniature, tags, nom client, date de réalisation, vedette, publié, ordre.
- **`MapProject`** : projets localisés sur carte (titre, ville, catégorie `immobilier`/`mariage`/`tourisme`, lat/lng, miniature, ID YouTube, actif).
- **`BeforeAfterGallery`** : comparaison avant/après (titre, catégorie, images avant/après, labels, description, publié, ordre).
- **`Review`** : avis client sur un projet (`project_id`, auteur, note 1-5, commentaire, client vérifié).

### Rendu média

- `image` → image directe.
- `youtube` → embed iframe (extraction de l'ID).
- autres → miniature + lien externe.

### Avis clients (`ReviewsSection`)

- Note en étoiles (1-5), commentaire optionnel.
- Pour les utilisateurs connectés : pré-rempli avec leur profil ; pour les invités : saisie du nom.
- Badge « Client vérifié » (validé côté modération).
- Moyenne des notes affichée.

---

## 9. Blog & articles

### Entité `BlogPost`

- Titre, slug, extrait, contenu (HTML/Markdown), image de couverture.
- Catégorie (`actualite`, `conseil`, `technique`, `projet`, `formation`).
- Tags, auteur, publié, vues, temps de lecture.

### Pages

- `/blog` : liste des articles publiés.
- `/blog/:id` : article complet avec contenu rendu (markdown).

---

## 10. Profil & profils publics

### Profil personnel (`/profile`)

Paramètres organisés en sections :
- **Compte** (`AccountSettings`) : nom, email, avatar, bio, username.
- **Préférences** (`PreferencesSettings`) : thème, langue, mode compact.
- **Notifications** (`NotificationSettings`) : push, email, in-app.
- **Sécurité & confidentialité** (`SecurityAndPrivacy`) : 2FA, sessions actives, RGPD, suppression de compte.
- **Affiliations** (`MyAffiliationsTab`) : organisations affiliées.
- **Billing** (`BillingTab`) : abonnements/factures.
- **Suivi de certifications** (`CertificationTracking`).
- **Username** (`UsernameChanger`).
- **Danger zone** (`DangerZone`) : suppression de compte.

### Profil public (`/profile/:username` ou `/@username`)

- En-tête avec avatar, nom, username, vérifications (`VerificationIcons`), badges, statistiques.
- Publications de l'utilisateur.
- Bouton suivre / message.
- Affichage des affiliations publiques (`AffiliationModal`).

### Vérifications & badges

- `VerificationMark` / `VerificationChip` / `VerificationIcons` : affichent les badges (verified, certified, official, pro…).
- `BadgeChip` / `BadgeDisplay` / `BadgePopup` : badges (Fondateur, Pilote, VIP, Partenaire, etc.).
- Le clic sur une vérification ouvre une modale (`AffiliationModal`) ou navigue vers le profil.

---

## 11. Certifications

### Entité `CertificationRequest`

- Email, nom, statut (`pending`, `approved`, `rejected`).
- Réponses au questionnaire (`responses`).
- Date de soumission.
- Paiement (`payment_status`, IDs Stripe).
- Notes admin.

### Flux utilisateur

1. L'utilisateur remplit un questionnaire de certification.
2. Paiement Stripe (`createCertificationPayment`).
3. Confirmation par email (`sendCertificationEmail`, `sendCertificationConfirmation`, `sendCertificationPaymentConfirmation`).
4. En cas de remboursement : `refundCertification`.
5. Page de succès `/certification-success`.

### RLS

- Création : seul le propriétaire (`user_email`).
- Lecture : propriétaire ou admin.
- Update/Delete : admin uniquement.

---

## 12. Affiliations & Écosystème

### Entité `OrganizationAffiliation`

- `organizationId` / `userId`, rôle (`member` par défaut).
- Statut (`pending`, `accepted`, `rejected`, `removed`).
- Visibilité du logo (`public` / `private`).
- Snapshots : nom + avatar de l'organisation.
- Dates : création, acceptation, suppression.

### Flux

- Une organisation invite un utilisateur (ou inversement).
- L'utilisateur accepte/rejette l'affiliation.
- Si `public` + `accepted`, le logo d'affiliation apparaît sur le profil public.
- Modale d'affiliation (`AffiliationModal`) au clic sur le chip.

### Composants

- `AffiliationBadges` : badges d'affiliation sur les profils/cartes.
- `OrganizationAffiliationsTab` : vue organisation (organisations qui gèrent).
- `MyAffiliationsTab` : affiliations de l'utilisateur connecté.
- `useOrganizationAffiliations` : hook de fetch.
- `affiliationUtils` + `affiliationNotifications` : utilitaires.

### Écosystème (`/ecosysteme`)

Page présentant l'écosystème des partenaires/organisations affiliées.

---

## 13. Business Space

### Page `/business`

Espace dédié aux comptes business / organisations :
- Gestion d'organisation, affiliation de membres.
- Visibilité des logos, rôles.

> L'accès Business dans la sidebar de gauche est conditionné (`businessOnly`).

---

## 14. Enor (biographie)

### Page `/enor`

Biographie d'Enor (fondateur) — page de présentation avec timeline, crédibilité, parcours.

---

## 15. Notifications

### Trois canaux

#### 1. Notifications in-app (`Notification`)

Entité `Notification` :
- Destinataire (`user_email`), titre, contenu, type (`quote_accepted`, `new_message`, `contact_request`, `LIKE`, `REPLY`, `FOLLOW`, `MENTION`, `blog`, etc.).
- Lu/non lu (`is_read`), lien, expéditeur (snapshot), post concerné.

Pages/composants :
- `/notifications` : `NotificationsPage`.
- `NotificationsPanel` : panneau de notifications.

#### 2. Push web (VAPID)

- Entité `PushSubscription` : `user_email`, `subscription_json` (endpoint + keys), `device_name`.
- Inscription côté client (`savePushSubscription`, `usePushNotifications`).
- Envoi côté serveur (`sendWebPush`, `pushNotification`, `sendBroadcastPush`) via `web-push-browser`.
- Clés VAPID stockées en secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).

#### 3. Email

- Intégration `Core.SendEmail` (utilisateurs enregistrés uniquement).
- Fonctions dédiées : `sendWelcomeEmail`, `sendVerificationCode`, `sendCertificationEmail`, `sendBadgeAssignedEmail`, `sendDonationConfirmation`, `sendQuoteEmail`, `sendAnnouncementNotification`, etc.

> ⚠️ `SendEmail` ne peut joindre que des utilisateurs enregistrés de l'app. Pour un destinataire externe, il faut un fournisseur email supporté ou passer par les notifications in-app/push.

---

## 16. PWA & installation

### Manifeste & service worker

- `public/manifest.json` : icônes, nom, couleurs, display.
- `vite-plugin-pwa` : caching, offline, mise à jour auto.
- Service worker enregistré en production (`index.html`), avec gestion des mises à jour et rechargement.
- `public/push-sw.js` : service worker dédié aux notifications push.
- `public/firebase-messaging-sw.js` : Firebase Cloud Messaging.

### Installation

- `PwaInstallPrompt` : invite d'installation (bannière/ modal).
- Support iOS/Android via publication native depuis le même code.

### Performance mobile

- Safe areas (`env(safe-area-inset-*)`).
- `-webkit-overflow-scrolling: touch`, momentum scroll.
- Tap highlight transparent, `native-press` (scale on active).
- `backdrop-filter` désactivé sur petits écrans (perf).
- `touch-action: manipulation`.

---

## 17. Authentification

La plateforme gère l'auth backend (tokens, sessions, vérification email) — aucun code d'auth backend à écrire.

### Pages

- `Login` : email/password + Google + lien mot de passe oublié.
- `Register` : email/password/confirm + Google, puis flux OTP.
- `ForgotPassword` : email → `resetPasswordRequest` (succès générique).
- `ResetPassword` : `?token=` + nouveau mot de passe → `resetPassword`.

### Flux

- **Login** : `loginViaEmailPassword` → hard redirect (gère `returnTo`).
- **Register** : `register` (non connecté, non vérifié) → OTP → `verifyOtp` → `setToken` → hard redirect.
- **Google** : `loginWithProvider("google", fromUrl)`.
- **Reset** : `resetPasswordRequest` → email reset → `resetPassword` → redirect login.

### Protections

- `ProtectedRoute` (layout route) protège les pages authentifiées.
- Routes publiques autorisées sans session (voir §4).
- `AuthContext` : `isLoadingAuth`, `isLoadingPublicSettings`, `authError` (`user_not_registered`, `auth_required`).

### 2FA & sessions

- `TwoFactorSetup` : setup TOTP (`setupTOTP`, `verifyLoginCode`).
- `ActiveDevices` / `DeviceSession` : sessions actives, révocation.
- `useRegisterDevice` : enregistrement de l'appareil.
- RGPD dashboard (`RGPDDashboard`).

---

## 18. Modèle de données (entités)

Toutes les entités héritent de : `id`, `created_date`, `updated_date`, `created_by_id`.

### Entités sociales

| Entité | Rôle |
|---|---|
| `Post` | Publication sociale (texte, médias, sondages, likes, réponses) |
| `Discussion` | Sujet de forum |
| `DiscussionReply` | Réponse à une discussion |
| `ForumTopic` / `ForumPost` | Modèle forum alternatif (auteur persistant) |
| `Follow` | Relation de suivi |
| `ChatMessage` | Message de messagerie 1-à-1 |
| `ConversationControl` | Modération de conversation |
| `Notification` | Notification in-app |
| `Block` | Blocage d'utilisateur |

### Entités portfolio

| Entité | Rôle |
|---|---|
| `Project` | Projet du portfolio |
| `MapProject` | Projet localisé sur carte |
| `BeforeAfterGallery` | Comparaison avant/après |
| `Review` | Avis client sur un projet |

### Entités business / devis / rendez-vous

| Entité | Rôle |
|---|---|
| `Quote` | Demande de devis |
| `Appointment` | Rendez-vous (lié à un devis) |
| `BlockedDay` | Jour bloqué (indisponible/incertain) |
| `Service` | Prestation proposée |
| `BusinessHours` | Horaires d'ouverture |
| `ClientFile` | Dossier client |
| `RoofCheckup` | Inspection de toiture |
| `MapProject` | Projet cartographié |

### Entités contenu

| Entité | Rôle |
|---|---|
| `BlogPost` | Article de blog |
| `Announcement` | Annonce |
| `AppUpdate` | Mise à jour de l'app |

### Entités communautaire / certifications

| Entité | Rôle |
|---|---|
| `CertificationRequest` | Demande de certification |
| `OrganizationAffiliation` | Affiliation à une organisation |
| `Referral` | Parrainage |
| `Donation` | Don |
| `Review` | Avis |

### Entités système

| Entité | Rôle |
|---|---|
| `User` | Utilisateur (built-in, read-only côté schéma custom) |
| `AppSettings` | Paramètre global (clé/valeur) |
| `AppModuleStatus` | Statut d'un module de l'app |
| `MonitoringLog` | Log de monitoring service |
| `DeviceSession` | Session d'appareil |
| `AuditLog` | Log d'audit |
| `PushSubscription` | Abonnement push web |
| `DeletedUsername` | Username réservé (30 jours post-suppression) |
| `Employee` | Membre d'équipe |
| `Partner` | Partenaire |
| `Account` | Compte (rôles) |
| `Report` | Signalement |
| `Message` | Message (autre usage) |
| `NexusConversation` | Conversation IA |
| `DroneMaintenanceLog` | Carnet de maintenance drone |
| `DeletionRequest` | Demande de suppression de compte |

### Row-Level Security (RLS)

Plusieurs entités ont des règles RLS pour restreindre l'accès :
- **Post** : create/read ouverts ; update/delete = auteur ou admin.
- **Review** : create = auteur ou admin ; read ouvert ; update/delete = auteur ou admin.
- **CertificationRequest** : create = propriétaire ; read = propriétaire ou admin ; update/delete = admin.
- **OrganizationAffiliation** : create/read/update/delete = partie concernée (organizationId ou userId) ou statut accepted (read).
- **Project** : read public ; create/update/delete = admin.
- **User** : built-in (seuls les admins listent/modifient les autres utilisateurs).

---

## 19. Système de design

### Tokens de couleur (`src/index.css`)

Thème par défaut **Dark Sky** (palette bleu/cyan) + thème **light**.

| Token | Dark | Light |
|---|---|---|
| `--background` | `214 50% 4%` | `210 30% 97%` |
| `--foreground` | `210 20% 94%` | `215 35% 12%` |
| `--primary` | `205 90% 58%` | `205 85% 40%` |
| `--accent` | `195 80% 50%` | `195 75% 36%` |
| `--card` | `214 40% 7%` | `0 0% 100%` |
| `--muted` | `214 25% 14%` | `214 20% 91%` |
| `--border` | `214 25% 14%` | `214 18% 84%` |
| `--destructive` | `0 72% 51%` | `0 72% 51%` |

Charts : `--chart-1` à `--chart-5`. Sidebar : tokens dédiés `--sidebar-*`.

### Polices

| Token | Famille |
|---|---|
| `--font-grotesk` | Space Grotesk (titres/display) |
| `--font-inter` | Inter (corps) |
| `--font-mono` | JetBrains Mono (mono) |

Import Google Fonts en haut de `index.css`, avant `@tailwind base;`.

### Utilitaires CSS custom

- `glass` / `glass-card` : glassmorphism (blur + transparence).
- `sky-glow` / `sky-glow-text` : halos lumineux.
- `gradient-text` : texte en dégradé bleu→cyan.
- `grid-bg` : fond en grille (style drone).
- `scan-line` : animation de scan (opacity only, GPU).
- `pulse-ring` : anneau pulsé.
- `skeleton-shimmer` : shimmer des squelettes de chargement.
- `badge-founder` : badge fondateur animé (shimmer).
- `hover-lift` : élévation au hover.
- `compact-mode` : mode compact (réduit paddings/tailles).
- `video-overlay` / `video-overlay-bottom` : dégradés sur vidéos.

### Tailwind (`tailwind.config.js`)

- `darkMode: ["class"]` (toggle via classe `.dark` / `.light`).
- Couleurs mappées sur les tokens HSL.
- `safelist` pour valeurs runtime (couleurs de badges depuis entités/API).
- Animations : accordion, float, fade-up.

### Composants UI (shadcn/ui)

Disponibles dans `src/components/ui/` : button, input, textarea, select, dialog, sheet, tabs, switch, checkbox, badge, card, dropdown-menu, popover, tooltip, avatar, label, table, tabs, accordion, etc.

Composants custom notables :
- `VerificationIcon` / `VerificationMark` / `VerificationChip` : badges de vérification.
- `BadgeChip` / `BadgePopup` : badges d'utilisateur.
- `AffiliationModal` : modale d'affiliation.
- `ImageUploadOrUrl` : upload fichier ou URL.
- `Shimmer` / `StatusBadge` / `BeforeAfterSlider`.

---

## 20. Intégrations & services externes

### Intégrations Core (built-in)

| Endpoint | Usage |
|---|---|
| `InvokeLLM` | Appel LLM (prompt, JSON schema optionnel, fichiers, contexte internet) — modèles : automatic, gpt_5_mini, gemini_3_flash, claude_sonnet_4_6, etc. |
| `UploadFile` | Upload fichier public → `{file_url}` |
| `UploadPrivateFile` | Upload privé → `{file_uri}` + `CreateFileSignedUrl` |
| `GenerateImage` | Génération d'image IA |
| `GenerateSpeech` | TTS (voix : river, honey, sunny, storm, spark) |
| `GenerateVideo` | Génération vidéo IA (Veo) |
| `TranscribeAudio` | Transcription audio (Whisper) |
| `ExtractDataFromUploadedFile` | Extraction structurée (csv/xlsx/json/html/pdf/images) |
| `SendEmail` | Email aux **utilisateurs enregistrés** uniquement |

### Connecteurs OAuth

- **Outlook** (connecté) : `Calendars.ReadWrite`, `User.Read`, `offline_access` — sync rendez-vous Outlook (`syncAppointmentToOutlook`, `deleteOutlookAppointment`), webhooks created/updated/deleted.
- Connecteurs supportés (non connectés par défaut) : Google Calendar/Drive/Gmail/Sheets/Docs, Slack, Notion, Salesforce, HubSpot, GitHub, Discord, etc.

### Paiements (Stripe)

- `STRIPE_SECRET_KEY` en secrets.
- Fonctions : `createCertificationPayment`, `createDonationPayment`, `handleStripeWebhook`, `getMySubscriptions`, `cancelSubscription`, `createBillingPortal`, `refundCertification`, `syncStripeDonations`.
- Pages : `/donation`, `/donation-success`, `/premium`.

### Autres services

- **GIPHY** (`GIPHY_API_KEY`) : recherche de GIFs (`searchGifs`).
- **Firebase** (`FCM_SERVER_KEY`) : push mobile.
- **Google OAuth** (`GOOGLE_CLIENT_ID`, `google_oauth_client_secret`) : login social + One Tap (`googleOneTapAuth`).
- **Football scores** : `getFootballScores` (API externe, widget sports).

### SDK Base44 (frontend)

```js
import { base44 } from '@/api/base44Client';

// Entités
base44.entities.Post.list('-created_date', 20)
base44.entities.Post.filter({ author_id: user.id }, '-created_date', 10)
base44.entities.Post.create({ content: '...' })
base44.entities.Post.update(id, { ... })
base44.entities.Post.delete(id)
base44.entities.Post.bulkCreate([...])
base44.entities.Post.subscribe((event) => { /* realtime */ })

// Intégrations
await base44.integrations.Core.InvokeLLM({ prompt })
const { file_url } = await base44.integrations.Core.UploadFile({ file })

// Auth
await base44.auth.me()
await base44.auth.isAuthenticated()
await base44.auth.logout()
await base44.auth.updateMe({ ... })

// Analytics
base44.analytics.track({ eventName: 'user_contact_form_submit', properties: {} })

// Users (invitations)
await base44.users.inviteUser('email@example.com', 'user')

// Fonctions backend
base44.functions.invoke('getPublicUsers', {})
```

---

## 21. Sécurité & confidentialité (côté utilisateur)

### Données personnelles

- Page `/account-deletion` : demande de suppression de compte.
- Entité `DeletionRequest` + fonction `requestAccountDeletion`.
- Username réservé 30 jours après suppression (`DeletedUsername`).
- Refus possible (`refuseDeletionRequest`).

### 2FA & sessions

- Setup TOTP (`setupTOTP`), vérification (`verifyLoginCode`, `verifyEmailCode`).
- Sessions d'appareils (`DeviceSession`, `createDeviceSession`, `deleteDeviceSession`).
- `SecurityAndPrivacy` : panneau de gestion.

### RGPD

- `RGPDDashboard` : tableau de bord RGPD.
- Pages légales : `/legal/privacy`, `/legal/terms`, `/legal/cookies`.
- `CookieBanner` : bannière de consentement.

### Modération

- Signalements (`Report`) via `ReportModal`.
- Blocage d'utilisateurs (`Block`).
- Modération de conversations (`ConversationControl`).
- Messages officiels / avertissements.

### Push notifications

- Consentement explicite avant inscription push.
- Désinscription automatique des subscriptions 404/410.

---

## 22. Conventions de code

- **ESM uniquement** : pas de `require()` / `module.exports` (Vite).
- **Imports** : alias `@/` (jamais de chemins relatifs `src/`).
- **cn** : depuis `@/lib/utils`. `createPageUrl` : depuis `@/utils`.
- **shadcn** : importer chaque primitive depuis son propre fichier.
- **Icônes** : `lucide-react` uniquement, alias si collision de nom.
- **Classes Tailwind** : chaînes littérales (le purge supprime les classes dynamiques).
- **Hooks** : top-level du composant, jamais conditionnellement.
- **JSX** : uniquement `.jsx`/`.tsx`.
- **Composants** : fichiers ≤ 50 lignes, un composant par fichier, export default nommé comme le fichier.
- **Erreurs** : laissées remonter (sauf flows utilisateur form/auth qui catchent et affichent inline).
- **Tokens** : utiliser les classes mappées (`bg-primary`, `font-heading`), jamais de valeurs hardcoded (`bg-[#fff]`, inline styles de couleur).
- **Pages** : ajouter une Route dans `src/App.jsx` + import en haut.

### Analytics

```js
base44.analytics.track({ eventName: 'user_contact_form_submit', properties: { source: 'hero' } });
```
Noms d'événements indicatifs, propriétés minimales, pas de PII.

---

## Annexes

### Pages légales

- `/legal/privacy` : politique de confidentialité.
- `/legal/terms` : conditions générales d'utilisation.
- `/legal/cookies` : politique cookies.

### Pages utilitaires

- `/uptime` : statut des services (monitoring).
- `/donation` / `/donation-success` : dons Stripe.
- `/certification-success` : confirmation certification.
- `/account-deletion` : suppression de compte.

### Thèmes

- Dark (défaut) / Light — toggle via `ThemeSelector` + `ThemeContext`.
- Mode compact (`compact-mode`) via préférences.
- Langues via `LanguageContext` (i18n).

---

*Documentation générée pour EZA — couvre les fonctionnalités publiques, le modèle de données, le design system et les intégrations. La partie administration n'est pas documentée ici.*