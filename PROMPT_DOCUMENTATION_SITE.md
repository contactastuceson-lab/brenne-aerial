# 🚀 PROMPT COMPLET - CRÉATION SITE DOCUMENTATION BRENNE AERIAL

Tu vas créer un **site de documentation interactif** pour Brenne Aerial qui affichera des tutoriels et guides d'utilisation. Le site doit avoir EXACTEMENT le même style et design que le site principal (brenne-aerial.com).

---

## 🎨 DESIGN & STYLE

### Couleurs & Thème
- **Thème par défaut**: Sombre "Dark Sky"
  - Background: #040a14 (bleu très foncé)
  - Texte principal: #f0f4f8 (blanc cassé)
  - Card/Surfaces: #0e1927 (bleu marine)
  
- **Couleur primaire**: #0ea5e9 (bleu ciel vif)
- **Couleur secondaire/Accent**: #7dd3fc (cyan clair)
- **Thème clair disponible**: fond #f5f9ff, texte #0f172a
- **Couleurs destructive**: #ff6b6b (rouge pour warnings)
- **Couleurs succès**: #51cf66 (vert pour tips)

### Polices
- **Titres (H1, H2, H3)**: Space Grotesk (700, 600, 500)
- **Texte courant**: Inter (400, 500)
- **Code/Monospace**: JetBrains Mono (400)
- Importer depuis Google Fonts

### Animation & Effets
- Animations fade-up (0.6s ease-out)
- Animations float (6s ease-in-out infinite)
- Border-radius: 12px (0.75rem) standard
- Shadows subtiles et cohérentes
- Transitions 200-300ms pour les interactions

### Mode Sombre & Clair
- Bouton toggle theme en haut à droite
- Persister le choix en localStorage
- CSS classe "light" pour le mode clair
- Transition smooth entre les thèmes

---

## 📐 ARCHITECTURE TECHNIQUE

### Stack
- React 18+
- Vite (construction rapide)
- Tailwind CSS (avec config personnalisée)
- React Router (navigation)
- Responsive Design (mobile-first)
- Prism.js ou highlight.js pour syntax highlighting

### Points d'entrée (Routes)
- `/` - Page d'accueil (index des docs)
- `/docs/:catégorie` - Page de catégorie
- `/docs/:catégorie/:sujet` - Pages de documentation individuelles
- `/search` - Page de recherche
- `/api/search` - Endpoint de recherche

### Dossiers & Structure
```
documentation-site/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── CategoryPage.jsx
│   │   ├── DocPage.jsx
│   │   ├── SearchPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── DocContent.jsx
│   │   ├── TableOfContents.jsx
│   │   ├── SearchBar.jsx
│   │   ├── InfoBox.jsx (Tip/Warning/Error/Info)
│   │   ├── CodeBlock.jsx
│   │   ├── Footer.jsx
│   │   └── ui/ (composants réutilisables)
│   ├── lib/
│   │   ├── docs-data.js (données de structure)
│   │   ├── search.js (logique de recherche)
│   │   └── slugify.js (pour URLs)
│   ├── hooks/
│   │   ├── useTheme.js
│   │   └── useSearch.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
│   ├── docs/
│   │   ├── compte/
│   │   ├── securite/
│   │   ├── forum/
│   │   ├── donations/
│   │   └── ... (autres)
│   ├── images/
│   └── og-image.jpg
├── tailwind.config.js
├── vite.config.js
├── index.html
├── package.json
└── README.md
```

---

## 💄 LAYOUT & COMPOSANTS PRINCIPAUX

### Header (Fixe en haut)
- **Logo "📚 Brenne Aerial Docs"** à gauche (clicable → home)
- **Barre de recherche** au centre (placeholder "Rechercher un sujet...")
- **Bouton Theme Toggle** (icône lune/soleil) à droite
- **Navigation breadcrumb** sous le header (exemple: Docs > Sécurité > Appareils connectés)
- Hauteur: 60px + 40px breadcrumb
- Shadow subtle
- Sticky (collé en haut au scroll)

