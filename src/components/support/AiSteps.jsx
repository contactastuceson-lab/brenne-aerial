import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Wallet, User as UserIcon, Search, MessageSquare,
  Check, Loader2, Calendar, Users, Radio, CircleDot, Gift, Ticket, Award,
  ShoppingCart, LifeBuoy, Star, BadgeCheck, Heart, List, Megaphone, ClipboardList,
} from 'lucide-react';

const ICON_MAP = {
  book: BookOpen,
  post: FileText,
  wallet: Wallet,
  user: UserIcon,
  search: Search,
  history: MessageSquare,
  event: Calendar,
  community: Users,
  space: Radio,
  story: CircleDot,
  referral: Gift,
  registration: Ticket,
  reward: Award,
  cart: ShoppingCart,
  ticket: LifeBuoy,
  discussion: MessageSquare,
  forum: ClipboardList,
  review: Star,
  certification: BadgeCheck,
  donation: Heart,
  list: List,
  ad: Megaphone,
};

// Checklist de recherche Nexus — chaque étape apparaît une par une, avec une
// coche verte circulaire à droite (style "task list") quand elle est terminée.
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
        setTimeout(reveal, 600);
      } else {
        setTimeout(() => setThinking(false), 450);
      }
    };
    const t = setTimeout(reveal, 350);
    return () => clearTimeout(t);
  }, [animate, steps.length]);

  if (!steps.length) return null;

  return (
    <div className="mb-2.5 rounded-xl bg-black/25 border border-white/5 p-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70 mb-1.5 flex items-center gap-1">
        <Search className="w-2.5 h-2.5" />
        Recherche Nexus
      </div>
      <div className="space-y-1">
        <AnimatePresence>
          {steps.slice(0, visible).map((s, idx) => {
            const isCurrent = idx === visible - 1 && thinking;
            return (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-[11.5px]">
                <span className="flex-1 text-foreground/85 leading-tight">{s.label}</span>
                {isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/70 flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {thinking && visible >= steps.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-[10.5px] text-primary font-medium pt-1.5 mt-1 border-t border-white/5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Nexus rédige sa réponse…</span>
        </motion.div>
      )}
    </div>
  );
}