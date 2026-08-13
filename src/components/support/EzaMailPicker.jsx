import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Mail, Check, Inbox, AlertCircle } from 'lucide-react';

function fmtDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function EzaMailPicker({ selectedEmails, setSelectedEmails }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getEzaMailEmails', {});
      const data = res?.data || res;
      if (data?.error) {
        if (data.needs_provisioning) {
          setError('no_mailbox');
        } else {
          setError(data.error);
        }
        setEmails([]);
      } else {
        setEmails(Array.isArray(data?.emails) ? data.emails : []);
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Chargement impossible');
      setEmails([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (m) => {
    const exists = selectedEmails.some((s) => s.id === m.id);
    if (exists) setSelectedEmails(selectedEmails.filter((s) => s.id !== m.id));
    else setSelectedEmails([...selectedEmails, { id: m.id, from: m.from, from_name: m.from_name, subject: m.subject, date: m.date, snippet: m.snippet }]);
  };

  const filtered = query.trim()
    ? emails.filter((m) => {
        const q = query.toLowerCase();
        return (m.subject || '').toLowerCase().includes(q)
          || (m.from || '').toLowerCase().includes(q)
          || (m.from_name || '').toLowerCase().includes(q)
          || (m.snippet || '').toLowerCase().includes(q);
      })
    : emails;

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Récupération de votre boîte EZA Mail…</p>
      </div>
    );
  }

  if (error === 'no_mailbox') {
    return (
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-center">
        <AlertCircle className="w-7 h-7 mx-auto mb-2 text-muted-foreground/60" />
        <p className="text-sm font-medium mb-1">Aucune boîte EZA Mail</p>
        <p className="text-xs text-muted-foreground">Activez votre boîte EZA Mail depuis l'espace utilisateur pour joindre des emails à vos tickets.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
        <p className="text-xs text-muted-foreground mb-3">{error}</p>
        <button onClick={load} className="text-xs text-primary hover:underline">Réessayer</button>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 text-center">
        <Inbox className="w-7 h-7 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">Votre boîte est vide. Aucun email à joindre.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher par expéditeur, sujet, contenu…"
        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary/40"
      />

      {selectedEmails.length > 0 && (
        <p className="text-[11px] text-primary font-medium">{selectedEmails.length} email(s) sélectionné(s)</p>
      )}

      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {filtered.map((m) => {
          const active = selectedEmails.some((s) => s.id === m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m)}
              className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-start gap-2.5 ${active ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary/15' : 'bg-secondary'}`}>
                {active ? <Check className="w-4 h-4 text-primary" /> : <Mail className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{m.from_name || m.from || '(expéditeur inconnu)'}</p>
                  <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">{fmtDate(m.date)}</span>
                </div>
                <p className="text-xs font-medium truncate">{m.subject}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.snippet}</p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">Aucun email ne correspond à « {query} ».</p>
        )}
      </div>
    </div>
  );
}