### Sidebar (Gauche)
- **Largeur desktop**: 280px
- **Collapse sur mobile**: Drawer/Hamburger menu
- **Sections dépliables**: Chaque catégorie est collapsible
- **Active state**: Fond primaire (#0ea5e9) + texte blanc
- **Icônes**: Chaque catégorie a une emoji/icône
- **Smooth scroll** avec overflow-y auto
- **Padding**: 1rem
- Sur mobile: Drawer modal qui se ferme au clic

### Zone Contenu (Centre)
- **Largeur fluide**: Reste de l'espace
- **Max-width**: Optionnel 900px pour lisibilité
- **Padding**: 2rem (1rem sur mobile)
- **Contenu Markdown** rendu en HTML
- **Images responsive**: max-width 100%

### Table of Contents (Droite, Desktop only)
- **Fixe** en sticky
- **Largeur**: 250px
- **Affiche** les H2 et H3 de la page
- **Liens internes** (smooth scroll)
- **Active highlight** lors du scroll
- Sur mobile: Caché

### Footer
- **Background**: un peu plus clair que background principal
- **Contenu**: Copyright, Liens (Accueil, Contact, Légal)
- **Texte**: Petit et discret

---

## 📚 STRUCTURE DE DOCUMENTATION COMPLÈTE

### Structure de données (JSON):

```javascript
{
  categories: [
    {
      id: 'compte',
      slug: 'compte',
      label: 'Compte & Accès',
      icon: '👤',
      color: 'blue',
      description: 'Gestion de votre compte et authentification',
      order: 1,
      docs: [
        {
          id: 'creer-compte',
          slug: 'creer-compte',
          title: 'Créer un compte',
          description: 'Inscription et première utilisation',
          content: '...' // contenu markdown
        },
        {
          id: 'connexion',
          slug: 'connexion',
          title: 'Se connecter',
          description: 'Accès au compte et réinitialisation de mot de passe'
        },
        // ... autres docs
      ]
    },
    // ... autres catégories
  ]
}
```

### Catégories avec tous les sujets:

#### 1️⃣ **Compte & Accès** 👤 (5 sujets)
```
├── Créer un compte
├── Se connecter
├── Paramètres du compte
├── Changer le mot de passe
└── Authentification à deux facteurs (2FA)
```

#### 2️⃣ **Sécurité & Confidentialité** 🔒 (5 sujets)
```
├── Appareils connectés
├── RGPD & Confidentialité
├── Suppression de compte
├── Historique de sécurité (Audit Log)
└── Vérification d'adresse email
```

#### 3️⃣ **Paramètres Utilisateur** ⚙️ (5 sujets)
```
├── Préférences de langue
├── Thème (clair/sombre)
├── Mode compact
├── Notifications
└── Statut en ligne
```

#### 4️⃣ **Forum** 💬 (7 sujets)
```
├── Utiliser le forum
├── Créer un sujet
├── Répondre à un sujet
├── Marquer une solution
├── Systèmes de badges
├── Filtrer et rechercher
└── Catégories du forum
```

#### 5️⃣ **Donations & Finances** 💰 (4 sujets)
```
├── Faire une donation
├── Historique des donations
├── Reçu fiscal
└── Badges donateurs
```

#### 6️⃣ **Devis & Services** 📋 (5 sujets)
```
├── Calculer un devis
├── Demander un devis personnalisé
├── Télécharger un devis en PDF
├── Services proposés
└── Comparateur
```

#### 7️⃣ **Certification** 🎖️ (4 sujets)
```
├── Demander une certification
├── Paiement de certification
├── Statut de certification
└── Badges de certification
```

#### 8️⃣ **Profil Utilisateur** 👥 (4 sujets)
```
├── Gérer son profil
├── Photo de profil
├── Bio/Biographie
└── Badges et achievements
```

#### 9️⃣ **Messagerie & Notifications** 💬📬 (4 sujets)
```
├── Envoyer et recevoir des messages
├── Notifications
├── Notifications push
└── Emails de notification
```

#### 🔟 **Planning & Programmation** 📅 (3 sujets)
```
├── Réserver un rendez-vous
├── Gestion du planning
└── Horaires d'ouverture
```

#### 1️⃣1️⃣ **Portfolio & Galerie** 🖼️ (1 sujet)
```
└── Voir les réalisations
```

#### 1️⃣2️⃣ **Parrainage & Référral** 🤝 (2 sujets)
```
├── Système de parrainage/Référral
└── Avis de clients
```

#### 1️⃣3️⃣ **Modules Spécialisés** 🛠️ (2 sujets)
```
├── Vérification de toiture
└── Simulateur de vue
```

#### 1️⃣4️⃣ **Blog & Contenu** 📝 (2 sujets)
```
├── Blog posts
└── Annonces
```

#### 1️⃣5️⃣ **Espace Client** 🎯 (2 sujets)
```
├── Espace client
└── Suivi de commandes/projets
```

#### 1️⃣6️⃣ **À Propos & Entreprise** ℹ️ (5 sujets)
```
├── À propos de Brenne Aerial
├── Partenaires
├── Nous contacter
├── Réglementation
└── Statut du système
```

**TOTAL: 60 sujets de documentation**

---

## 🔍 RECHERCHE

### Barre de recherche
- Accessible depuis le header et page `/search`
- Placeholder: "Rechercher un sujet, une question..."
- Bouton search ou trigger avec Entrée

### Résultats de recherche
- Full-text search (titre + description + contenu)
- Autocomplete avec suggestions en dropdown
- Résultats groupés par catégorie
- Highlighting des termes matchés
- Temps réel (debounce 300-500ms)
- Affiche: Titre, catégorie, description courte

### Page `/search`
- Liste complète des résultats
- Pagination (10 par défaut)
- Tri: Pertinence / Récent / A-Z

---

## 📄 STRUCTURE D'UNE PAGE DE DOCUMENTATION

Chaque page de doc doit contenir:

### En-tête
```
[Catégorie] > [Sujet]

Titre de la page (H1)
Description courte (italic, gris)
Dernière mise à jour: [date]
```

### Table of Contents (droite)
Liste des sections H2/H3 avec liens internes

### Contenu principal
- **Sections numérotées** avec H2
- **Sous-sections** avec H3
- **Paragraphes** explicatifs
- **Listes** (ul, ol)
- **Images/Screenshots** (responsive)
- **Code blocks** avec syntax highlight
- **Encadrés info** (voir ci-dessous)
- **Tableaux** avec borders

### Encadrés informatifs (Info Boxes)

```
┌─ Info Box ─────────────────────────────────────┐
│                                                  │
│ [ℹ️] Info text goes here                       │
│ Background: bleu clair transparent              │
│ Border-left: bleu primaire 4px                  │
│                                                  │
└────────────────────────────────────────────────┘

┌─ Tip Box ──────────────────────────────────────┐
│                                                  │
│ [💡] Useful tip or best practice                │
│ Background: vert transparent                    │
│ Border-left: vert 4px                           │
│                                                  │
└────────────────────────────────────────────────┘

┌─ Warning Box ──────────────────────────────────┐
│                                                  │
│ [⚠️] Important warning or caution               │
│ Background: orange transparent                  │
│ Border-left: orange 4px                         │
│                                                  │
└────────────────────────────────────────────────┘

┌─ Error/Danger Box ─────────────────────────────┐
│                                                  │
│ [❌] Danger zone / Don't do this               │
│ Background: rouge transparent                   │
│ Border-left: rouge 4px                          │
│                                                  │
└────────────────────────────────────────────────┘

┌─ Success Box ──────────────────────────────────┐
│                                                  │
│ [✅] Great! You did it successfully            │
│ Background: vert pâle transparent               │
│ Border-left: vert 4px                           │
│                                                  │
└────────────────────────────────────────────────┘
```

### Code Blocks
```javascript
// Avec syntax highlighting
// Language badge en haut-droit (javascript, python, html, etc)
// Copy button
// Dark theme matching site

function example() {
  return "Hello World";
}
```

### Navigation bas de page
```
← Sujet précédent | Sujet suivant →
```

### Besoin d'aide?
```
┌─────────────────────────────┐
│ Besoin d'aide supplémentaire?│
│                              │
│ 📧 Contacter le support     │
│ 💬 Poser une question        │
│ 🔗 Voir les sujets liés     │
└─────────────────────────────┘
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (>1280px)
- 3 colonnes: Sidebar (280px) + Content + TOC (250px)
- Layout: grid 3 colonnes

### Tablette (768px - 1279px)
- 2 colonnes: Sidebar collapsé + Content
- TOC intégré inline ou après contenu
- Utiliser hamburger menu pour sidebar

### Mobile (<768px)
- 1 colonne: Content full width
- Sidebar: Drawer modal (0-280px)
- TOC: Caché ou accessible via dropdown
- Hamburger menu toggle

Breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

---

## ✨ FONCTIONNALITÉS BONUS

### 1. Breadcrumb Navigation
```
Docs > Compte & Accès > Se connecter
```
Chaque partie clicable

### 2. "Back to Top" Button
Button fixe en bas-droit (pour long pages)

### 3. Page d'accueil
- Grid de catégories avec icônes
- Recherche prominent
- Catégories les plus populaires
- Link vers derniers articles

### 4. Sidebar: Favoris
- Marquer une page comme "Favoris"
- Stocker en localStorage
- Accès rapide depuis sidebar

### 5. Last Updated
- Afficher "Mis à jour le [date]" en bas
- Format: "il y a 2 jours"

### 6. Analytics (optionnel)
- Tracker les pages les plus visitées
- Pour futures améliorations

### 7. Print Friendly
- Bouton "Imprimer" top-right
- Stylesheet print optimisé

### 8. Share Buttons
- Partager sur: LinkedIn, Twitter, Facebook
- Copy link button

### 9. Related Articles
- En bas: 3-4 sujets liés
- Basé sur catégorie ou tags

### 10. Feedback
- "Was this helpful?" buttons
- Récolter feedback utilisateurs

---

## 🎯 PRIORITÉS D'IMPLÉMENTATION

### Phase 1 (MVP - Essentiels):
✅ Structure de base (React + Vite)
✅ Layout 3 colonnes (Header + Sidebar + Content + TOC)
✅ Système de routing (React Router)
✅ 3 catégories principales avec contenu
✅ Recherche basique (Ctrl+K ou search box)
✅ Theme toggle (dark/light)
✅ Responsive mobile

### Phase 2 (Complet):
✅ Toutes les 16 catégories + 60 sujets
✅ Images & screenshots
✅ Code syntax highlighting
✅ Info boxes styled
✅ Navigation breadcrumb
✅ Sidebar favoris
✅ Related articles

### Phase 3 (Polish):
✅ Animations smooth
✅ Loading states
✅ Error boundaries
✅ SEO optimization
✅ Lazy loading images
✅ Print stylesheet

---

## 🛠️ OUTILS & DÉPENDANCES SUGGÉRÉES

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "lucide-react": "^latest",
    "clsx": "^2.x",
    "markdown-to-jsx": "^7.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "prism-react-renderer": "^2.x"
  }
}
```

Ou alternativement:
- `react-markdown` pour parser markdown
- `highlight.js` au lieu de Prism
- `fuse.js` pour fuzzy search

---

## 🎨 COMPOSANTS À CRÉER

### Layout Components
- `Header.jsx` - Top bar avec logo, search, theme toggle
- `Sidebar.jsx` - Navigation latérale avec catégories
- `TableOfContents.jsx` - TOC sticky droite
- `Footer.jsx` - Footer
- `Breadcrumb.jsx` - Navigation breadcrumb
- `Layout.jsx` - Wrapper principal

### Content Components
- `DocPage.jsx` - Wrapper d'une page de doc
- `DocContent.jsx` - Contenu rendu (markdown)
- `CodeBlock.jsx` - Bloc de code avec syntax highlighting
- `InfoBox.jsx` - Boîtes Info/Tip/Warning/Error/Success
- `ImageWithCaption.jsx` - Image avec légende
- `RelatedArticles.jsx` - Section d'articles liés
- `HelpBox.jsx` - Besoin d'aide?

### utility Components
- `SearchBar.jsx` - Barre de recherche
- `ThemeToggle.jsx` - Bouton theme toggle
- `Hamburger.jsx` - Menu hamburger
- `BackToTop.jsx` - Bouton retour haut
- `Skeleton.jsx` - Loading skeleton
- `Card.jsx` - Composant card générique

### Pages
- `HomePage.jsx` - Page d'accueil
- `DocPage.jsx` - Page de documentation
- `SearchPage.jsx` - Résultats search
- `NotFoundPage.jsx` - 404

---

## 📝 NOTES IMPORTANTES

✅ **Performance**: Lazy load les docs, optimiser images
✅ **SEO**: Meta tags, structured data, sitemap
✅ **Accessibilité**: ARIA labels, keyboard navigation, contrast ratios
✅ **Mobile First**: Commencer par mobile, améliorer desktop
✅ **Cohérence**: Utiliser le design system du site principal
✅ **Type Safety** (optionnel): Considérer TypeScript
✅ **Unit Tests**: Tests pour composants critiques
✅ **Error Handling**: Fallbacks si doc n'existe pas
✅ **Analytics**: Track user behavior

---

## 🚀 DEPLOYMENT

- Héberger sur Vercel, Netlify, ou GitHub Pages
- Build: `npm run build`
- Preview: `npm run preview`
- CI/CD: Auto-deploy on git push
- Domain: documentation.brenne-aerial.com (ou docs.brenne-aerial.com)

---

## 📞 SUPPORT & MAINTENANCE

- Mettre à jour les docs régulièrement
- Ajouter de nouveaux sujets au fur et à mesure
- Recueillir feedback utilisateurs
- Fixer bugs et améliorer UX

---

**FIN DU PROMPT**

Vous pouvez maintenant copier-coller ce prompt entièrement à votre assistant IA!
