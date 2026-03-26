import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Power, AlertTriangle, Save, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const DEFAULT_SETTINGS = [
  { key: 'maintenance_mode',    label: 'Mode maintenance',         description: "Affiche une page de maintenance pour les visiteurs", type: 'boolean', value: 'false' },
  { key: 'registration_open',  label: 'Inscriptions ouvertes',    description: "Autoriser les nouvelles inscriptions", type: 'boolean', value: 'true' },
  { key: 'messaging_enabled',  label: 'Messagerie activée',       description: "Activer / désactiver la messagerie entre utilisateurs", type: 'boolean', value: 'true' },
  { key: 'discover_enabled',   label: 'Découverte activée',       description: "Activer / désactiver la page découverte", type: 'boolean', value: 'true' },
  { key: 'site_notice',        label: 'Bandeau d\'information',   description: "Message affiché en haut du site (vide = pas de bandeau)", type: 'string', value: '' },
];

export default function AdminMaintenance() {
  const qc = useQueryClient();
  const [localSettings, setLocalSettings] = useState({});

  const { data: dbSettings = [], isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
    onSuccess: (data) => {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setLocalSettings(map);
    },
  });

  // Merge defaults with db
  const settings = DEFAULT_SETTINGS.map(def => {
    const dbVal = dbSettings.find(s => s.key === def.key);
    return { ...def, dbRecord: dbVal, currentValue: localSettings[def.key] ?? dbVal?.value ?? def.value };
  });

  const saveMutation = useMutation({
    mutationFn: async (setting) => {
      const existing = dbSettings.find(s => s.key === setting.key);
      if (existing) {
        await base44.entities.AppSettings.update(existing.id, { value: localSettings[setting.key] });
      } else {
        await base44.entities.AppSettings.create({ key: setting.key, label: setting.label, description: setting.description, type: setting.type, value: localSettings[setting.key] || setting.value });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Paramètre sauvegardé');
    },
  });

  const saveAll = async () => {
    for (const s of DEFAULT_SETTINGS) {
      await saveMutation.mutateAsync(s);
    }
    toast.success('Tous les paramètres sauvegardés');
  };

  const toggle = (key, val) => setLocalSettings(p => ({ ...p, [key]: val ? 'true' : 'false' }));
  const setStr = (key, val) => setLocalSettings(p => ({ ...p, [key]: val }));

  if (isLoading) {
    return <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" /> Maintenance & Paramètres
          </h1>
          <p className="font-inter text-sm text-muted-foreground">Gérez le comportement global de l'application</p>
        </div>
        <Button onClick={saveAll} disabled={saveMutation.isPending} className="bg-primary text-primary-foreground gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Tout sauvegarder
        </Button>
      </div>

      {/* Warning if maintenance on */}
      {(localSettings['maintenance_mode'] === 'true') && (
        <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="font-inter text-sm text-yellow-300">
            Le mode maintenance est <strong>activé</strong>. Les visiteurs voient une page de maintenance.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {settings.map(s => (
          <div key={s.key} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-inter font-medium text-sm">{s.label}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">{s.description}</p>
                {s.type === 'string' && (
                  <Input
                    value={localSettings[s.key] ?? s.value}
                    onChange={e => setStr(s.key, e.target.value)}
                    placeholder="Laisser vide pour désactiver..."
                    className="bg-secondary border-border font-inter text-sm mt-3 max-w-sm"
                  />
                )}
              </div>
              {s.type === 'boolean' && (
                <Switch
                  checked={(localSettings[s.key] ?? s.value) === 'true'}
                  onCheckedChange={v => toggle(s.key, v)}
                />
              )}
            </div>
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                variant="outline"
                className="border-border text-xs gap-1.5"
                onClick={() => saveMutation.mutate(s)}
                disabled={saveMutation.isPending}
              >
                <Save className="w-3 h-3" /> Sauvegarder
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}