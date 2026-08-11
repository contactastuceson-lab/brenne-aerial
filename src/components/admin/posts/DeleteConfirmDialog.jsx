import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmDialog({ open, onClose, post, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    setConfirmText('');
    onConfirm();
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)' }} />

            <div className="p-6">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>

              {/* Title */}
              <h3 className="font-grotesk font-bold text-lg text-center mb-1.5">Supprimer ce post ?</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-5">
                Cette action est <span className="text-destructive font-semibold">irréversible</span>. Le post, ses médias et toutes les interactions associées seront définitivement supprimés.
              </p>

              {/* Post preview */}
              {post?.content && (
                <div className="rounded-xl bg-secondary/40 border border-border p-3 mb-5 max-h-24 overflow-hidden">
                  <p className="text-xs text-foreground/70 line-clamp-3">{post.content}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2.5">
                <button onClick={handleClose}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary/60 transition-colors">
                  Annuler
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 h-10 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}