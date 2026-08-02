import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, LifeBuoy, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// Section « Articles suggérés pour vous » — analyse les tickets de support
// ouverts de l'utilisateur (fonction suggestDocForUser) et affiche les
// articles de documentation les plus pertinents pour ses demandes en cours.

const ORANGE = '#ff6d3f';
const BLUE = '#38aadc';

export default function DocSuggestions({ onImage }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const res = await base44.functions.invoke('suggestDocForUser', {});
        if (active) setData(res?.data || res);
      } catch {
        if (active) setData({ suggestions: [] });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  if (!user || dismissed) return null;
  if (loading) {
    return (
      <div className="px-5 py-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Analyse de vos demandes…
        </div>
      </div>
    );
  }

  const suggestions = data?.suggestions || [];
  if (suggestions.length === 0) return null;
  const analyzed = data?.ticketsAnalyzed || 0;

  return (
    <section className="px-5 py-12 border-t border-border bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30` }}>
              <Sparkles className="w-4 h-4" style={{ color: ORANGE }} />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-lg md:text-xl">Articles suggérés pour vous</h2>
              <p className="text-xs text-muted-foreground">D'après vos {analyzed} ticket{analyzed > 1 ? 's' : ''} de support en cours — Nexus a analysé vos demandes.</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {suggestions.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative rounded-2xl border border-border bg-card p-5 hover-lift group"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: i === 0 ? ORANGE : BLUE }} />
                <div className="flex items-center gap-1.5 mb-2">
                  <LifeBuoy className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Suggestion</span>
                </div>
                <h3 className="font-grotesk font-bold text-base mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 min-h-[48px]">{s.reason}</p>
                <Link to={`/support/documentation/${s.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                  Lire l'article <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}