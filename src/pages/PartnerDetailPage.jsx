import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Globe, Mail, Phone, Star, Award, Eye, MessageSquare, Send, Twitter, Instagram, Linkedin, Facebook, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PartnerBadges } from '@/components/ui/PartnerBadgeMark';
import PartnerLevelMark, { LEVEL_CONFIG } from '@/components/ui/PartnerLevelMark';

export default function PartnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [badges, setBadges] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Partner.list('-order', 200);
        const p = all.find(x => x.slug === id || x.id === id);
        if (!p) { setLoading(false); return; }
        setPartner(p);
        base44.entities.Partner.update(p.id, { view_count: (p.view_count || 0) + 1 }).catch(() => {});
        const [b, r, me] = await Promise.all([
          base44.entities.PartnerBadge.list('-order', 100),
          base44.entities.PartnerReview.filter({ partner_id: p.id, status: 'visible' }, '-created_date', 50),
          base44.auth.me().catch(() => null),
        ]);
        setBadges(b || []);
        setReviews(r || []);
        setUser(me);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [id]);

  const badgeMap = useMemo(() => Object.fromEntries(badges.map(b => [b.id, b])), [badges]);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!partner) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Partenaire introuvable</p>
      <Link to="/partenaires"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" /> Retour</Button></Link>
    </div>
  );

  const lvl = LEVEL_CONFIG[partner.partnership_level] || LEVEL_CONFIG.partner;
  const partnerBadges = (partner.badges || []).map(bid => badgeMap[bid]).filter(Boolean);

  const handleContact = () => {
    if (partner.email) {
      window.location.href = `mailto:${partner.email}`;
      base44.entities.Partner.update(partner.id, { contact_count: (partner.contact_count || 0) + 1 }).catch(() => {});
    }
  };

  const submitReview = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setPostingReview(true);
    try {
      await base44.entities.PartnerReview.create({
        partner_id: partner.id,
        user_id: user.id,
        user_email: user.email,
        user_name: user.display_name || user.full_name,
        user_avatar: user.avatar_url,
        rating: reviewRating,
        comment: reviewComment,
        status: 'visible',
      });
      const newCount = (partner.rating_count || 0) + 1;
      const newAvg = ((partner.rating_avg || 0) * (partner.rating_count || 0) + reviewRating) / newCount;
      await base44.entities.Partner.update(partner.id, { rating_avg: Math.round(newAvg * 10) / 10, rating_count: newCount });
      toast.success('Avis publié');
      setReviewComment('');
      setShowReviewForm(false);
      const r = await base44.entities.PartnerReview.filter({ partner_id: partner.id, status: 'visible' }, '-created_date', 50);
      setReviews(r || []);
      setPartner({ ...partner, rating_avg: Math.round(newAvg * 10) / 10, rating_count: newCount });
    } catch { toast.error('Erreur'); }
    finally { setPostingReview(false); }
  };

  const socials = [
    partner.social_twitter && { icon: Twitter, url: partner.social_twitter },
    partner.social_instagram && { icon: Instagram, url: partner.social_instagram },
    partner.social_linkedin && { icon: Linkedin, url: partner.social_linkedin },
    partner.social_facebook && { icon: Facebook, url: partner.social_facebook },
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {partner.banner_url ? (
          <img src={partner.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative" style={{ background: `linear-gradient(135deg, ${lvl.color}40 0%, hsl(var(--card)) 60%, hsl(var(--background)) 100%)` }}>
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: `radial-gradient(circle, ${lvl.color} 0%, transparent 70%)` }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, hsl(var(--background)) 100%)' }} />
        <button onClick={() => navigate('/partenaires')} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-14 relative">
        {/* Logo + name card */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6 mb-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${lvl.color} 0%, transparent 70%)` }} />
          <div className="relative flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-card bg-muted flex items-center justify-center flex-shrink-0 shadow-lg" style={{ boxShadow: `0 8px 24px ${lvl.color}30` }}>
              {partner.logo_url ? <img src={partner.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-grotesk font-bold text-3xl text-primary">{(partner.name || '?')[0]}</span>}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-grotesk font-bold text-2xl md:text-3xl text-foreground flex items-center gap-2 flex-wrap leading-tight">
                {partner.name}
                <PartnerLevelMark level={partner.partnership_level} size="24px" />
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: `${lvl.color}18`, color: lvl.color, border: `1px solid ${lvl.color}30` }}>
                  <ShieldCheck className="w-3 h-3" /> {lvl.label}
                </span>
                {partnerBadges.length > 0 && <PartnerBadges badges={partnerBadges} size="20px" />}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            <DetailStat icon={Star} value={partner.rating_avg > 0 ? partner.rating_avg.toFixed(1) : '—'} label={`${partner.rating_count || 0} avis`} color="text-amber-400" />
            <DetailStat icon={Eye} value={partner.view_count || 0} label="vues" color="text-primary" />
            <DetailStat icon={MapPin} value={partner.city || '—'} label={partner.country || ''} color="text-accent" />
          </div>
        </div>

        {/* Description */}
        {(partner.long_description || partner.short_description) && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="font-grotesk font-bold text-sm uppercase tracking-wide text-muted-foreground">À propos</h2>
            </div>
            <p className="text-sm md:text-base text-foreground whitespace-pre-wrap leading-relaxed">{partner.long_description || partner.short_description}</p>
          </div>
        )}

        {/* Specialties */}
        {partner.specialties?.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="font-grotesk font-bold text-sm uppercase tracking-wide text-muted-foreground">Spécialités</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {partner.specialties.map(s => <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 font-medium">{s}</span>)}
            </div>
          </div>
        )}

        {/* Contact card */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-grotesk font-bold text-sm uppercase tracking-wide text-muted-foreground">Contact</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {partner.email && <Button onClick={handleContact} className="rounded-full"><Mail className="w-4 h-4 mr-1.5" /> Contacter</Button>}
            {partner.website && <a href={partner.website} target="_blank" rel="noreferrer"><Button variant="outline" className="rounded-full"><Globe className="w-4 h-4 mr-1.5" /> Site web</Button></a>}
            {partner.phone && <a href={`tel:${partner.phone}`}><Button variant="outline" className="rounded-full"><Phone className="w-4 h-4 mr-1.5" /> {partner.phone}</Button></a>}
            {socials.map((s, i) => {
              const Icon = s.icon;
              return <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-muted-foreground"><Icon className="w-4 h-4" /></a>;
            })}
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-grotesk font-bold text-lg flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Avis <span className="text-sm text-muted-foreground font-normal">({reviews.length})</span></h2>
            <Button variant="outline" size="sm" onClick={() => setShowReviewForm(v => !v)} className="rounded-full"><Send className="w-3.5 h-3.5 mr-1.5" /> Laisser un avis</Button>
          </div>

          {showReviewForm && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 mb-4 space-y-3">
              <div>
                <Label className="text-xs">Note</Label>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewRating(n)} className="transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Commentaire</Label>
                <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="mt-1" placeholder="Partagez votre expérience..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)} className="rounded-full">Annuler</Button>
                <Button size="sm" onClick={submitReview} disabled={postingReview} className="rounded-full">{postingReview ? '...' : 'Publier'}</Button>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun avis pour l'instant. Soyez le premier !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                      {r.user_avatar ? <img src={r.user_avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-muted-foreground">{(r.user_name || '?')[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-grotesk font-semibold text-sm text-foreground">{r.user_name || 'Anonyme'}</span>
                      <div className="flex mt-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground leading-relaxed pl-11">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailStat({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="leading-tight min-w-0">
        <p className="font-grotesk font-bold text-base text-foreground truncate">{value}</p>
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}