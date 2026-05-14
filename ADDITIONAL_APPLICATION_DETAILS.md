# 📋 INFORMATIONS SUPPLÉMENTAIRES - APPLICATION BRENNE AERIAL

**Ce fichier contient toutes les informations détaillées sur l'application Brenne Aerial qui n'ont pas été incluses dans le méga prompt de documentation du site.**

---

## Table des Matières
1. [Entités de Données](#entités-de-données)
2. [Fonctions Backend](#fonctions-backend)
3. [Processus Métier](#processus-métier)
4. [Système de Certification](#système-de-certification)
5. [Système de Dons](#système-de-dons)
6. [Forum et Communauté](#forum-et-communauté)
7. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
8. [Sécurité et Authentification](#sécurité-et-authentification)

---

# ENTITÉS DE DONNÉES

## 👤 User (Utilisateur)
Entité principale représentant un utilisateur de la plateforme.

**Champs principaux :**
- `role`: Rôle hiérarchique (owner, pdg_adjoint, admin, etc.)
- `avatar_url`, `cover_url`: Images de profil
- `bio`, `phone`, `location`, `website`: Informations personnelles
- `badges`: Liste de badges obtenus
- `verifications`: Vérifications effectuées
- `verified_status`: Statut de vérification ("yes"/"no")
- `account_status`: Statut du compte (active/suspended/banned/restricted)
- `department`, `title`: Informations professionnelles
- `onboarding_completed`, `email_verified`: Statuts d'inscription

## 🏆 CertificationRequest (Demande de Certification)
Gestion des demandes de certification professionnelle.

**Champs :**
- `user_email`, `user_name`: Informations de l'utilisateur
- `status`: pending/approved/rejected
- `responses`: Réponses au questionnaire de certification
- `submitted_at`: Date de soumission
- `payment_status`: Statut du paiement (pending/completed/failed)
- `admin_notes`: Notes de l'administrateur

## 💰 Donation (Don)
Système de dons pour soutenir la plateforme.

**Champs :**
- `donor_email`, `donor_name`: Informations du donateur
- `amount`: Montant en euros
- `status`: pending/completed/failed
- `stripe_session_id`: Référence Stripe
- `is_anonymous`: Don anonyme (boolean)
- `has_badge`: Attribution du badge donateur

## 💬 ForumTopic & ForumPost
Système de forum communautaire.

**ForumTopic :**
- `title`, `content`: Titre et contenu du sujet
- `category`: general/techniques/projets/services/formation/actualites/support
- `author`: Référence à l'utilisateur
- `tags`: Liste de tags
- `is_pinned`: Épinglé en haut
- `status`: open/closed/solved

**ForumPost :**
- `topic_id`: ID du sujet parent
- `content`: Contenu de la réponse
- `parent_post_id`: ID du post parent (pour réponses imbriquées)
- `is_solution`: Marquer comme solution
- `likes_count`: Nombre de likes
- `liked_by`: Liste des utilisateurs qui ont aimé
- `edited`: Post édité
- `created_at`, `updated_at`: Timestamps

## 📅 Appointment (Rendez-vous)
Gestion des rendez-vous clients.

**Champs :**
- `quote_id`: ID du devis associé
- `client_name`, `client_email`: Informations client
- `service_type`: Type de service
- `date`: Date du rendez-vous
- `time_start`, `time_end`: Horaires (format HH:MM)
- `location`: Lieu
- `status`: scheduled/confirmed/completed/cancelled
- `notes`: Notes supplémentaires
- `google_event_id`: Intégration Google Calendar

## 📋 Quote (Devis)
Système de génération de devis.

**Champs :**
- `client_name`, `client_email`, `client_phone`: Coordonnées client
- `company`: Société (optionnel)
- `service_type`: video_evenement/inspection_toiture/suivi_chantier/captation_particulier/captation_entreprise/retour_temps_reel/autre
- `date_souhaitee`: Date souhaitée
- `horaire`: Horaire souhaité
- `location`: Lieu de prestation
- `description`: Description détaillée
- `duree_estimee`: 1h/2-3h/demi-journee/journee/multi-jours
- `fichiers_urls`: Fichiers uploadés
- `prix_estime`: Prix calculé automatiquement
- `status`: pending/reviewing/accepted/refused/completed
- `admin_notes`: Notes administrateur
- `prix_final`: Prix final proposé

---

# FONCTIONS BACKEND

## Certification
- `createCertificationPayment`: Crée une session Stripe pour le paiement de certification
- `sendCertificationEmail`: Envoie des emails d'approbation/refus de certification
- `sendCertificationConfirmation`: Confirmation de certification
- `sendCertificationPaymentConfirmation`: Confirmation de paiement

## Dons
- `createDonationPayment`: Paiement de dons via Stripe
- `logDonation`: Enregistrement des dons
- `sendDonationConfirmation`: Email de confirmation
- `syncStripeDonations`: Synchronisation avec Stripe
- `addDonatorBadge`, `updateDonorBadge`: Gestion des badges donateurs

## Administration
- `adminDeleteUser`, `adminGetUsers`, `adminUpdateUser`: Gestion utilisateurs admin
- `adminSendBroadcastEmail`: Emails de diffusion
- `auditLog`: Journal d'audit

## Sécurité
- `setup2FA`, `verifyEmailCode`, `sendVerificationCode`: Authentification
- `deviceSession`: Gestion des sessions d'appareils
- `requestAccountDeletion`, `refuseDeletionRequest`: Suppression de comptes

## Notifications
- `emailNotification`, `pushNotification`: Système de notifications
- `sendWelcomeEmail`, `sendBadgeAssignedEmail`, etc.

## Autres
- `generateQuotePDF`: Génération de devis PDF
- `handleStripeWebhook`: Gestion des webhooks Stripe
- `pdgAIAgent`: Agent IA pour le PDG
- `statusCheck`: Vérification de statut

---

# PROCESSUS MÉTIER

## 🔍 Inspection de Toits (RoofCheckup)
Processus principal de l'activité de Brenne Aerial.

**Étapes :**
1. **Soumission**: Client upload une photo et fournit informations (nom, email, téléphone, adresse)
2. **Analyse IA**: Détection automatique des zones à risque (`ai_analysis`)
3. **Évaluation**: Niveau de risque (faible/modéré/élevé) - `ai_risk_level`
4. **Suivi**: Statut pending → analyzed → contacted
5. **Intervention**: Contact client pour inspection physique si nécessaire

**Entité Project** : Gestion des projets avec médias (images/vidéos), catégories (événement, inspection, chantier, etc.)

## 👥 Gestion Communautaire
1. Utilisateurs s'inscrivent et complètent l'onboarding
2. Participation au forum (`ForumTopic`, `ForumPost`)
3. Système de badges et vérifications
4. Possibilité de dons avec badges spéciaux

## 💼 Services Professionnels
1. Demandes de certification via questionnaire
2. Paiement via Stripe
3. Révision par administrateurs
4. Attribution de badges de certification

---

# SYSTÈME DE CERTIFICATION

## Processus de Certification
1. **Soumission**: L'utilisateur remplit un questionnaire détaillé
2. **Paiement**: Création d'une session Stripe (fonction `createCertificationPayment`)
3. **Révision**: Administrateurs examinent la demande
4. **Décision**: Approbation ou refus avec notes
5. **Notification**: Email automatique (`sendCertificationEmail`)
6. **Badge**: Attribution du badge de certification si approuvé

## Critères de Certification
- Expérience professionnelle
- Qualifications techniques
- Références
- Conformité réglementaire

## Gestion Administrative
- Interface admin pour révision des demandes
- Notes internes (`admin_notes`)
- Suivi des paiements
- Statistiques et rapports

---

# SYSTÈME DE DONS

## Types de Dons
- Dons uniques
- Dons récurrents (abonnements)
- Dons avec contreparties (badges, mentions)

## Processus
1. Sélection du montant
2. Paiement via Stripe (`createDonationPayment`)
3. Confirmation email (`sendDonationConfirmation`)
4. Attribution de badge donateur (`addDonatorBadge`)
5. Synchronisation avec Stripe (`syncStripeDonations`)

## Avantages Donateurs
- Badges spéciaux
- Accès anticipé à certaines fonctionnalités
- Reconnaissance publique
- Mise à jour des badges (`updateDonorBadge`)

---

# FORUM ET COMMUNAUTÉ

## Structure
- **Topics** (`ForumTopic`): Sujets de discussion
- **Posts** (`ForumPost`): Messages individuels
- **Users**: Avec rôles et badges

## Fonctionnalités
- Création de topics
- Réponses et discussions
- Système de likes/follows (`Follow`)
- Modération par administrateurs

## Intégration
- Lié au système de badges
- Notifications (`Notification`)
- Messages privés (`Message`, `ChatMessage`)

---

# GESTION DES UTILISATEURS

## Rôles Hiérarchiques
- `owner`: PDG propriétaire exclusif
- `pdg_adjoint`: PDG-Adjoint avec pouvoirs équivalents
- `admin`: Administrateur
- `conseil_admin`: Conseil d'Administration
- `directeur`: Directeur de département
- `responsable`: Responsable de service
- `collaborateur_interne`: Collaborateur interne
- `user`: Utilisateur standard
- `vip`: Utilisateur VIP
- `collaborateur`: Collaborateur externe
- `pilote`: Pilote de drone

## Statuts de Compte
- `active`: Compte actif
- `suspended`: Suspendu (temporaire)
- `banned`: Banni définitivement
- `restricted`: Restreint

## Onboarding
- Inscription avec vérification email
- Complétion du profil
- Attribution de badges initiaux
- `onboarding_completed`: Flag de completion

---

# SÉCURITÉ ET AUTHENTIFICATION

## Authentification
- Email + mot de passe
- Vérification email obligatoire
- Authentification à deux facteurs (`TwoFactorAuth`)
- Sessions d'appareils (`DeviceSession`)

## Sécurité
- Journal d'audit (`AuditLog`)
- Gestion des suppressions de comptes (`DeletionRequest`)
- Notifications de sécurité
- Conformité RGPD

## API et Intégrations
- Base44 SDK pour les fonctions backend
- Stripe pour les paiements (dons, certifications)
- Webhooks pour synchronisation des paiements
- Email service intégré pour notifications
- IA pour analyse des photos de toits (`ai_analysis`)

---

---

# 📝 GUIDE COMPLET POUR GÉNÉRER LA DOCUMENTATION TECHNIQUE

**Instructions détaillées pour une IA afin de créer la documentation complète du système Brenne Aerial.**

## 🎯 OBJECTIF
Créer une documentation exhaustive qui permet à n'importe quel développeur de comprendre et maintenir l'application Brenne Aerial sans connaissances préalables.

## 📋 STRUCTURE DE LA DOCUMENTATION À GÉNÉRER

### 1. **INTRODUCTION GÉNÉRALE**
- **Description de l'application** : Plateforme de services aériens (drones) avec inspection de toits, certifications, communauté
- **Architecture générale** : Frontend React/Vite, Backend Base44, Base de données entités JSON
- **Stack technique** : React 18, Vite, Tailwind CSS, Base44 SDK, Stripe, etc.
- **Domaines métier** : Inspection de toits IA, certifications professionnelles, dons communautaires, forum

### 2. **ARCHITECTURE TECHNIQUE DÉTAILLÉE**
- **Structure des dossiers** : Description complète de src/, base44/, public/, etc.
- **Composants React** : Liste et description de tous les composants (Header, Sidebar, etc.)
- **Entités de données** : Description détaillée de chaque entité avec tous les champs
- **Fonctions backend** : Liste complète avec descriptions fonctionnelles
- **Routing** : Toutes les routes et leur utilité
- **API et intégrations** : Base44, Stripe, webhooks, email, IA

### 3. **GUIDES UTILISATEUR**
- **Pour les clients** : Comment demander une inspection, créer un devis, prendre rendez-vous
- **Pour les professionnels** : Processus de certification, gestion des projets
- **Pour les administrateurs** : Gestion des utilisateurs, modération, statistiques
- **Pour la communauté** : Forum, dons, badges

### 4. **GUIDES DÉVELOPPEUR**
- **Installation et setup** : Commandes pour installer et lancer le projet
- **Structure du code** : Comment organiser les nouveaux composants/fonctions
- **Bonnes pratiques** : Conventions de nommage, gestion d'état, sécurité
- **Tests et déploiement** : Procédures de test, build, déploiement

### 5. **RÉFÉRENCE API**
- **Endpoints fonctionnels** : Description de chaque fonction backend avec paramètres et réponses
- **Webhooks** : Gestion des événements Stripe et autres
- **Authentification** : Système de tokens, rôles, permissions

### 6. **BASE DE DONNÉES**
- **Schéma complet** : Toutes les entités avec types, contraintes, relations
- **Migrations** : Comment ajouter/modifier des entités
- **Index et performances** : Optimisations recommandées

## 🔍 CONTENU DÉTAILLÉ À DOCUMENTER

### **ENTITÉS À DÉCRIRE** (avec tous les champs) :
- **User** : Rôles hiérarchiques, statuts, badges, vérifications
- **CertificationRequest** : Processus complet de certification
- **Donation** : Système de dons avec Stripe
- **ForumTopic & ForumPost** : Structure communautaire
- **Appointment** : Gestion des rendez-vous
- **Quote** : Système de devis PDF
- **RoofCheckup** : Inspection IA de toits
- **Project** : Gestion des projets médias
- **AuditLog, Notification, Message** : Traçabilité et communication

### **FONCTIONS À DOCUMENTER** :
- **Certification** : createCertificationPayment, sendCertificationEmail, etc.
- **Paiements** : Stripe pour dons et certifications
- **Administration** : Gestion utilisateurs, modération
- **Sécurité** : 2FA, sessions, suppression comptes
- **Notifications** : Email, push, webhooks
- **IA** : Analyse photos de toits

### **PROCESSUS MÉTIER À EXPLIQUER** :
- **Inspection toits** : Upload photo → Analyse IA → Évaluation risque → Contact client
- **Certification** : Questionnaire → Paiement → Révision admin → Badge
- **Dons** : Sélection montant → Stripe → Badge donateur → Email confirmation
- **Forum** : Création topics → Modération → Badges communauté
- **Devis** : Formulaire → Calcul prix → PDF → Suivi statut

## 📖 FORMAT DE DOCUMENTATION RECOMMANDÉ

### Structure suggérée :
```
# 🏢 BRENNE AERIAL - DOCUMENTATION TECHNIQUE COMPLÈTE

## Vue d'ensemble
- Description métier
- Architecture technique
- Stack technologique

## Pour les utilisateurs
- Guides par rôle (client, pro, admin, communauté)

## Pour les développeurs
- Installation
- Architecture détaillée
- Guides de contribution

## Référence API
- Toutes les fonctions backend
- Formats de requêtes/réponses
- Codes d'erreur

## Base de données
- Schéma complet
- Relations
- Migrations

## Annexes
- Glossaire
- FAQ
- Contacts support
```

### Style d'écriture :
- **Langage simple** : Éviter jargon technique non expliqué
- **Exemples concrets** : Captures d'écran, scénarios d'usage
- **Liens internes** : Références croisées entre sections
- **Mises à jour** : Dates de dernière modification

## 🎨 ÉLÉMENTS VISUELS À INCLURE

### Diagrammes à créer :
- **Architecture générale** : Flux entre frontend/backend/base de données
- **Processus métier** : Diagrammes de flux pour inspections, certifications, etc.
- **Structure base de données** : Schéma entité-relation
- **Arborescence dossiers** : Structure complète du projet

### Captures d'écran :
- Interfaces principales (dashboard, formulaires, forum)
- Processus étape par étape
- Interfaces admin

## ✅ CRITÈRES DE QUALITÉ

### Complétude :
- [ ] Tous les composants React documentés
- [ ] Toutes les entités décrites avec champs
- [ ] Toutes les fonctions backend référencées
- [ ] Tous les processus métier expliqués
- [ ] Toutes les intégrations documentées

### Clarté :
- [ ] Langage accessible
- [ ] Exemples pratiques
- [ ] Navigation facile
- [ ] Glossaire des termes

### Maintenabilité :
- [ ] Structure modulaire
- [ ] Mise à jour facile
- [ ] Versions trackées
- [ ] Feedback intégré

---

*Cette section donne à une IA toutes les informations nécessaires pour générer une documentation complète et professionnelle du système Brenne Aerial.*