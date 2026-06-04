import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'brenne_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ essential: true, analytics: true, marketing: false });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = (all = true) => {
    const consent = all
      ? { essential: true, analytics: true, marketing: true, date: new Date().toISOString() }
      : { ...prefs, essential: true, date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, marketing: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[200]"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-4 h-4 text-primary" />
                </div>
                <p className="font-grotesk font-bold text-sm">Cookies 🍪</p>
              </div>
              <button onClick={refuse} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary" title="Refuser">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-3">
              On utilise des cookies pour améliorer votre expérience. Consultez notre{' '}
              <Link to="/legal/privacy" target="_blank" className="text-primary underline hover:opacity-80">
                politique de confidentialité
              </Link>.
            </p>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 space-y-2 border border-border rounded-xl p-3 bg-secondary/40"
              >
                {[
                  { key: 'essential', label: 'Essentiels', desc: 'Nécessaires au fonctionnement du site', locked: true },
                  { key: 'analytics', label: 'Analytiques', desc: 'Mesure d\'audience anonyme', locked: false },
                  { key: 'marketing', label: 'Marketing', desc: 'Personnalisation et publicités', locked: false },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-inter text-xs font-semibold">{item.label}</p>
                      <p className="font-inter text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      disabled={item.locked}
                      onClick={() => !item.locked && setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`w-9 h-5 rounded-full transition-all flex-shrink-0 relative ${
                        prefs[item.key] ? 'bg-primary' : 'bg-border'
                      } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${prefs[item.key] ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs border-border gap-1.5"
                onClick={() => showDetails ? accept(false) : setShowDetails(true)}
              >
                <Settings className="w-3 h-3" />
                {showDetails ? 'Sauvegarder' : 'Personnaliser'}
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-primary gap-1.5"
                onClick={() => accept(true)}
              >
                <Check className="w-3 h-3" /> Tout accepter
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}