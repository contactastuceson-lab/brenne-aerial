import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Wallet, User as UserIcon, Search, MessageSquare,
  CheckCircle2, Loader2, Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  book: BookOpen,
  post: FileText,
  wallet: Wallet,
  user: UserIcon,
  search: Search,
  history: MessageSquare,
};

// Affiche les étapes de recherche de Nexus (ce qu'il "fait") sous forme de chips
// qui apparaissent une par une en temps réel, puis la pastille "réponse prête".
export default function AiSteps({ steps = [], animate = true }) {
  const [visible, setVisible] = useState(animate ? 0 : steps.length);
  const [thinking, setThinking] = useState(animate);

  useEffect(() => {
    if (!animate || steps.length === 0) return;
    let i = 0;
    const reveal = () => {
      i += 1;
      setVisible(i);
      if (i < steps.length) {
        setTimeout(reveal, 650);
      } else {
        setTimeout(() => setThinking(false), 500);
      }
    };
    const t = setTimeout(reveal, 400);
    return () => clearTimeout(t);
  }, [animate, steps.length]);

  if (!steps.length) return null;

  return (
    <div className="mb-2.5 space-y-1.5">
      <AnimatePresence>
        {steps.slice(0, visible).map((s, idx) => {
          const Icon = ICON_MAP[s.icon] || Search;
          const isCurrent = idx === visible - 1 && thinking;
          return (
            <motion.div key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-primary" />
              </span>
              <span className="flex-1 truncate">{s.label}</span>
              {isCurrent
                ? <Loader2 className="w-3 h-3 animate-spin text-primary/60 flex-shrink-0" />
                : <CheckCircle2 className="w-3 h-3 text-green-400/70 flex-shrink-0" />}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {thinking && visible >= steps.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-[11px] text-primary font-medium pt-0.5">
          <Sparkles className="w-3 h-3" />
          <span>Nexus rédige sa réponse…</span>
        </motion.div>
      )}
    </div>
  );
}