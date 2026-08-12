import { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Mail, Globe, Award, Handshake, X, Send } from 'lucide-react';
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

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(56,170,220,0.08) 0%, transparent 100%)' }} />
        <div className="relative px-4 md:px-8 py-10 md:py-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-6 h-6 text-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Programme officiel</span>
          </div>
          <h1 className="font-grotesk font-bold text-3xl md:text-4xl mb-3">Nos Partenaires Officiels</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed">
            Découvrez les entreprises et professionnels de confiance qui collaborent avec EZA. Chaque partenaire est vérifié, certifié et engagé à offrir un service de qualité.
          </p>
          <Button onClick={() => setApplyOpen(true)} className="mt-5">
            <Handshake className="w-4 h-4 mr-1.5" /> Devenir Partenaire
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un partenaire..." className="pl-9" />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Localisation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes villes</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              {Object.entries(LEVEL_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5"><Star className="w-3 h-3" /> À la une</p>
          <div className="grid md:grid-cols-3 gap-3">
            {featured.map(p => <PartnerCard key={p.id} p={p} badgeMap={badgeMap} onClick={() => navigate(`/partenaires/${p.slug || p.id}`)} />)}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Handshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun partenaire trouvé</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => <PartnerCard key={p.id} p={p} badgeMap={badgeMap} onClick={() => navigate(`/partenaires/${p.slug || p.id}`)} />)}
          </div>
        )}
      </div>

      {/* Become partner dialog */}
      <BecomePartnerDialog open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}

function PartnerCard({ p, badgeMap, onClick }) {
  const lvl = LEVEL_CONFIG[p.partnership_level] || LEVEL_CONFIG.partner;
  return (
    <div onClick={onClick} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
          {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-grotesk font-bold text-xl text-primary">{(p.name || '?')[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-grotesk font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <PartnerLevelMark level={p.partnership_level} size="16px" />
            <PartnerBadges badgeIds={p.badges} badgeMap={badgeMap} size="16px" />
          </div>
        </div>
      </div>
      {p.short_description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.short_description}</p>}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {p.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.city}</span>}
        {p.rating_avg > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating_avg.toFixed(1)}</span>}
      </div>
      {p.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1">
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Handshake className="w-5 h-5 text-primary" /> Devenir Partenaire</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Remplissez ce formulaire, notre équipe étudiera votre candidature.</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Votre nom *</Label><Input value={form.applicant_name} onChange={e => update('applicant_name', e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Email *</Label><Input value={form.applicant_email} onChange={e => update('applicant_email', e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Entreprise / Agence</Label><Input value={form.company_name} onChange={e => update('company_name', e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Téléphone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Site web</Label><Input value={form.website} onChange={e => update('website', e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Ville</Label><Input value={form.city} onChange={e => update('city', e.target.value)} className="mt-1" /></div>
          </div>
          <div>
            <Label className="text-xs">Spécialités</Label>
            <div className="flex gap-2 mt-1">
              <Input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }} placeholder="Entrée pour ajouter" />
              <Button variant="outline" onClick={addSpecialty}>+</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.specialties.map(s => <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">{s}<button onClick={() => update('specialties', form.specialties.filter(x => x !== s))}><X className="w-3 h-3" /></button></span>)}
            </div>
          </div>
          <div><Label className="text-xs">Présentation / Motivation</Label><Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="mt-1" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} disabled={saving}><Send className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Envoi...' : 'Envoyer'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}