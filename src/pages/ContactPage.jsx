import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'contact@brenne-aerial.fr',
      subject: `[Contact] ${form.subject} — ${form.name}`,
      body: `Nom: ${form.name}\nEmail: ${form.email}\nTéléphone: ${form.phone}\n\n${form.message}`,
    });
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: 'Votre message a bien été reçu — Brenne Aerial',
      body: `Bonjour ${form.name},\n\nNous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nCordialement,\nBrenn Aerial`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="pt-16">
      <section className="py-24 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center">
            <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase">— Nous contacter</p>
            <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-3">
              Parlons de <span className="gradient-text">votre projet</span>
            </h1>
            <p className="font-inter text-muted-foreground max-w-md mx-auto">Réponse garantie sous 24 à 48 heures.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info */}
            <div className="space-y-5">
              {[
                { icon: Mail, label: 'Email', value: 'contact@brenne-aerial.fr' },
                { icon: Phone, label: 'Téléphone', value: '+33 6 00 00 00 00' },
                { icon: MapPin, label: 'Zone', value: 'Brenne, Indre (36) — Toute la France' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-mono text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Map embed placeholder */}
              <div className="rounded-xl overflow-hidden border border-border aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d87058.56!2d1.25!3d46.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47fcf6f9b2b53e9b%3A0x0!2zQnJlbm5lLCBJbmRyZQ!5e0!3m2!1sfr!2sfr!4v1"
                  className="w-full h-full"
                  style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(0.8)' }}
                  loading="lazy"
                  title="Brenne Aerial — Localisation"
                />
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-card border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 sky-glow">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-grotesk font-bold text-xl mb-2">Message envoyé !</h3>
                  <p className="font-inter text-sm text-muted-foreground">Nous vous répondrons dans les 24h.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nom *</label>
                      <Input required value={form.name} onChange={e => u('name', e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Email *</label>
                      <Input required type="email" value={form.email} onChange={e => u('email', e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Téléphone</label>
                      <Input value={form.phone} onChange={e => u('phone', e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Sujet *</label>
                      <Input required value={form.subject} onChange={e => u('subject', e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Message *</label>
                    <Textarea required value={form.message} onChange={e => u('message', e.target.value)} className="bg-secondary border-border min-h-[150px]" placeholder="Décrivez votre demande..." />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-primary text-primary-foreground font-grotesk font-semibold sky-glow">
                    {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Envoyer le message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}