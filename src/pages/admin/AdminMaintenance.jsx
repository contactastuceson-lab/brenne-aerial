import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Power, AlertTriangle, Save, Loader2, Wrench, Eye, Plane, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DEFAULT_SETTINGS = [
  { key: 'maintenance_mode',        label: 'Mode maintenance',         description: "Affiche la page de maintenance pour les visiteurs non-admin", type: 'boolean', value: 'false' },
  { key: 'registration_open',       label: 'Inscriptions ouvertes',    description: "Autoriser les nouvelles inscriptions", type: 'boolean', value: 'true' },
  { key: 'messaging_enabled',       label: 'Messagerie activée',       description: "Activer / désactiver la messagerie entre utilisateurs", type: 'boolean', value: 'true' },
  { key: 'discover_enabled',        label: 'Découverte activée',       description: "Activer / désactiver la page découverte", type: 'boolean', value: 'true' },
  { key: 'site_notice',             label: 'Bandeau d\'information',   description: "Message affiché en haut du site (vide = pas de bandeau)", type: 'string', value: '' },
  // Maintenance page customization
  { key: 'maintenance_message',     label: 'Message de la page maintenance', description: "Texte affiché sous le titre sur la page de maintenance", type: 'string', value: '' },
  { key: 'maintenance_progress',    label: 'Progression (%)',          description: "Pourcentage de progression affiché sur la page (0–100)", type: 'string', value: '68' },
  { key: 'maintenance_check_1',     label: 'Tâche 1 — libellé',        description: "", type: 'string', value: 'Systèmes de navigation' },
  { key: 'maintenance_check_1_done',label: 'Tâche 1 — terminée',       description: "", type: 'boolean', value: 'true' },
  { key: 'maintenance_check_2',     label: 'Tâche 2 — libellé',        description: "", type: 'string', value: 'Modules de captation 4K' },
  { key: 'maintenance_check_2_done',label: 'Tâche 2 — terminée',       description: "", type: 'boolean', value: 'true' },
  { key: 'maintenance_check_3',     label: 'Tâche 3 — libellé',        description: "", type: 'string', value: 'Interface client' },
  { key: 'maintenance_check_3_done',label: 'Tâche 3 — terminée',       description: "", type: 'boolean', value: 'false' },
  { key: 'maintenance_check_4',     label: 'Tâche 4 — libellé',        description: "", type: 'string', value: 'Déploiement final' },
  { key: 'maintenance_check_4_done',label: 'Tâche 4 — terminée',       description: "", type: 'boolean', value: 'false' },
];

const GLOBAL_KEYS = ['maintenance_mode', 'registration_open', 'messaging_enabled', 'discover_enabled', 'site_notice'];
const MAINT_KEYS  = DEFAULT_SETTINGS.map(s => s.key).filter(k => !GLOBAL_KEYS.includes(k));

