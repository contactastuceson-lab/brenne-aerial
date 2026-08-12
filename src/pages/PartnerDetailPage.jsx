import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Globe, Mail, Phone, Star, Award, Eye, MessageSquare, Send, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
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
        // Increment view count
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
      // Recalculate average
      const newCount = (partner.rating_count || 0) + 1;
      const newAvg = ((partner.rating_avg || 0) * (partner.rating_count || 0) + reviewRating) / newCount;
      await base44.entities.Partner.update(partner.id, { rating_avg: Math.round(newAvg * 10) / 10, rating_count: newCount });
      toast.success('Avis publié');
      setReviewComment('');
      setShowReviewForm(false);
      // Refresh reviews
      const r = await base44.entities.PartnerReview.filter({ partner_id: partner.id, status: 'visible' }, '-created_date', 50);
      setReviews(r || []);
      setPartner({ ...partner, rating_avg: Math.round(newAvg * 10) / 10, rating_count: newCount });
    } catch { toast.error('Erreur'); }
    finally { setPostingReview(false); }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      {/* Banner */}
      <div className="relative h-40 md:h-56 overflow-hidden">
        {partner.banner_url ? (
          <img src={partner.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${lvl.color}30 0%, hsl(var(--card)) 100%)` }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, hsl(var(--background)) 100%)' }} />
        <button onClick={() => navigate('/partenaires')} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative">
        {/* Logo + name */}
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-card bg-muted flex items-center justify-center flex-shrink-0">
            {partner.logo_url ? <img src={partner.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-grotesk font-bold text-3xl text-primary">{(partner.name || '?')[0]}</span>}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="font-grotesk font-bold text-2xl md:text-3xl text-foreground flex items-center gap-2 flex-wrap">
              {partner.name}
              <PartnerLevelMark level={partner.partnership_level} size="24px" />
              <PartnerBadges badges={partnerBadges} size="20px" />
            </h1>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-4">
          {partner.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {partner.city}{partner.country ? `, ${partner.country}` : ''}</span>}
          {partner.rating_avg > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {partner.rating_avg.toFixed(1)} ({partner.rating_count} avis)</span>}
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {partner.view_count || 0} vues</span>
        </div>

        {/* Description */}
        {partner.long_description && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{partner.long_description}</p>
          </div>
        )}
        {partner.short_description && !partner.long_description && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4">
            <p className="text-sm text-foreground leading-relaxed">{partner.short_description}</p>
          </div>
        )}

        {/* Specialties */}
        {partner.specialties?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Spécialités</p>
            <div className="flex flex-wrap gap-2">
              {partner.specialties.map(s => <span key={s} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">{s}</span>)}
            </div>
          </div>
        )}

        {/* Contact + socials */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {partner.email && <Button onClick={handleContact}><Mail className="w-4 h-4 mr-1.5" /> Contacter</Button>}
          {partner.website && <a href={partner.website} target="_blank" rel="noreferrer"><Button variant="outline"><Globe className="w-4 h-4 mr-1.5" /> Site web</Button></a>}
          {partner.phone && <a href={`tel:${partner.phone}`}><Button variant="outline"><Phone className="w-4 h-4 mr-1.5" /> {partner.phone}</Button></a>}
          {partner.social_twitter && <a href={partner.social_twitter} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Twitter className="w-4 h-4" /></a>}
          {partner.social_instagram && <a href={partner.social_instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Instagram className="w-4 h-4" /></a>}
          {partner.social_linkedin && <a href={partner.social_linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Linkedin className="w-4 h-4" /></a>}
          {partner.social_facebook && <a href={partner.social_facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted"><Facebook className="w-4 h-4" /></a>}
        </div>

        {/* Reviews */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-grotesk font-bold text-lg flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Avis ({reviews.length})</h2>
            <Button variant="outline" size="sm" onClick={() => setShowReviewForm(v => !v)}><Send className="w-3.5 h-3.5 mr-1.5" /> Laisser un avis</Button>
          </div>

          {showReviewForm && (
            <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
              <div>
                <Label className="text-xs">Note</Label>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewRating(n)}>
                      <Star className={`w-6 h-6 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'} hover:scale-110 transition-transform`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Commentaire</Label>
                <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)}>Annuler</Button>
                <Button size="sm" onClick={submitReview} disabled={postingReview}>{postingReview ? '...' : 'Publier'}</Button>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun avis pour l'instant. Soyez le premier !</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {r.user_avatar ? <img src={r.user_avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">{(r.user_name || '?')[0]}</div>}
                    </div>
                    <span className="font-semibold text-sm">{r.user_name || 'Anonyme'}</span>
                    <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground ml-10">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}