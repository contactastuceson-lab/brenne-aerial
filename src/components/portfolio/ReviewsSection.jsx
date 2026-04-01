import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare, CheckCircle, Send, Shield, Award, Zap, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BADGE_CONFIG = {
  'Fondateur':      { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur':  { color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  'VIP':            { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin':          { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  'Pilote':         { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  'Officiel':       { color: 'text-accent',     bg: 'bg-accent/10',     border: 'border-accent/30' },
  'Vérifié':        { color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'Beta Testeur':   { color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/30' },
  'Partenaire':     { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
};

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            className={`${readonly ? 'w-4 h-4' : 'w-6 h-6'} transition-colors ${
              n <= (hover || value) ? 'fill-chart-5 text-chart-5' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const badges = review.author_badges || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {review.author_avatar ? (
              <img src={review.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-grotesk font-bold text-sm text-primary">
                {review.author_name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-grotesk font-semibold text-sm">{review.author_name}</span>
              {review.is_verified_client && (
                <span className="flex items-center gap-1 font-mono text-[9px] text-green-400 bg-green-400/10 border border-green-400/30 px-1.5 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" /> Client vérifié
                </span>
              )}
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {badges.slice(0, 2).map(b => {
                  const cfg = BADGE_CONFIG[b] || { color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
                  return (
                    <span key={b} className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                      {b}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <StarRating value={review.rating} readonly />
          <p className="font-mono text-[9px] text-muted-foreground mt-1">
            {review.created_date ? format(new Date(review.created_date), 'd MMM yyyy', { locale: fr }) : ''}
          </p>
        </div>
      </div>
      {review.comment && (
        <p className="font-inter text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}
    </motion.div>
  );
}

export default function ReviewsSection({ projectId, projectTitle }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = loading, null = not logged
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', projectId],
    queryFn: () => base44.entities.Review.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const name = currentUser ? currentUser.full_name : guestName.trim();
      if (!name) throw new Error('Nom requis');
      if (!rating) throw new Error('Veuillez sélectionner une note');
      await base44.entities.Review.create({
        project_id: projectId,
        author_name: name,
        author_email: currentUser?.email || '',
        author_avatar: currentUser?.avatar_url || '',
        author_badges: currentUser?.badges || [],
        rating,
        comment: comment.trim(),
        is_verified_client: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', projectId] });
      setRating(0);
      setComment('');
      setGuestName('');
      setShowForm(false);
      toast.success('Avis publié !');
    },
    onError: (err) => toast.error(err.message || 'Erreur'),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-6 border-t border-border pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h4 className="font-grotesk font-semibold text-sm">
            Avis clients
            {reviews.length > 0 && <span className="font-mono text-xs text-muted-foreground ml-2">({reviews.length})</span>}
          </h4>
          {avgRating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-chart-5 text-chart-5" />
              <span className="font-grotesk font-bold text-sm text-chart-5">{avgRating}</span>
            </div>
          )}
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
            onClick={() => setShowForm(true)}>
            <Star className="w-3 h-3" /> Laisser un avis
          </Button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary/40 border border-border rounded-xl p-4 mb-4"
          >
            <p className="font-inter text-xs text-muted-foreground mb-3">
              Votre avis sur <span className="text-foreground font-medium">{projectTitle}</span>
            </p>
            {!currentUser && currentUser !== undefined && (
              <Input
                placeholder="Votre nom *"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="bg-card border-border font-inter text-sm mb-3"
              />
            )}
            <div className="mb-3">
              <p className="font-inter text-xs text-muted-foreground mb-1.5">Note *</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Textarea
              placeholder="Votre commentaire (optionnel)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="bg-card border-border font-inter text-sm mb-3 h-20 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground gap-1.5"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !rating}
              >
                <Send className="w-3 h-3" />
                {submitMutation.isPending ? 'Envoi...' : 'Publier'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {reviews.length === 0 && !showForm && (
        <p className="font-inter text-xs text-muted-foreground text-center py-4">
          Aucun avis pour ce projet. Soyez le premier !
        </p>
      )}
      <div className="space-y-3">
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </div>
  );
}