import { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Award, Handshake, X, Send, ArrowUpRight, Sparkles, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PartnerBadges } from '@/components/ui/PartnerBadgeMark';
import PartnerLevelMark, { LEVEL_CONFIG } from '@/components/ui/PartnerLevelMark';

export default function PartnersPage() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, b] = await Promise.all([
          base44.entities.Partner.filter({ status: 'approved' }, '-order', 200),
          base44.entities.PartnerBadge.list('-order', 100),
        ]);
        setPartners(p || []);
        setBadges(b || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const cities = useMemo(() => [...new Set(partners.map(p => p.city).filter(Boolean))].sort(), [partners]);
  const badgeMap = useMemo(() => Object.fromEntries(badges.map(b => [b.id, b])), [badges]);

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.short_description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (levelFilter !== 'all' && p.partnership_level !== levelFilter) return false;
      return true;
    });
  }, [partners, search, cityFilter, levelFilter]);

  const featured = filtered.filter(p => p.is_featured).slice(0, 3);
  const featuredIds = new Set(featured.map(p => p.id));
  const rest = filtered.filter(p => !featuredIds.has(p.id));

  const stats = useMemo(() => ({
    total: partners.length,
    cities: cities.length,
    gold: partners.filter(p => p.partnership_level === 'gold').length,
  }), [partners, cities]);

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,170,220,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(195 80% 50%) 0%, transparent 70%)' }} />

        <div className="relative px-4 md:px-8 py-12 md:py-20 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 border border-primary/20 bg-primary/5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Programme officiel</span>
          </div>
          <h1 className="font-grotesk font-bold text-4xl md:text-5xl mb-4 leading-[1.05]">
            Nos Partenaires <span className="gradient-text">Officiels</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed mb-7">
            Découvrez les entreprises et professionnels de confiance qui collaborent avec EZA. Chaque partenaire est vérifié, certifié et engagé à offrir un service de qualité.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => setApplyOpen(true)} size="lg" className="rounded-full h-11 px-6 shadow-lg shadow-primary/20">
              <Handshake className="w-4 h-4 mr-1.5" /> Devenir Partenaire
            </Button>
            <div className="flex items-center gap-5 ml-1">
              <Stat icon={Users2} value={stats.total} label="Partenaires" color="text-primary" />
              <Stat icon={MapPin} value={stats.cities} label="Villes" color="text-accent" />
              <Stat icon={Award} value={stats.gold} label="Gold" color="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un partenaire..." className="pl-10 h-10 rounded-full bg-card" />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-40 h-10 rounded-full bg-card"><SelectValue placeholder="Localisation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes villes</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-40 h-10 rounded-full bg-card"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {Object.entries(LEVEL_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-400/15 border border-amber-400/25">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <h2 className="font-grotesk font-bold text-lg text-foreground">À la une</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featured.map(p => <FeaturedCard key={p.id} p={p} badgeMap={badgeMap} onClick={() => navigate(`/partenaires/${p.slug || p.id}`)} />)}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Handshake className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="font-grotesk font-semibold text-foreground mb-1">Aucun partenaire trouvé</p>
            <p className="text-sm text-muted-foreground">Essayez d'ajuster vos filtres de recherche.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-grotesk font-bold text-lg text-foreground">Tous les partenaires</h2>
              <span className="text-xs text-muted-foreground font-mono">({rest.length})</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rest.map(p => <PartnerCard key={p.id} p={p} badgeMap={badgeMap} onClick={() => navigate(`/partenaires/${p.slug || p.id}`)} />)}
            </div>
          </>
        )}
      </div>

      {/* Become partner dialog */}
      <BecomePartnerDialog open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="leading-none">
        <span className="font-grotesk font-bold text-lg text-foreground">{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-1.5">{label}</span>
      </div>
    </div>
  );
}

function FeaturedCard({ p, badgeMap, onClick }) {
  return (
    <div onClick={onClick} className="group relative rounded-3xl border border-border bg-card overflow-hidden cursor-pointer hover-lift hover:border-primary/40">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${LEVEL_CONFIG[p.partnership_level]?.color || '#38aadc'}, transparent)` }} />
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${LEVEL_CONFIG[p.partnership_level]?.color || '#38aadc'}40 0%, transparent 70%)` }} />

      <div className="relative p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
            {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-grotesk font-bold text-xl text-primary">{(p.name || '?')[0]}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-grotesk font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="truncate">{p.name}</span>
              <PartnerLevelMark level={p.partnership_level} size="18px" />
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {p.city && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {p.city}</span>}
              {p.rating_avg > 0 && <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating_avg.toFixed(1)}</span>}
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:rotate-12 transition-all flex-shrink-0" />
        </div>
        {p.short_description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.short_description}</p>}
        <div className="flex items-center justify-between gap-2">
          {p.specialties?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {p.specialties.slice(0, 2).map(s => <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/8 text-primary border border-primary/15">{s}</span>)}
            </div>
          ) : <span />}
          <PartnerBadges badgeIds={p.badges} badgeMap={badgeMap} size="16px" />
        </div>
      </div>
    </div>
  );
}

