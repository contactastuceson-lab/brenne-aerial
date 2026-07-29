import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Trash2, Crown, Loader2, ExternalLink, Search, Filter, PhoneOff, ShieldCheck, ShieldOff, Pencil, Copy, RefreshCw, CheckSquare, Square, Radio as RadioIcon, Clock, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SpaceEditDialog from '@/components/admin/spaces/SpaceEditDialog';

const STATUS_TABS = [
  { key: 'live', label: 'En direct', dot: 'bg-red-500' },
  { key: 'scheduled', label: 'Programmés', dot: 'bg-blue-500' },
  { key: 'ended', label: 'Terminés', dot: 'bg-muted-foreground' },
  { key: 'all', label: 'Tous', dot: 'bg-foreground' },
];

const SORT_OPTS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'title', label: 'Titre (A-Z)' },
  { value: 'host', label: 'Hôte (A-Z)' },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-grotesk font-bold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function durationLabel(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  if (isNaN(ms) || ms < 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}min` : ''}`;
}

export default function AdminSpaces() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('live');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [officialOnly, setOfficialOnly] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editSpace, setEditSpace] = useState(null);

  const { data: spaces = [], isLoading, refetch, isFetching } = useQuery({
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

  const bulkEnd = useMutation({
    mutationFn: async (ids) => { for (const id of ids) await base44.functions.invoke('endSpace', { spaceId: id }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-spaces'] }); toast.success(`${selected.size} Space(s) terminé(s)`); setSelected(new Set()); },
    onError: () => toast.error('Erreur lors de la fin groupée'),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids) => { for (const id of ids) await base44.entities.Space.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-spaces'] }); toast.success(`${selected.size} Space(s) supprimé(s)`); setSelected(new Set()); },
    onError: () => toast.error('Erreur lors de la suppression groupée'),
  });

  const filtered = useMemo(() => {
    let list = spaces
      .filter(s => tab === 'all' ? true : s.status === tab)
      .filter(s => officialOnly ? !!s.is_official : true)
      .filter(s => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (s.title || '').toLowerCase().includes(q) || (s.host_name || '').toLowerCase().includes(q) || (s.host_username || '').toLowerCase().includes(q);
      });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest': return new Date(a.created_date) - new Date(b.created_date);
        case 'title': return (a.title || '').localeCompare(b.title || '');
        case 'host': return (a.host_name || '').localeCompare(b.host_name || '');
        default: return new Date(b.created_date) - new Date(a.created_date);
      }
    });
    return list;
  }, [spaces, tab, officialOnly, search, sort]);

  const counts = {
    live: spaces.filter(s => s.status === 'live').length,
    scheduled: spaces.filter(s => s.status === 'scheduled').length,
    ended: spaces.filter(s => s.status === 'ended').length,
    all: spaces.length,
  };
  const officialCount = spaces.filter(s => s.is_official).length;

  const handleDelete = (s) => {
    if (!confirm(`Supprimer le Space "${s.title}" ?`)) return;
    deleteMutation.mutate(s.id);
  };

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)));
  };

  const copyLink = (s) => {
    const url = `${window.location.origin}/space/${s.id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Lien copié'));
  };

  const handleBulkDelete = () => {
    if (!confirm(`Supprimer ${selected.size} Space(s) ?`)) return;
    bulkDelete.mutate([...selected]);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Radio className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="font-grotesk font-bold text-xl">Spaces Audio</h1>
          <p className="text-sm text-muted-foreground">Gérer tous les espaces audio en direct, programmés et terminés</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={RadioIcon} label="En direct" value={counts.live} color="bg-red-500/15 text-red-400" />
        <StatCard icon={Calendar} label="Programmés" value={counts.scheduled} color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={Clock} label="Terminés" value={counts.ended} color="bg-muted-foreground/15 text-muted-foreground" />
        <StatCard icon={Crown} label="Officiels" value={officialCount} color="bg-primary/15 text-primary" />
      </div>

      {/* Status tabs */}
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

      {/* Search + sort + official filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, hôte ou username…"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background text-sm cursor-pointer select-none whitespace-nowrap">
          <Switch checked={officialOnly} onCheckedChange={setOfficialOnly} />
          <span className="flex items-center gap-1 text-muted-foreground"><Crown className="w-3.5 h-3.5" /> Officiels</span>
        </label>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium text-primary">{selected.size} sélectionné(s)</span>
          <div className="flex-1" />
          <Button size="sm" variant="destructive" onClick={() => bulkEnd.mutate([...selected])} disabled={bulkEnd.isPending}>
            {bulkEnd.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneOff className="w-3.5 h-3.5" />} Terminer
          </Button>
          <Button size="sm" variant="ghost" onClick={handleBulkDelete} disabled={bulkDelete.isPending} className="text-destructive hover:text-destructive">
            {bulkDelete.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Supprimer
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Annuler</Button>
        </div>
      )}

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
          {/* Select all */}
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-1">
            {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
            {selected.size === filtered.length && filtered.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>

          {filtered.map(s => {
            const isSel = selected.has(s.id);
            const dur = s.status === 'ended' ? durationLabel(s.started_at, s.ended_at) : null;
            return (
              <div key={s.id} className={`rounded-2xl border bg-card p-4 transition-colors ${isSel ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border hover:bg-card/80'}`}>
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(s.id)} className="mt-0.5 flex-shrink-0">
                    {isSel ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground" />}
                  </button>

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
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground flex-wrap">
                          {s.status === 'live' && <span className="flex items-center gap-1 text-red-400 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> EN DIRECT</span>}
                          {s.status === 'scheduled' && s.scheduled_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(s.scheduled_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}</span>}
                          {s.status === 'ended' && s.ended_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Terminé · {format(new Date(s.ended_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}{dur && ` · ${dur}`}</span>}
                          {s.started_at && s.status !== 'ended' && <span>· Début {format(new Date(s.started_at), 'HH:mm')}</span>}
                          {s.created_date && <span className="text-muted-foreground/50">· Créé le {format(new Date(s.created_date), "dd/MM/yy")}</span>}
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
                      <Button size="sm" variant="ghost" onClick={() => setEditSpace(s)}>
                        <Pencil className="w-3.5 h-3.5" /> Modifier
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => copyLink(s)}>
                        <Copy className="w-3.5 h-3.5" /> Lien
                      </Button>
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
            );
          })}
        </div>
      )}

      <SpaceEditDialog space={editSpace} open={!!editSpace} onClose={() => setEditSpace(null)} />
    </div>
  );
}