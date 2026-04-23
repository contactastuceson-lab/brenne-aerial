# 🎉 Guide d'utilisation du Forum Brenne Aerial

## 📍 Accès au Forum
Le forum est accessible via:
- **URL**: `/forum`
- **Navigation**: Menu "Plus" → "Forum" (icône MessageCircle)

## ✨ Fonctionnalités Principales

### 1. **Créer un Sujet**
- Cliquez sur "Nouveau sujet" (bouton bleu/violet)
- Remplissez:
  - **Titre**: La question ou le sujet (obligatoire)
  - **Détails**: Description complète (obligatoire)
  - **Catégorie**: Sélectionnez parmi 7 catégories
  - **Tags**: Ajoutez des mots-clés (Entrée pour confirmer)
- Soumettez pour publication immédiate

### 2. **Répondre à un Sujet**
- Ouvrez un sujet par clic
- Défilez jusqu'à "Votre réponse"
- Rédigez en Markdown
- Cliquez "Publier la réponse"

### 3. **Badges Utilisateur**
- Les badges s'affichent à côté des noms d'utilisateurs
- Survolez le nom pour voir le profil complet
- Les badges sont:
  - ⭐ Vérifiés
  - 🔌 Experts
  - 👮 Modérateurs
  - 👑 Rang Suprême (rare!)

### 4. **Marquer une Solution**
*Seul l'auteur du sujet peut le faire*:
- Ouvrez le sujet
- Trouvez la réponse qui résout le problème
- Cliquez "Marquer comme solution" (checkmark)
- Le post devient vert ✓

### 5. **Filtrer & Rechercher**
- **Recherche**: Texte libre dans tous les sujets
- **Catégorie**: 7 options + "Toutes"
- **Tri**: Récents / Populaires / Plus de réponses / Sans réponse
- **Réinitialiser**: Bouton pour effacer les filtres

### 6. **Interagir avec les Posts**
- ❤️ **Liker**: Cliquez l'icône coeur
- 💬 **Répondre**: Défilez vers le bas
- ✓ **Solution**: Marquer comme réponse correcte

## 🎨 Design & Esthétique

### Couleurs par Catégorie
| Catégorie | Couleur |
|-----------|---------|
| Général | Bleu 🔵 |
| Techniques | Violet 🟣 |
| Projets | Vert 💚 |
| Services | Orange 🟠 |
| Formation | Indigo 🟦 |
| Actualités | Rouge ❤️ |
| Support | Jaune 💛 |

### Éléments Visuels
- 📌 Badge "Épinglé" = Topic important (apparaît en premier)
- 🔒 Badge "Fermé" = Plus de nouvelles réponses
- ✓ Badge "Solution" = Problème résolu (post vert)

## 👤 Profils Utilisateur

Cliquez sur n'importe quel nom d'utilisateur pour voir:
- Avatar & Bio
- Rôle (Admin, Directeur, etc.)
- Tous ses badges
- Lien vers le profil complet

## 🔧 Configuration & Données

### Entités Base44
```
ForumTopic {
  title, content, category, author, tags,
  is_pinned, is_locked, views_count, replies_count,
  created_at, updated_at, last_reply_at
}

ForumPost {
  topic_id, content, author, is_solution,
  likes_count, liked_by, edited,
  created_at, updated_at
}
```

### Catégories Disponibles
`general | techniques | projets | services | formation | actualites | support`

## 🚀 Futur & Améliorations Possibles

Créé avec extensibilité:
- ✅ Edition de posts (bouton Edit préparé)
- ✅ Suppression de posts (bouton Delete préparé)
- ✅ Notifications en temps réel
- ✅ Système de réputation (points)
- ✅ Badges personnalisés
- ✅ Modération avancée

## 📝 Notes pour les Développeurs

### Imports
```jsx
import { Forum } from '@/components/forum';
import ForumPage from '@/pages/ForumPage';
```

### Personnalisation
- **Modifier les catégories**: `base44/entities/ForumTopic.jsonc`
- **Changer les couleurs**: La dernière ligne des composants
- **Ajouter des règles**: Créer fonction dans `+rules.ts` en base44

### API Calls
Tous les appels passent par `base44Client.records`:
- `.create()` - Créer sujet/réponse
- `.update()` - Modifier, compter vues/likes
- `.filter()` - Récupérer avec filtres
- `.get()` - Récupérer 1 entité

---

**Bienvenue sur le Forum Brenne Aerial! 🚁✨**
