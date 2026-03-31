import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, MessageCircle, Compass, FileText, BookOpen, Calendar, Save, Loader2, Globe, Lock, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PAGE_SETTINGS = [
  {
    section: 'Pages',
    items: [
      { key: 'page_discover_enabled',  label: 'Page Découvrir',     icon: Compass,         description: 'Afficher / masquer la page de découverte des membres', default: 'true' },
      { key: 'page_messages_enabled',  label: 'Page Messages',      icon: MessageCircle,   description: 'Afficher / masquer le système de messagerie', default: 'true' },
      { key: 'page_quote_enabled',     label: 'Page Devis',         icon: FileText,        description: 'Activer / désactiver les demandes de devis', default: 'true' },
      { key: 'page_blog_enabled',      label: 'Page Blog',          icon: BookOpen,        description: 'Afficher / masquer le blog', default: 'true' },
      { key: 'page_planning_enabled',  label: 'Page Planning',      icon: Calendar,        description: 'Afficher / masquer la page de planning', default: 'true' },
    ]
  },
  {
    section: 'Systèmes',
    items: [
      { key: 'registration_open',     label: 'Inscriptions',        icon: Globe,           description: 'Autoriser les nouvelles inscriptions', default: 'true' },
      { key: 'messaging_enabled',     label: 'Messagerie',          icon: MessageCircle,   description: 'Activer / désactiver la messagerie entre utilisateurs', default: 'true' },
      { key: 'discover_enabled',      label: 'Découverte',          icon: Compass,         description: 'Activer / désactiver la fonctionnalité découverte', default: 'true' },
      { key: 'quotes_enabled',        label: 'Devis',               icon: FileText,        description: 'Activer / désactiver les demandes de devis', default: 'true' },
    ]
  }
];

const DISABLED_MESSAGES = {
  page_discover_enabled: 'La page Découvrir est temporairement désactivée.',
  page_messages_enabled: 'La messagerie est temporairement désactivée.',
  page_quote_enabled: 'Les demandes de devis sont temporairement désactivées.',
  page_blog_enabled: 'Le blog est temporairement désactivé.',
  page_planning_enabled: 'Le planning est temporairement désactivé.',
  messaging_enabled: 'La messagerie est désactivée.',
  discover_enabled: 'La découverte est désactivée.',
  quotes_enabled: 'Les devis sont désactivés.',
};

export default function AdminPages() {
  const qc = useQueryClient();
  const [local, setLocal] = useState({});

  const { data: dbSettings = [], isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    if (dbSettings.length > 0) {
      const map = {};
      dbSettings.forEach(s => { map[s.key] = s.value; });
      setLocal(map);
    }
  }, [dbSettings]);

  const getVal = (key, def) => (local[key] ?? def) === 'true';

  const saveMutation = useMutation({
    mutationFn: async (key) => {
      const allDefs = PAGE_SETTINGS.flatMap(s => s.items);
      const def = allDefs.find(i => i.key === key);
      const existing = dbSettings.find(s => s.key === key);
      const value = local[key] ?? def.default;
      if (existing) {
        await base44.entities.AppSettings.update(existing.id, { value });
      } else {
        await base44.entities.AppSettings.create({ key, label: def.label, type: 'boolean', value });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Sauvegardé');
    },
  });

  const toggle = (key, val) => setLocal(p => ({ ...p, [key]: val ? 'true' : 'false' }));

  if (isLoading) return <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-primary" /> Gestion des pages & systèmes
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          Activez ou désactivez les pages et fonctionnalités de l'application
        </p>
      </div>

      <div className="space-y-8">
        {PAGE_SETTINGS.map(section => (
          <div key={section.section}>
            <h2 className="font-grotesk font-semibold text-base mb-3 text-muted-foreground uppercase tracking-wider text-xs">{section.section}</h2>
            <div className="space-y-2">
              {section.items.map(item => {
                const Icon = item.icon;
                const enabled = getVal(item.key, item.default);
                return (
                  <div key={item.key} className={`bg-card border rounded-xl p-5 transition-colors ${!enabled ? 'border-destructive/20' : 'border-border'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                          <Icon className={`w-4 h-4 ${enabled ? 'text-primary' : 'text-destructive'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-inter font-medium text-sm">{item.label}</p>
                            <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${enabled ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-destructive bg-destructive/10 border-destructive/30'}`}>
                              {enabled ? 'Activé' : 'Désactivé'}
                            </span>
                          </div>
                          <p className="font-inter text-xs text-muted-foreground">{item.description}</p>
                          {!enabled && (
                            <p className="font-mono text-[10px] text-destructive/70 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Message affiché : "{DISABLED_MESSAGES[item.key]}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Switch
                          checked={enabled}
                          onCheckedChange={v => toggle(item.key, v)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-xs gap-1"
                          onClick={() => saveMutation.mutate(item.key)}
                          disabled={saveMutation.isPending}
                        >
                          {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Sauver
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}