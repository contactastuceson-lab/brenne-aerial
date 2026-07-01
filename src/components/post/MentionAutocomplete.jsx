import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook: détecte un @mention en cours dans le textarea et propose des suggestions
 * Retourne { suggestions, mentionQuery, selectSuggestion }
 */
export function useMentionAutocomplete(content, textareaRef, setContent) {
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null); // null = pas en cours
  const [allUsers, setAllUsers] = useState([]);
  const debounceRef = useRef(null);

  // Charge la liste des users une fois
  useEffect(() => {
    base44.entities.User.list('-created_date', 100)
      .then(users => setAllUsers(users.filter(u => u.username)))
      .catch(() => {});
  }, []);

  // Détecte le @mention en cours depuis la position du curseur
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const cursor = el.selectionStart;
    const before = content.slice(0, cursor);
    const match = before.match(/@(\w*)$/);

    if (!match) {
      setMentionQuery(null);
      setSuggestions([]);
      return;
    }

    const query = match[1].toLowerCase();
    setMentionQuery(query);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filtered = allUsers
        .filter(u =>
          u.username?.toLowerCase().includes(query) ||
          (u.display_name || u.full_name || '').toLowerCase().includes(query)
        )
        .slice(0, 6);
      setSuggestions(filtered);
    }, 120);
  }, [content, allUsers]);

  const selectSuggestion = (user) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);
    // Remplace le @query en cours par @username
    const newBefore = before.replace(/@(\w*)$/, `@${user.username} `);
    const newContent = newBefore + after;
    setContent(newContent);
    setSuggestions([]);
    setMentionQuery(null);
    // Remet le curseur après la mention insérée
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = newBefore.length;
    }, 0);
  };

  return { suggestions, mentionQuery, selectSuggestion };
}

/**
 * Dropdown d'autocomplétion des mentions
 */
export default function MentionAutocomplete({ suggestions, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="absolute z-50 left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
      {suggestions.map(user => {
        const name = user.display_name || user.full_name || user.username;
        const initial = (name[0] || 'U').toUpperCase();
        return (
          <button
            key={user.id}
            onMouseDown={e => { e.preventDefault(); onSelect(user); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/6 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
                : <span className="text-xs font-bold text-primary">{initial}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}