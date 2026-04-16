import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { Zap, QrCode, Download, Clock, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function FlashDeliveryPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_flash_enabled');
  const [user, setUser] = useState(null);
  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Flash Delivery indisponible" message="Le service Flash Delivery est temporairement désactivé." />;
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Parse code from URL if coming from QR
    const params = new URLSearchParams(window.location.search);
    if (params.get('code')) setCode(params.get('code'));
  }, []);

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      toast.error('Code invalide ou expiré. Contactez votre opérateur.');
    }, 1500);
  };

  return (
    <div className="pt-24 min-h-screen pb-20 px-5 lg:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> Livraison instantanée
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            Flash <span className="gradient-text">Delivery</span>
          </h1>
          <p className="font-inter text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Votre contenu livré en quelques minutes après l'atterrissage. 
            Scannez le QR code remis par votre opérateur pour accéder à vos fichiers.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Zap, step: '01', title: 'Atterrissage', desc: 'Le drone atterrit. Upload 5G immédiat sur nos serveurs.' },
            { icon: QrCode, step: '02', title: 'QR Code', desc: 'L\'opérateur vous remet ou affiche le QR Code de mission.' },
            { icon: Download, step: '03', title: 'Téléchargement', desc: 'Scannez et accédez à vos fichiers. Partagez en 1 clic.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="font-mono text-3xl font-bold text-primary/20 mb-3">{s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-grotesk font-semibold text-sm mb-1">{s.title}</p>
                <p className="font-inter text-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Download portal */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-primary/20 rounded-2xl p-8 sky-glow mb-8 text-center">
          <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-grotesk font-bold text-xl mb-2">Accéder à votre livraison</h2>
          <p className="font-inter text-sm text-muted-foreground mb-6">Saisissez le code de mission fourni par votre opérateur</p>
          
          <div className="flex gap-3 max-w-sm mx-auto">
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: BA-2024-XXXX"
              className="bg-secondary border-border font-mono text-center tracking-widest"
            />
            <Button onClick={handleCheck} disabled={!code || checking} className="bg-primary sky-glow px-6">
              {checking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <p className="font-mono text-xs">Lien sécurisé — Expire après 72h</p>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: '< 5 min', desc: 'Délai upload' },
            { icon: CheckCircle, label: 'RAW + 4K', desc: 'Formats disponibles' },
            { icon: Download, label: 'Illimité', desc: 'Téléchargements' },
            { icon: Lock, label: '72h', desc: 'Durée d\'accès' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-grotesk font-bold text-lg text-primary">{f.label}</p>
                <p className="font-inter text-xs text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="font-inter text-sm text-muted-foreground mb-4">Ce service est inclus dans nos prestations événementielles et presse.</p>
          <Link to="/quote">
            <Button variant="outline" className="gap-2 font-grotesk font-semibold">
              Inclure Flash Delivery dans mon devis <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}