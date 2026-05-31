import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ParrainageRejoindre() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const parrain = urlParams.get('parrain') || 'quelqu\'un';

  const [form, setForm] = useState({ name: '', email: '', phone: '', mission: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) { setLoading(false); return; }
    base44.entities.Referral.filter({ referral_code: code }).then(results => {
      if (results.length > 0) setReferral(results[0]);
      setLoading(false);
    });
  }, [code]);

  const handleSubmit = async () => {
    if (!form.name || !form.email) { toast.error('Nom et email requis'); return; }
    setSubmitting(true);

    // Mettre à jour le referral avec les infos du filleul
    await base44.entities.Referral.update(referral.id, {
      referred_name: form.name,
      referred_email: form.email,
      referred_phone: form.phone,
      mission_description: form.mission,
    });

    setDone(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!code || !referral) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-inter">Lien de parrainage invalide ou expiré.</p>
          <Link to="/quote"><Button className="bg-primary text-primary-foreground">Demander un devis quand même</Button></Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-grotesk font-bold text-3xl">Merci {form.name.split(' ')[0]} !</h1>
          <p className="font-inter text-muted-foreground leading-relaxed">
            Votre demande a bien été enregistrée. Notre équipe vous contactera rapidement pour discuter de votre projet.
          </p>
          <p className="font-inter text-sm text-muted-foreground">
            Vous avez été recommandé·e par <strong className="text-foreground">{referral.referrer_name}</strong> — merci à lui/elle !
          </p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground gap-2 h-11 px-8">
              <ArrowRight className="w-4 h-4" /> Découvrir nos services
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <section className="relative py-20 px-5 overflow-hidden text-center">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Gift className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs text-primary tracking-widest uppercase">Invitation parrainage</span>
            </div>
            <h1 className="font-grotesk font-bold text-4xl sm:text-5xl">
              <span className="gradient-text">{decodeURIComponent(parrain)}</span><br />vous invite
            </h1>
            <p className="font-inter text-muted-foreground">
              Remplissez ce formulaire pour que notre équipe vous contacte. <strong className="text-foreground">Votre parrain gagnera 30 min de vol offerts</strong> dès la réalisation de votre mission.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-5 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-7 rounded-2xl bg-card border border-primary/20 space-y-4">
          <h2 className="font-grotesk font-bold text-lg">Vos coordonnées</h2>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Votre nom *</label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jean Dupont" className="bg-secondary border-border" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Votre email *</label>
            <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jean@exemple.fr" className="bg-secondary border-border" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Téléphone <span className="text-muted-foreground/50">(optionnel)</span></label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="06 XX XX XX XX" className="bg-secondary border-border" />
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Votre besoin <span className="text-muted-foreground/50">(optionnel)</span></label>
            <Textarea value={form.mission} onChange={e => setForm(p => ({ ...p, mission: e.target.value }))}
              placeholder="Ex: inspection toiture, captation événement, suivi chantier…" className="bg-secondary border-border resize-none" rows={3} />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground gap-2 h-11 font-grotesk font-semibold rounded-xl sky-glow">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {submitting ? 'Envoi…' : 'Envoyer ma demande'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}