export default function AdminMaintenance() {
  const qc = useQueryClient();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: dbSettings = [], isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    if (dbSettings.length > 0) {
      const map = {};
      dbSettings.forEach(s => { map[s.key] = s.value; });
      setLocalSettings(map);
    }
  }, [dbSettings]);

  const getVal = (key) => {
    const def = DEFAULT_SETTINGS.find(s => s.key === key);
    return localSettings[key] ?? def?.value ?? '';
  };

  const saveSetting = async (key) => {
    const def = DEFAULT_SETTINGS.find(s => s.key === key);
    const existing = dbSettings.find(s => s.key === key);
    const val = localSettings[key] ?? def?.value ?? '';
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, { value: val });
    } else {
      await base44.entities.AppSettings.create({ key, label: def?.label || key, description: def?.description || '', type: def?.type || 'string', value: val });
    }
  };

  const saveGroup = async (keys) => {
    setSaving(true);
    for (const key of keys) await saveSetting(key);
    qc.invalidateQueries({ queryKey: ['app-settings'] });
    toast.success('Paramètres sauvegardés');
    setSaving(false);
  };

  const toggle = (key, val) => setLocalSettings(p => ({ ...p, [key]: val ? 'true' : 'false' }));
  const setStr  = (key, val) => setLocalSettings(p => ({ ...p, [key]: val }));

  const isMaintOn = getVal('maintenance_mode') === 'true';
  const progress  = parseInt(getVal('maintenance_progress') || '68', 10);

  if (isLoading) {
    return <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl">Maintenance & Paramètres</h1>
            <p className="font-inter text-xs text-muted-foreground">Gérez le comportement global et la page de maintenance</p>
          </div>
        </div>
      </div>

      {/* Active warning */}
      {isMaintOn && (
        <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="font-inter text-sm text-yellow-300 flex-1">
            Le mode maintenance est <strong>activé</strong>. Les visiteurs voient la page de maintenance.
          </p>
          <Link to="/maintenance-preview" target="_blank">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10">
              <Eye className="w-3.5 h-3.5" /> Aperçu
            </Button>
          </Link>
        </div>
      )}

      {/* ── Section 1: Paramètres globaux ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-widest">Paramètres globaux</h2>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => saveGroup(GLOBAL_KEYS)} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Sauvegarder
          </Button>
        </div>
        <div className="space-y-3">
          {DEFAULT_SETTINGS.filter(s => GLOBAL_KEYS.includes(s.key)).map(s => (
            <div key={s.key} className={`bg-card border rounded-xl p-5 ${s.key === 'maintenance_mode' && isMaintOn ? 'border-yellow-400/40' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-inter font-medium text-sm">{s.label}</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  {s.type === 'string' && (
                    <Input
                      value={getVal(s.key)}
                      onChange={e => setStr(s.key, e.target.value)}
                      placeholder="Laisser vide pour désactiver..."
                      className="bg-secondary border-border font-inter text-sm mt-3 max-w-sm"
                    />
                  )}
                </div>
                {s.type === 'boolean' && (
                  <Switch checked={getVal(s.key) === 'true'} onCheckedChange={v => toggle(s.key, v)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Page Maintenance ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <h2 className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-widest">Personnalisation — Page Maintenance</h2>
          </div>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground" onClick={() => saveGroup(MAINT_KEYS)} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Sauvegarder
          </Button>
        </div>

        <div className="space-y-4">
          {/* Message */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-inter font-medium text-sm mb-1">Message affiché</p>
            <p className="font-inter text-xs text-muted-foreground mb-3">Texte sous le titre de la page de maintenance</p>
            <textarea
              value={getVal('maintenance_message')}
              onChange={e => setStr('maintenance_message', e.target.value)}
              rows={3}
              placeholder="Nous effectuons des améliorations pour vous offrir la meilleure expérience possible. Retour imminent."
              className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm font-inter resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-inter font-medium text-sm mb-1">Progression (%)</p>
            <p className="font-inter text-xs text-muted-foreground mb-3">Valeur affichée sur la barre de progression (0 à 100)</p>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0" max="100"
                value={getVal('maintenance_progress')}
                onChange={e => setStr('maintenance_progress', e.target.value)}
                className="w-24 bg-secondary"
              />
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
              </div>
              <span className="font-mono text-sm text-primary w-10 text-right">{progress}%</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-inter font-medium text-sm mb-1">Journal de bord — tâches</p>
            <p className="font-inter text-xs text-muted-foreground mb-4">Les 4 étapes affichées dans le journal de bord de la page</p>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Switch
                    checked={getVal(`maintenance_check_${i}_done`) === 'true'}
                    onCheckedChange={v => toggle(`maintenance_check_${i}_done`, v)}
                  />
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getVal(`maintenance_check_${i}_done`) === 'true' ? 'bg-green-400' : 'bg-secondary border border-border'}`} />
                  <Input
                    value={getVal(`maintenance_check_${i}`)}
                    onChange={e => setStr(`maintenance_check_${i}`, e.target.value)}
                    placeholder={`Tâche ${i}`}
                    className="bg-secondary flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <Plane className="w-5 h-5 text-primary flex-shrink-0" style={{ transform: 'rotate(-45deg)' }} />
            <div className="flex-1">
              <p className="font-inter text-sm font-medium">Aperçu de la page</p>
              <p className="font-inter text-xs text-muted-foreground">Activez le mode maintenance pour voir la page en conditions réelles</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary" asChild>
              <a href="/status" target="_blank">
                <Eye className="w-3.5 h-3.5" /> Voir /status
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}