function PartnerCard({ p, badgeMap, onClick }) {
  return (
    <div onClick={onClick} className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/[0.03] transition-all cursor-pointer relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${LEVEL_CONFIG[p.partnership_level]?.color || '#38aadc'}25 0%, transparent 70%)` }} />
      <div className="relative flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
          {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-grotesk font-bold text-xl text-primary">{(p.name || '?')[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-grotesk font-bold text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5">
            {p.name}
            <PartnerLevelMark level={p.partnership_level} size="16px" />
            <PartnerBadges badgeIds={p.badges} badgeMap={badgeMap} size="16px" />
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {p.city && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {p.city}</span>}
            {p.rating_avg > 0 && <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating_avg.toFixed(1)}</span>}
          </div>
        </div>
      </div>
      {p.short_description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3 relative">{p.short_description}</p>}
      {p.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1 relative">
          {p.specialties.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">{s}</span>)}
        </div>
      )}
    </div>
  );
}

function BecomePartnerDialog({ open, onClose }) {
  const [form, setForm] = useState({ applicant_name: '', applicant_email: '', company_name: '', phone: '', website: '', city: '', country: 'France', specialties: [], description: '' });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSpecialty = () => {
    const t = specialtyInput.trim();
    if (t && !form.specialties.includes(t)) update('specialties', [...form.specialties, t]);
    setSpecialtyInput('');
  };

  const submit = async () => {
    if (!form.applicant_name.trim() || !form.applicant_email.trim()) { toast.error('Nom et email requis'); return; }
    setSaving(true);
    try {
      await base44.entities.PartnerApplication.create({ ...form, status: 'pending', submitted_at: new Date().toISOString() });
      toast.success('Candidature envoyée ! Nous vous contacterons.');
      setForm({ applicant_name: '', applicant_email: '', company_name: '', phone: '', website: '', city: '', country: 'France', specialties: [], description: '' });
      onClose();
    } catch { toast.error('Erreur lors de l\'envoi'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Header with gradient */}
        <div className="relative overflow-hidden px-6 pt-6 pb-5 border-b border-border">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, hsl(205 90% 58%) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(205 90% 58%) 0%, hsl(195 80% 50%) 100%)', boxShadow: '0 8px 24px hsl(205 90% 58% / 0.3)' }}>
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-grotesk font-bold text-lg">Devenir Partenaire</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Rejoignez le programme officiel EZA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Notre équipe étudiera votre candidature sous 48h.
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Informations personnelles</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Votre nom *"><Input value={form.applicant_name} onChange={e => update('applicant_name', e.target.value)} className="rounded-xl" /></Field>
                <Field label="Email *"><Input value={form.applicant_email} onChange={e => update('applicant_email', e.target.value)} type="email" className="rounded-xl" /></Field>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Entreprise</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Entreprise / Agence"><Input value={form.company_name} onChange={e => update('company_name', e.target.value)} className="rounded-xl" /></Field>
                <Field label="Téléphone"><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="rounded-xl" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field label="Site web"><Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://" className="rounded-xl" /></Field>
                <Field label="Ville"><Input value={form.city} onChange={e => update('city', e.target.value)} className="rounded-xl" /></Field>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Spécialités</p>
              <div className="flex gap-2">
                <Input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }} placeholder="Appuyez sur Entrée pour ajouter" className="rounded-xl" />
                <Button variant="outline" onClick={addSpecialty} className="rounded-xl px-3">+</Button>
              </div>
              {form.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {form.specialties.map(s => <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium">{s}<button onClick={() => update('specialties', form.specialties.filter(x => x !== s))} className="hover:text-primary/70"><X className="w-3 h-3" /></button></span>)}
                </div>
              )}
            </div>

            <Field label="Présentation / Motivation">
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="rounded-xl" placeholder="Décrivez votre activité et pourquoi vous souhaitez devenir partenaire..." />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} className="rounded-full">Annuler</Button>
          <Button onClick={submit} disabled={saving} className="rounded-full"><Send className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Envoi...' : 'Envoyer ma candidature'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}