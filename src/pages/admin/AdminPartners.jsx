import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, Star, Award, Users, FileCheck, MessageSquare, Search, Star as StarIcon, Eye as EyeIcon, Mail, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PartnerEditDialog from '@/components/admin/partners/PartnerEditDialog';
import BadgeEditDialog from '@/components/admin/partners/BadgeEditDialog';
import ApplicationDialog from '@/components/admin/partners/ApplicationDialog';
import { PartnerBadges } from '@/components/ui/PartnerBadgeMark';
import PartnerBadgeMark from '@/components/ui/PartnerBadgeMark';

const STATUS_CONFIG = {
  pending: { label: 'En attente', className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  approved: { label: 'Approuvé', className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  suspended: { label: 'Suspendu', className: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
  refused: { label: 'Refusé', className: 'bg-red-500/15 text-red-400 border border-red-500/30' },
};
const LEVEL_CONFIG = {
  partner: { label: 'Partenaire', color: '#38aadc' },
  certified: { label: 'Certifié', color: '#22c55e' },
  premium: { label: 'Premium', color: '#a855f7' },
  gold: { label: 'Gold', color: '#f59e0b' },
};

const TABS = [
  { key: 'partners', label: 'Partenaires', icon: Users },
  { key: 'badges', label: 'Badges', icon: Award },
  { key: 'applications', label: 'Candidatures', icon: FileCheck },
  { key: 'reviews', label: 'Avis', icon: MessageSquare },
];

export default function AdminPartners() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [badges, setBadges] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editPartner, setEditPartner] = useState(null);
  const [editBadge, setEditBadge] = useState(null);
  const [viewApp, setViewApp] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, b, a, r] = await Promise.all([
        base44.entities.Partner.list('-order', 200),
        base44.entities.PartnerBadge.list('-order', 100),
        base44.entities.PartnerApplication.list('-created_date', 200),
        base44.entities.PartnerReview.list('-created_date', 200),
      ]);
      setPartners(p || []);
      setBadges(b || []);
      setApplications(a || []);
      setReviews(r || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.city?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [partners, search, statusFilter]);

  const pendingApps = applications.filter(a => a.status === 'pending');
  const flaggedReviews = reviews.filter(r => r.is_flagged);

  const handleDeletePartner = async (p) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    await base44.entities.Partner.delete(p.id);
    toast.success('Partenaire supprimé');
    load();
  };

  const handleDeleteBadge = async (b) => {
    if (!confirm(`Supprimer le badge "${b.name}" ?`)) return;
    await base44.entities.PartnerBadge.delete(b.id);
    toast.success('Badge supprimé');
    load();
  };

  const handleToggleReview = async (r) => {
    await base44.entities.PartnerReview.update(r.id, { status: r.status === 'visible' ? 'hidden' : 'visible' });
    load();
  };

  const handleDeleteReview = async (r) => {
    if (!confirm('Supprimer cet avis ?')) return;
    await base44.entities.PartnerReview.delete(r.id);
    toast.success('Avis supprimé');
    load();
  };

  const badgeMap = useMemo(() => Object.fromEntries(badges.map(b => [b.id, b])), [badges]);
  const partnerMap = useMemo(() => Object.fromEntries(partners.map(p => [p.id, p])), [partners]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Partenaires
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez les partenaires officiels, badges, candidatures et avis</p>
        </div>
        {tab === 'partners' && <Button onClick={() => setEditPartner({})}><Plus className="w-4 h-4 mr-1.5" /> Ajouter</Button>}
        {tab === 'badges' && <Button onClick={() => setEditBadge({})}><Plus className="w-4 h-4 mr-1.5" /> Créer un badge</Button>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(t => {
          const Icon = t.icon;
          const count = t.key === 'applications' ? pendingApps.length : t.key === 'reviews' ? flaggedReviews.length : 0;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-4 h-4" /> {t.label}
              {count > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : tab === 'partners' ? (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="refused">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {filteredPartners.map(p => {
              const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              const lvl = LEVEL_CONFIG[p.partnership_level] || LEVEL_CONFIG.partner;
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
                    {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <Badge className={st.className}>{st.label}</Badge>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: lvl.color, background: `${lvl.color}15`, border: `1px solid ${lvl.color}30` }}>{lvl.label}</span>
                      {p.is_featured && <Badge className="bg-amber-500/15 text-amber-400"><Star className="w-3 h-3 mr-1" /> À la une</Badge>}
                      {p.badges?.length > 0 && (
                        <PartnerBadges badgeIds={p.badges} badgeMap={badgeMap} size="16px" />
                      )}
                    </div>
                    {p.short_description && <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{p.short_description}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.city && <span>{p.city}</span>}
                      <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> {p.view_count || 0}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.contact_count || 0}</span>
                      <span className="flex items-center gap-1"><StarIcon className="w-3 h-3" /> {p.rating_avg?.toFixed(1) || '0.0'} ({p.rating_count || 0})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/partenaires/${p.slug || p.id}`)} title="Voir le profil"><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditPartner(p)} title="Modifier"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePartner(p)} title="Supprimer" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
            {filteredPartners.length === 0 && <div className="text-center py-12 text-muted-foreground">Aucun partenaire</div>}
          </div>
        </>
      ) : tab === 'badges' ? (
        <div className="grid gap-3">
          {badges.map(b => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"><PartnerBadgeMark badge={b} size="32px" showIcon={true} marginLeft={0} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{b.name}</h3>
                  {b.is_automatic && <Badge className="bg-primary/10 text-primary text-[10px]">Auto</Badge>}
                </div>
                {b.description && <p className="text-sm text-muted-foreground">{b.description}</p>}
                {b.is_automatic && b.auto_rule && <p className="text-xs text-muted-foreground mt-0.5">Règle: {b.auto_rule.field} {b.auto_rule.operator} {b.auto_rule.value}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditBadge(b)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteBadge(b)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {badges.length === 0 && <div className="text-center py-12 text-muted-foreground"><Award className="w-12 h-12 mx-auto mb-3 opacity-30" />Aucun badge créé</div>}
        </div>
      ) : tab === 'applications' ? (
        <div className="grid gap-3">
          {applications.map(a => {
            const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            return (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted flex-shrink-0"><FileCheck className="w-5 h-5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{a.company_name || a.applicant_name}</h3>
                    <Badge className={st.className}>{st.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.applicant_email} — {a.city || '—'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewApp(a)}>Examiner</Button>
              </div>
            );
          })}
          {applications.length === 0 && <div className="text-center py-12 text-muted-foreground">Aucune candidature</div>}
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map(r => {
            const partner = partnerMap[r.partner_id];
            return (
              <div key={r.id} className={`rounded-xl border p-4 ${r.is_flagged ? 'border-red-500/40 bg-red-500/5' : 'border-border bg-card'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{r.user_name || 'Anonyme'}</span>
                      <div className="flex">{[1,2,3,4,5].map(n => <StarIcon key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>
                      {partner && <span className="text-xs text-muted-foreground">— {partner.name}</span>}
                      {r.status === 'hidden' && <Badge className="bg-muted text-muted-foreground text-[10px]">Masqué</Badge>}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleReview(r)} title={r.status === 'visible' ? 'Masquer' : 'Afficher'}>{r.status === 'visible' ? <EyeIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4 opacity-40" />}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(r)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.length === 0 && <div className="text-center py-12 text-muted-foreground">Aucun avis</div>}
        </div>
      )}

      {/* Dialogs */}
      <PartnerEditDialog open={!!editPartner} partner={editPartner?.id ? editPartner : null} badges={badges} onClose={() => setEditPartner(null)} onSaved={load} />
      <BadgeEditDialog open={!!editBadge} badge={editBadge?.id ? editBadge : null} onClose={() => setEditBadge(null)} onSaved={load} />
      <ApplicationDialog open={!!viewApp} application={viewApp} onClose={() => setViewApp(null)} onAction={load} />
    </div>
  );
}