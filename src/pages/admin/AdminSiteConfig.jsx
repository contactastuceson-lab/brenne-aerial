import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Settings, Globe, LayoutDashboard, MessageCircle, Compass, FileText, BookOpen,
  Calendar, Save, Loader2, AlertTriangle, Plane, Users, Star, Zap, Home,
  Warehouse, Calculator, Shield, Building2, ZoomIn, QrCode, Pencil, Check, BellRing,
  Copy, CheckCheck, ExternalLink, WifiOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const TABS = [
  { id: 'pages', label: 'Pages & Modules', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero & Accueil', icon: Home },
  { id: 'about', label: 'À propos', icon: Users },
  { id: 'stats', label: 'Statistiques', icon: Star },
  { id: 'garage', label: 'Garage (Drones)', icon: Warehouse },
  { id: 'calc', label: 'Calculateur', icon: Calculator },
  { id: 'regle', label: 'Réglementation', icon: Shield },
  { id: 'tools', label: 'Outils spéciaux', icon: Zap },
  { id: 'monitoring', label: 'API Monitoring', icon: Globe },
];

const PAGE_SETTINGS = [
  // Pages principales
  { key: 'page_homepage_enabled', label: 'Page Accueil', icon: Home, description: 'Page d\'accueil principale', default: 'true' },
  { key: 'page_services_enabled', label: 'Page Services', icon: Zap, description: 'Présentation des services', default: 'true' },
  { key: 'page_portfolio_enabled', label: 'Page Portfolio', icon: Star, description: 'Galerie de projets', default: 'true' },
  { key: 'page_blog_enabled', label: 'Page Blog', icon: BookOpen, description: 'Blog & actualités', default: 'true' },
  { key: 'page_contact_enabled', label: 'Page Contact', icon: Globe, description: 'Formulaire de contact', default: 'true' },
  { key: 'page_quote_enabled', label: 'Page Devis', icon: FileText, description: 'Demandes de devis', default: 'true' },
  { key: 'page_planning_enabled', label: 'Page Planning', icon: Calendar, description: 'Calendrier & rendez-vous', default: 'true' },
  // Communauté & espace client
  { key: 'page_discover_enabled', label: 'Page Découvrir', icon: Compass, description: 'Répertoire social des membres', default: 'true' },
  { key: 'page_messages_enabled', label: 'Page Messages', icon: MessageCircle, description: 'Messagerie entre membres', default: 'true' },
  { key: 'page_espace_client_enabled', label: 'Espace Client', icon: Users, description: 'Portail fichiers clients', default: 'true' },
  { key: 'page_partenaires_enabled', label: 'Page Partenaires', icon: Building2, description: 'Annuaire des partenaires', default: 'true' },
  { key: 'page_parrainage_enabled', label: 'Page Parrainage', icon: Users, description: 'Programme de parrainage', default: 'true' },
  { key: 'page_avant_apres_enabled', label: 'Page Avant/Après', icon: ZoomIn, description: 'Galerie comparaisons', default: 'true' },
  { key: 'page_certification_enabled', label: 'Page Certification', icon: Shield, description: 'Système de certification', default: 'true' },
  { key: 'page_donation_enabled', label: 'Page Donation', icon: Star, description: 'Plateforme de dons', default: 'true' },
  // Outils
  { key: 'page_garage_enabled', label: 'Page Garage', icon: Warehouse, description: 'Fiches techniques drones', default: 'true' },
  { key: 'page_calculator_enabled', label: 'Calculateur de devis', icon: Calculator, description: 'Estimateur de prix', default: 'true' },
  { key: 'page_reglementation_enabled', label: 'Réglementation', icon: Shield, description: 'Guide réglementaire drone', default: 'true' },
  { key: 'page_simulateur_enabled', label: 'Simulateur de Vue', icon: Building2, description: 'Outil immobilier étages', default: 'true' },
  { key: 'page_comparateur_enabled', label: 'Comparateur de Résolution', icon: ZoomIn, description: 'Comparaison qualité photo', default: 'true' },
  { key: 'page_flash_enabled', label: 'Flash Delivery', icon: QrCode, description: 'Portail livraison rapide', default: 'true' },
  // Paramètres globaux
  { key: 'registration_open', label: 'Inscriptions ouvertes', icon: Users, description: 'Autoriser les nouvelles inscriptions', default: 'true' },
  { key: 'messaging_enabled', label: 'Messagerie inter-membres', icon: MessageCircle, description: 'Chat entre utilisateurs', default: 'true' },
  { key: 'weather_widget_enabled', label: 'Widget Météo Drone', icon: Globe, description: 'Météo en temps réel sur l\'accueil', default: 'true' },
];

const TEXT_FIELDS = {
  hero: [
    { key: 'hero_badge', label: 'Badge hero (petit texte)', placeholder: 'Solutions drone professionnelles' },
    { key: 'hero_title_1', label: 'Titre ligne 1', placeholder: 'Services drone' },
    { key: 'hero_title_2', label: 'Titre ligne 2 (accentuée)', placeholder: 'professionnels.' },
    { key: 'hero_desc', label: 'Description', placeholder: 'Brenne Aerial propulse votre vision...', textarea: true },
    { key: 'hero_cta_primary', label: 'Bouton principal', placeholder: 'Demander un devis' },
    { key: 'hero_cta_secondary', label: 'Bouton secondaire', placeholder: 'Voir le portfolio' },
    { key: 'hero_image_url', label: 'Image de fond (URL)', placeholder: 'https://...' },
    { key: 'newsletter_url', label: 'URL Newsletter (Sendinblue etc.)', placeholder: 'https://...' },
  ],
  about: [
    { key: 'about_name', label: 'Nom du fondateur', placeholder: 'Enor Lefoulon Meyer' },
    { key: 'about_title', label: 'Titre fondateur', placeholder: 'Fondateur & PDG' },
    { key: 'about_photo_url', label: 'Photo fondateur (URL)', placeholder: 'https://...' },
    { key: 'about_headline', label: 'Titre section À propos', placeholder: 'Expertise aérienne au service de vos projets.' },
    { key: 'about_desc', label: 'Description À propos', placeholder: 'Brenne Aerial offre...', textarea: true },
  ],
  stats: [
    { key: 'stat_1_val', label: 'Stat 1 — Valeur', placeholder: '200+' },
    { key: 'stat_1_label', label: 'Stat 1 — Label', placeholder: 'Missions réalisées' },
    { key: 'stat_2_val', label: 'Stat 2 — Valeur', placeholder: '4K' },
    { key: 'stat_2_label', label: 'Stat 2 — Label', placeholder: 'Qualité vidéo' },
    { key: 'stat_3_val', label: 'Stat 3 — Valeur', placeholder: '99%' },
    { key: 'stat_3_label', label: 'Stat 3 — Label', placeholder: 'Satisfaction client' },
    { key: 'stat_4_val', label: 'Stat 4 — Valeur', placeholder: '48h' },
    { key: 'stat_4_label', label: 'Stat 4 — Label', placeholder: 'Délai de réponse' },
  ],
  garage: [
    { key: 'garage_matrice_name', label: 'Drone 1 — Nom', placeholder: "L'Aigle" },
    { key: 'garage_matrice_subtitle', label: 'Drone 1 — Modèle', placeholder: 'DJI Matrice 30T' },
    { key: 'garage_matrice_tagline', label: 'Drone 1 — Tagline', placeholder: "Pour l'industrie extrême" },
    { key: 'garage_matrice_badge', label: 'Drone 1 — Badge', placeholder: 'INDUSTRIE' },
    { key: 'garage_matrice_desc', label: 'Drone 1 — Description', placeholder: 'Notre cheval de bataille...', textarea: true },
    { key: 'garage_fpv_name', label: 'Drone 2 — Nom', placeholder: 'Le Guêpier' },
    { key: 'garage_fpv_subtitle', label: 'Drone 2 — Modèle', placeholder: 'Drone FPV Cinématique' },
    { key: 'garage_fpv_tagline', label: 'Drone 2 — Tagline', placeholder: 'La vitesse à l\'état pur' },
    { key: 'garage_fpv_badge', label: 'Drone 2 — Badge', placeholder: 'FPV' },
    { key: 'garage_fpv_desc', label: 'Drone 2 — Description', placeholder: 'Pour les séquences impossibles...', textarea: true },
    { key: 'garage_mavic_name', label: 'Drone 3 — Nom', placeholder: "L'Albatros" },
    { key: 'garage_mavic_subtitle', label: 'Drone 3 — Modèle', placeholder: 'DJI Mavic 3 Pro' },
    { key: 'garage_mavic_tagline', label: 'Drone 3 — Tagline', placeholder: "L'image parfaite, partout" },
    { key: 'garage_mavic_badge', label: 'Drone 3 — Badge', placeholder: 'CINÉMA' },
    { key: 'garage_mavic_desc', label: 'Drone 3 — Description', placeholder: 'Notre outil universel...', textarea: true },
  ],
  calc: [
    { key: 'calc_title', label: 'Titre de la page', placeholder: 'Calculateur de Devis Express' },
    { key: 'calc_desc', label: 'Description', placeholder: 'Obtenez une estimation de prix en moins de 60 secondes.' },
  ],
  regle: [
    { key: 'regle_title', label: 'Titre de la page', placeholder: 'Où peut-on voler ?' },
    { key: 'regle_desc', label: 'Description intro', placeholder: 'La réglementation drone...', textarea: true },
  ],
  tools: [
    { key: 'weather_location', label: 'Localisation météo widget', placeholder: 'Brenne, France' },
    { key: 'flash_intro', label: 'Texte intro Flash Delivery', placeholder: 'Votre contenu livré en quelques minutes...', textarea: true },
  ],
};

const APP_URL = 'https://brenneaerial.fr';

const MONITORING_CATEGORIES = [
  {
    category: 'Général',
    links: [
      { label: 'Résumé de tous les modules', url: `${APP_URL}/api/functions/statusCheck`, desc: 'Retourne l\'état (activé/désactivé) de tous les modules de la plateforme.' },
      { label: 'État global du site', url: `${APP_URL}/api/functions/statusCheck?module=site`, desc: 'Vérifie si le site est en maintenance (503) ou opérationnel (200).' },
    ],
  },
  {
    category: 'Pages principales',
    links: [
      { label: 'Accueil', url: `${APP_URL}/api/functions/statusCheck?module=homepage`, desc: 'Page d\'accueil principale.' },
      { label: 'Services', url: `${APP_URL}/api/functions/statusCheck?module=services`, desc: 'Page des services drone.' },
      { label: 'Portfolio', url: `${APP_URL}/api/functions/statusCheck?module=portfolio`, desc: 'Galerie de projets.' },
      { label: 'Blog', url: `${APP_URL}/api/functions/statusCheck?module=blog`, desc: 'Blog & actualités.' },
      { label: 'Contact', url: `${APP_URL}/api/functions/statusCheck?module=contact`, desc: 'Formulaire de contact.' },
      { label: 'Devis', url: `${APP_URL}/api/functions/statusCheck?module=quote`, desc: 'Demandes de devis.' },
      { label: 'Planning', url: `${APP_URL}/api/functions/statusCheck?module=planning`, desc: 'Calendrier & rendez-vous.' },
    ],
  },
  {
    category: 'Communauté & Espace client',
    links: [
      { label: 'Découvrir', url: `${APP_URL}/api/functions/statusCheck?module=discover`, desc: 'Répertoire social des membres.' },
      { label: 'Messagerie', url: `${APP_URL}/api/functions/statusCheck?module=messagerie`, desc: 'Messagerie entre membres.' },
      { label: 'Espace Client', url: `${APP_URL}/api/functions/statusCheck?module=espace_client`, desc: 'Portail fichiers clients.' },
      { label: 'Partenaires', url: `${APP_URL}/api/functions/statusCheck?module=partenaires`, desc: 'Annuaire des partenaires.' },
      { label: 'Parrainage', url: `${APP_URL}/api/functions/statusCheck?module=parrainage`, desc: 'Programme de parrainage.' },
      { label: 'Avant / Après', url: `${APP_URL}/api/functions/statusCheck?module=avant_apres`, desc: 'Galerie comparaisons.' },
      { label: 'Certification', url: `${APP_URL}/api/functions/statusCheck?module=certification`, desc: 'Système de certification.' },
      { label: 'Donation', url: `${APP_URL}/api/functions/statusCheck?module=donation`, desc: 'Plateforme de dons.' },
    ],
  },
  {
    category: 'Outils',
    links: [
      { label: 'Garage', url: `${APP_URL}/api/functions/statusCheck?module=garage`, desc: 'Fiches techniques drones.' },
      { label: 'Calculateur', url: `${APP_URL}/api/functions/statusCheck?module=calculateur`, desc: 'Estimateur de prix.' },
      { label: 'Réglementation', url: `${APP_URL}/api/functions/statusCheck?module=reglementation`, desc: 'Guide réglementaire drone.' },
      { label: 'Simulateur de Vue', url: `${APP_URL}/api/functions/statusCheck?module=simulateur`, desc: 'Outil immobilier étages.' },
      { label: 'Comparateur Résolution', url: `${APP_URL}/api/functions/statusCheck?module=comparateur`, desc: 'Comparaison qualité photo.' },
      { label: 'Flash Delivery', url: `${APP_URL}/api/functions/statusCheck?module=flash`, desc: 'Portail livraison rapide.' },
    ],
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
      title="Copier"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MonitoringAPISection() {
  const [filter, setFilter] = useState('');

  const filteredCategories = MONITORING_CATEGORIES.map(cat => ({
    ...cat,
    links: cat.links.filter(l =>
      l.label.toLowerCase().includes(filter.toLowerCase()) ||
      l.url.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter(cat => cat.links.length > 0);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header info */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-inter font-semibold text-sm mb-1">Endpoints de monitoring API</p>
          <p className="font-inter text-xs text-muted-foreground leading-relaxed">
            Ces URLs peuvent être utilisées par Better Stack, UptimeRobot ou tout autre outil de monitoring externe.
            Un code <span className="font-mono text-green-400 bg-green-400/10 px-1 rounded">200</span> indique un service actif,
            un code <span className="font-mono text-destructive bg-destructive/10 px-1 rounded">503</span> indique qu'il est désactivé.
          </p>
          <a href="https://statut.brenneaerial.org" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 font-inter text-xs text-primary hover:underline">
            <ExternalLink className="w-3 h-3" /> Tableau de bord Better Stack
          </a>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Rechercher un endpoint..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="bg-secondary border-border text-sm"
      />

      {/* Links by category */}
      <div className="space-y-6">
        {filteredCategories.map(cat => (
          <div key={cat.category}>
            <p className="font-grotesk font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {cat.category}
            </p>
            <div className="space-y-2">
              {cat.links.map((link, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-inter font-medium text-sm">{link.label}</p>
                      <p className="font-inter text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary flex-shrink-0">GET</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2">
                    <code className="font-mono text-xs text-muted-foreground flex-1 truncate">{link.url}</code>
                    <CopyButton text={link.url} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingField({ field, value, onChange, onSave, saving }) {
  const [local, setLocal] = useState(value || '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setLocal(value || ''); setDirty(false); }, [value]);

  const handleChange = (v) => { setLocal(v); setDirty(true); };
  const handleSave = () => { onChange(local); onSave(field.key, local); setDirty(false); };

  return (
    <div className="space-y-1">
      <label className="font-inter text-xs text-muted-foreground">{field.label}</label>
      <div className="flex gap-2">
        {field.textarea ? (
          <Textarea
            value={local}
            onChange={e => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-secondary border-border resize-none h-20 text-sm flex-1"
          />
        ) : (
          <Input
            value={local}
            onChange={e => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-secondary border-border text-sm flex-1"
          />
        )}
        <Button
          size="sm"
          variant={dirty ? 'default' : 'outline'}
          className={`flex-shrink-0 px-3 ${dirty ? 'bg-primary' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : dirty ? <Save className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSiteConfig() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('pages');
  const [local, setLocal] = useState({});
  const [savingKeys, setSavingKeys] = useState(new Set());

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

  const saveSetting = async (key, value, def = null) => {
    setSavingKeys(prev => new Set(prev).add(key));
    const existing = dbSettings.find(s => s.key === key);
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, { value: String(value) });
    } else {
      await base44.entities.AppSettings.create({ key, label: key, type: typeof value === 'boolean' ? 'boolean' : 'string', value: String(value) });
    }
    qc.invalidateQueries({ queryKey: ['app-settings'] });
    setSavingKeys(prev => { const s = new Set(prev); s.delete(key); return s; });
    toast.success('Sauvegardé');
  };

  const [sendingAlert, setSendingAlert] = useState(false);

  const [sendingOfflineAlert, setSendingOfflineAlert] = useState(false);

  const togglePage = async (key, val) => {
    setLocal(p => ({ ...p, [key]: val ? 'true' : 'false' }));
    await saveSetting(key, val ? 'true' : 'false');

    // Si on active le mode hors ligne → notifier tous les utilisateurs
    if (key === 'site_offline' && val === true) {
      setSendingOfflineAlert(true);
      base44.functions.invoke('notifyPageDisabled', { mode: 'site_offline' })
        .then(res => toast.success(`🚨 Panne générale détectée — ${res?.data?.notified ?? 0} utilisateur(s) notifié(s)`))
        .catch(() => {})
        .finally(() => setSendingOfflineAlert(false));
    }
  };

  const [sendingUp, setSendingUp] = useState(false);

  const sendPanneAlert = async () => {
    const downServices = PAGE_SETTINGS
      .map(s => s.key)
      .filter(key => (local[key] ?? 'true') === 'false');

    if (downServices.length === 0) {
      toast.info('Aucun service désactivé en ce moment.');
      return;
    }

    setSendingAlert(true);
    base44.functions.invoke('notifyPageDisabled', { mode: 'summary', downServices })
      .then(res => {
        toast.success(`🚨 Alerte envoyée à ${res?.data?.notified ?? 0} utilisateur(s)`);
      })
      .catch(err => toast.error(`Erreur: ${err.message}`))
      .finally(() => setSendingAlert(false));
  };

  const sendRetablissementAlert = async () => {
    const upServices = PAGE_SETTINGS
      .map(s => s.key)
      .filter(key => (local[key] ?? 'true') === 'true');

    if (upServices.length === 0) {
      toast.info('Aucun service actif en ce moment.');
      return;
    }

    setSendingUp(true);
    base44.functions.invoke('notifyPageDisabled', { mode: 'retablissement', upServices })
      .then(res => {
        toast.success(`✅ Email retour envoyé à ${res?.data?.notified ?? 0} utilisateur(s)`);
      })
      .catch(err => toast.error(`Erreur: ${err.message}`))
      .finally(() => setSendingUp(false));
  };

  const getVal = (key, def = 'true') => (local[key] ?? def) === 'true';
  const getStr = (key) => local[key] || '';

  const fieldsForTab = TEXT_FIELDS[activeTab] || [];

  if (isLoading) return <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" /> Gestion du Site
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">Configurez l'intégralité du contenu et des fonctionnalités de votre site</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8 p-1 bg-secondary/50 rounded-xl w-fit max-w-full">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-inter text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Pages tab */}
      {activeTab === 'pages' && (
        <div className="space-y-2">
          {/* ── SITE OFFLINE TOGGLE ── */}
          {(() => {
            const isOffline = getVal('site_offline', 'false');
            return (
              <div className={`flex items-center justify-between p-4 rounded-xl border mb-2 transition-all ${isOffline ? 'bg-red-950/40 border-red-500/50' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOffline ? 'bg-red-500/20' : 'bg-muted'}`}>
                    <WifiOff className={`w-5 h-5 ${isOffline ? 'text-red-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-inter font-bold text-sm">Mode hors ligne</p>
                      {isOffline && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold animate-pulse">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-xs text-muted-foreground">
                      {isOffline
                        ? '⚠️ Le site affiche une page grise "hors service" à tous les visiteurs. Seuls les admins voient le site normal.'
                        : 'Active un écran gris de panne pour tous les visiteurs + retourne 503 sur tous les endpoints de monitoring.'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isOffline}
                  onCheckedChange={v => togglePage('site_offline', v)}
                />
              </div>
            );
          })()}

          {/* Bouton alerte panne */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-inter font-semibold text-sm">Envoyer une alerte de panne</p>
                <p className="font-inter text-xs text-muted-foreground">Envoie un email récapitulatif de tous les services actuellement désactivés</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={sendPanneAlert}
                disabled={sendingAlert}
              >
                {sendingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
                {sendingAlert ? 'Envoi...' : 'Alerte panne'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-green-500/40 text-green-400 hover:bg-green-500/10"
                onClick={sendRetablissementAlert}
                disabled={sendingUp}
              >
                {sendingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellRing className="w-3.5 h-3.5" />}
                {sendingUp ? 'Envoi...' : 'Retour des systèmes'}
              </Button>
            </div>
          </div>
          {PAGE_SETTINGS.map(item => {
            const Icon = item.icon;
            const enabled = getVal(item.key, item.default);
            return (
              <div key={item.key} className={`bg-card border rounded-xl p-4 transition-colors ${!enabled ? 'border-destructive/20' : 'border-border'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-primary/10' : 'bg-destructive/10'}`}>
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
                    </div>
                  </div>
                  <Switch checked={enabled} onCheckedChange={v => togglePage(item.key, v)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monitoring API tab */}
      {activeTab === 'monitoring' && <MonitoringAPISection />}

      {/* Text content tabs */}
      {activeTab !== 'pages' && activeTab !== 'monitoring' && fieldsForTab.length > 0 && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Pencil className="w-4 h-4 text-primary" />
              <p className="font-inter font-semibold text-sm">Modifier le contenu</p>
            </div>
            <div className="space-y-4">
              {fieldsForTab.map(field => (
                <SettingField
                  key={field.key}
                  field={field}
                  value={getStr(field.key)}
                  onChange={val => setLocal(p => ({ ...p, [field.key]: val }))}
                  onSave={saveSetting}
                  saving={savingKeys.has(field.key)}
                />
              ))}
            </div>
          </div>
          <div className="bg-secondary/40 border border-border rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="font-inter text-xs text-muted-foreground">
                Les champs vides utilisent les <span className="text-foreground font-semibold">valeurs par défaut</span> définies dans le code. 
                Renseignez uniquement ce que vous souhaitez personnaliser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}