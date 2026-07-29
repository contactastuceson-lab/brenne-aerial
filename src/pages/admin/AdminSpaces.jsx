import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Trash2, Crown, Loader2, ExternalLink, Search, Filter, PhoneOff, ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_TABS = [
  { key: 'live', label: 'En direct', color: 'text-red-400', dot: 'bg-red-500' },
  { key: 'scheduled', label: 'Programmés', color: 'text-blue-400', dot: 'bg-blue-500' },
  { key: 'ended', label: 'Terminés', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  { key: 'all', label: 'Tous', color: 'text-foreground', dot: 'bg-foreground' },
];

export default function AdminSpaces() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('live');
  const [search, setSearch] = useState('');

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['admin-spaces'],
    queryFn: () => base44.entities.Space.list('-created_date', 200),
  });

  const endMutation = useMutation({
    mutationFn: (spaceId) => base44.functions.invoke('endSpace', { spaceId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-spaces'] }); qc.invalidateQueries({ queryKey: ['spaces-live'] }); qc.invalidateQueries({ queryKey: ['spaces-scheduled'] }); toast.success('Space terminé'); },
    onError: (e) => toast.error(e?.response?.data?.error || 'Erreur lors de la fin du Space'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Space.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-spaces'] }); toast.success('Space supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const toggleOfficial = useMutation({
    mutationFn: ({ id, val }) => base44.entities.Space.update(id, { is_official: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-spaces'] }),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const filtered = spaces
    .filter(s => tab === 'all' ? true : s.status === tab)
    .filter(s => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (s.title || '').toLowerCase().includes(q) || (s.host_name || '').toLowerCase().includes(q) || (s.host_username || '').toLowerCase().includes(q);
    });

  const counts = {
    live: spaces.filter(s => s.status === 'live').length,
    scheduled: spaces.filter(s => s.status === 'scheduled').length,
    ended: spaces.filter(s => s.status === 'ended').length,
    all: spaces.length,
  };

  const handleDelete = (s) => {
    if (!confirm(`Supprimer le Space "${s.title}" ?`)) return;
    deleteMutation.mutate(s.id);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Radio className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-grotesk font-bold text-xl">Spaces Audio</h1>
          <p className="text-sm text-muted-foreground">Gérer tous les espaces audio en direct, programmés et terminés</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            <span className={`w-2 h-2 rounded-full ${t.dot}`} />
            {t.label}
            <span className={`text-xs ${tab === t.key ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre, hôte ou username…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun Space dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {s.host_avatar ? (
                    <img src={s.host_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-grotesk font-bold text-primary text-sm">{(s.host_name || 'U')[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-grotesk font-bold text-sm truncate">{s.title}</h3>
                        {s.is_official && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                            <Crown className="w-2.5 h-2.5" /> OFFICIEL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Par <span className="text-foreground font-medium">{s.host_name}</span> {s.host_username && `· @${s.host_username}`}
                      </p>
                      {s.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{s.description}</p>}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                        {s.status === 'live' && <span className="flex items-center gap-1 text-red-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> EN DIRECT</span>}
                        {s.status === 'scheduled' && s.scheduled_at && <span>Programmé · {format(new Date(s.scheduled_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>}
                        {s.status === 'ended' && s.ended_at && <span>Terminé · {format(new Date(s.ended_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>}
                        {s.started_at && s.status !== 'ended' && <span>· Début {format(new Date(s.started_at), 'HH:mm')}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {s.status === 'live' && (
                      <Button size="sm" variant="destructive" onClick={() => endMutation.mutate(s.id)} disabled={endMutation.isPending}>
                        {endMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneOff className="w-3.5 h-3.5" />}
                        Terminer
                      </Button>
                    )}
                    {s.status !== 'ended' && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/space/${s.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> Rejoindre
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s)} disabled={deleteMutation.isPending} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </Button>

                    <label className="flex items-center gap-2 ml-auto text-xs text-muted-foreground cursor-pointer select-none">
                      <Switch
                        checked={!!s.is_official}
                        onCheckedChange={(val) => toggleOfficial.mutate({ id: s.id, val })}
                        disabled={toggleOfficial.isPending}
                      />
                      <span className="flex items-center gap-1">
                        {s.is_official ? <ShieldCheck className="w-3 h-3 text-primary" /> : <ShieldOff className="w-3 h-3" />}
                        Officiel
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}