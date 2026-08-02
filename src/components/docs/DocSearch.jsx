import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import { DOC_TOPICS, DOC_CATEGORIES } from '@/lib/docsContent';
import DocIcon from '@/components/docs/DocIcon';

const catLabel = (id) => DOC_CATEGORIES.find((c) => c.id === id)?.label || '';
const catColor = (id) => DOC_CATEGORIES.find((c) => c.id === id)?.color || '#38aadc';

function score(topic, q) {
  const title = (topic.title || '').toLowerCase();
  const tag = (topic.tagline || '').toLowerCase();
  const intro = (topic.intro || '').toLowerCase();
  if (title.startsWith(q)) return 100;
  if (title.includes(q)) return 80;
  if (tag.includes(q)) return 60;
  if (intro.includes(q)) return 40;
  return 20;
}

export default function DocSearch({
  value,
  onChange,
  onSelect,
  placeholder = 'Rechercher un guide…',
  className = '',
  inputClassName = '',
  rightSlot = null,
}) {
  const navigate = useNavigate();
  const isControlled = value !== undefined && onChange !== undefined;
  const [internal, setInternal] = useState('');
  const current = isControlled ? value : internal;
  const q = (current || '').trim().toLowerCase();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const results = !q
    ? []
    : DOC_TOPICS
        .map((t) => ({ t, s: score(t, q) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
        .map((x) => x.t);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const setVal = (v) => (isControlled ? onChange(v) : setInternal(v));

  const go = (topic) => {
    setOpen(false);
    setVal('');
    inputRef.current?.blur();
    if (onSelect) onSelect(topic);
    else navigate(`/support/documentation/${topic.slug}`);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault();
        go(results[active]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        value={current}
        onChange={(e) => { setVal(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        spellCheck={false}
      />
      {rightSlot && <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightSlot}</div>}

      {open && q && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              Aucun guide pour «&nbsp;{q}&nbsp;»
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((t, i) => {
                const c = catColor(t.cat);
                return (
                  <li key={t.slug}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(t)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${i === active ? 'bg-secondary' : ''}`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                        style={{ background: `${c}18`, borderColor: `${c}30` }}
                      >
                        <DocIcon name={t.icon} className="w-4 h-4" style={{ color: '#fff' }} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">{t.title}</span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {catLabel(t.cat)} · {t.tagline}
                        </span>
                      </span>
                      {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}