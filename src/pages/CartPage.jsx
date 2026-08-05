import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, Trash2, Loader2, Coins, CheckCircle, Calendar, Gift, ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { applySeoMeta } from '@/lib/seo';
import AdSlot from '@/components/feed/AdSlot';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, itemCount, totalCredits, removeItem, clear } = useCart(user);
  const qc = useQueryClient();
  const [checkingOut, setCheckingOut] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    applySeoMeta({ title: 'Mon panier — eza', description: 'Votre panier eza : événements et récompenses.' });
  }, []);

  const checkout = async () => {
    if (!cart || itemCount === 0) return;
    setCheckingOut(true);
    try {
      const res = await base44.functions.invoke('checkoutCart', {});
      const data = res?.data || res;
      if (data?.ok) {
        toast.success(`Panier validé — ${data.events} inscription(s), ${data.rewards} récompense(s), ${data.total} crédits`);
        setDone(data);
        qc.invalidateQueries({ queryKey: ['cart-active'] });
        qc.invalidateQueries({ queryKey: ['current-user'] });
      } else {
        toast.error(data?.error || 'Échec du paiement');
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erreur lors du paiement');
    }
    setCheckingOut(false);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="font-grotesk font-black text-2xl text-foreground mb-2">Panier validé 🎉</h1>
        <p className="font-inter text-sm text-muted-foreground mb-1">
          {done.events} inscription(s) · {done.rewards} récompense(s)
        </p>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          {done.total} crédits débités · solde restant : {done.new_balance}
        </p>
        <div className="flex gap-3">
          <Link to="/events"><Button variant="outline"><Calendar className="w-4 h-4" /> Mes événements</Button></Link>
          <Link to="/boutique"><Button variant="outline"><Gift className="w-4 h-4" /> Boutique</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-32">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-grotesk font-black text-2xl text-foreground">Mon panier</h1>
            <p className="font-inter text-sm text-muted-foreground">{itemCount} article{itemCount > 1 ? 's' : ''}</p>
          </div>
          {itemCount > 0 && (
            <button onClick={() => clear.mutate()} className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Vider
            </button>
          )}
        </div>

        {/* Pub */}
        <div className="mb-6"><AdSlot placement="sidebar" /></div>

        {!cart || itemCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/20" />
            <p className="font-grotesk font-semibold text-foreground/60">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground/40">Ajoutez des événements ou des récompenses depuis la boutique.</p>
            <div className="flex gap-3 mt-2">
              <Link to="/events"><Button variant="outline" size="sm"><Calendar className="w-4 h-4" /> Événements</Button></Link>
              <Link to="/boutique"><Button variant="outline" size="sm"><Gift className="w-4 h-4" /> Boutique</Button></Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {(cart.items || []).map((it, i) => (
                <div key={`${it.kind}-${it.ref_id}-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                    {it.kind === 'event' ? <Calendar className="w-5 h-5 text-violet-400" /> : <Gift className="w-5 h-5 text-pink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{it.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {it.kind === 'event' ? 'Événement' : 'Récompense'} · x{it.qty || 1} · {Number(it.price_credits) || 0} cr
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem.mutate({ ref_id: it.ref_id, kind: it.kind })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky bottom-4">
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm text-muted-foreground">Total</span>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="font-grotesk font-black text-xl text-amber-400">{totalCredits}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">crédits</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Votre solde</span>
                <span className="font-bold text-foreground">{user?.referral_credits || 0} crédits</span>
              </div>
              {totalCredits > (user?.referral_credits || 0) && (
                <p className="text-xs text-red-400">Crédits insuffisants pour ce panier.</p>
              )}
              <Button
                onClick={checkout}
                disabled={checkingOut || totalCredits > (user?.referral_credits || 0)}
                size="lg"
                className="w-full font-grotesk font-bold"
              >
                {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Coins className="w-4 h-4" /> Payer {totalCredits} crédits</>}
              </Button>
            </div>
          </>
        )}

        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-bold mt-6">
          <ArrowLeft className="w-4 h-4" /> Continuer mes achats
        </Link>
      </div>
    </div>
  );
}