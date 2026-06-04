import { useState } from 'react';
import {
  Lock, LockOpen, ShieldAlert, AlertTriangle, StickyNote,
  UserX, UserCheck, ChevronDown, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConvAdminToolbar({ conv, control, onAction }) {
  const [open, setOpen] = useState(false);
  const [showLockMenu, setShowLockMenu] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const [emailA, emailB] = conv.participantList.filter(e => e !== 'admin@brenneaerial.fr');
  const nameA = conv.participantNames[emailA] || emailA;
  const nameB = conv.participantNames[emailB] || emailB;

  const isLockedAll = control?.locked_for_all;
  const isLockedA = control?.locked_for_email === emailA;
  const isLockedB = control?.locked_for_email === emailB;
  const blockedAtoB = control?.blocked_a_to_b;
  const blockedBtoA = control?.blocked_b_to_a;

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        className="border-primary/30 text-primary gap-1.5 text-xs"
        onClick={() => setOpen(v => !v)}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Actions admin
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-10 z-50 w-72 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Section Verrouillage */}
            <div className="px-3 py-2 border-b border-border">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Verrouillage</p>
              <div className="space-y-1">
                <button
                  onClick={() => { onAction('lock_all', !isLockedAll); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter transition-colors ${isLockedAll ? 'bg-orange-400/15 text-orange-400' : 'hover:bg-secondary text-foreground'}`}
                >
                  {isLockedAll ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {isLockedAll ? 'Déverrouiller les 2 côtés' : 'Verrouiller les 2 côtés'}
                </button>
                <button
                  onClick={() => { onAction('lock_one', emailA); setOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter transition-colors ${isLockedA ? 'bg-orange-400/10 text-orange-400' : 'hover:bg-secondary text-foreground'}`}
                >
                  {isLockedA ? <LockOpen className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {isLockedA ? `Déverrouiller ${nameA}` : `Verrouiller ${nameA}`}
                </button>
                {emailB && (
                  <button
                    onClick={() => { onAction('lock_one', emailB); setOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter transition-colors ${isLockedB ? 'bg-orange-400/10 text-orange-400' : 'hover:bg-secondary text-foreground'}`}
                  >
                    {isLockedB ? <LockOpen className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {isLockedB ? `Déverrouiller ${nameB}` : `Verrouiller ${nameB}`}
                  </button>
                )}
              </div>
            </div>

            {/* Section Blocage croisé */}
            {emailB && (
              <div className="px-3 py-2 border-b border-border">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Blocage croisé</p>
                <div className="space-y-1">
                  <button
                    onClick={() => { onAction('block_a_to_b', !blockedAtoB); setOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter transition-colors ${blockedAtoB ? 'bg-red-400/10 text-red-400' : 'hover:bg-secondary text-foreground'}`}
                  >
                    {blockedAtoB ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    {blockedAtoB ? `Débloquer ${nameA} → ${nameB}` : `Bloquer ${nameA} → ${nameB}`}
                  </button>
                  <button
                    onClick={() => { onAction('block_b_to_a', !blockedBtoA); setOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter transition-colors ${blockedBtoA ? 'bg-red-400/10 text-red-400' : 'hover:bg-secondary text-foreground'}`}
                  >
                    {blockedBtoA ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                    {blockedBtoA ? `Débloquer ${nameB} → ${nameA}` : `Bloquer ${nameB} → ${nameA}`}
                  </button>
                </div>
              </div>
            )}

            {/* Section Messages spéciaux */}
            <div className="px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Messages spéciaux</p>
              <div className="space-y-1">
                <button
                  onClick={() => { onAction('set_msg_type', 'warning'); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter hover:bg-secondary text-orange-400 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Envoyer un avertissement
                </button>
                <button
                  onClick={() => { onAction('set_msg_type', 'note'); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  Ajouter une note interne
                </button>
                <button
                  onClick={() => { onAction('set_msg_type', 'official'); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-inter hover:bg-secondary text-primary transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Message officiel (visible par les 2)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}