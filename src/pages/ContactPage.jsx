import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, Check, Clock, MessageSquare, Plane, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const SUBJECTS = [
  { value: 'devis', label: '💼 Demande de devis' },
  { value: 'info', label: '❓ Renseignement général' },
  { value: 'toiture', label: '🏠 Inspection toiture' },
  { value: 'mariage', label: '💍 Vidéo événementielle' },
  { value: 'immo', label: '🏢 Captation immobilière' },
  { value: 'chantier', label: '🏗️ Suivi de chantier' },
  { value: 'partenariat', label: '🤝 Partenariat' },
  { value: 'autre', label: '📋 Autre' },
];

const STATS = [
  { icon: Clock, value: '< 48h', label: 'Délai de réponse' },
  { icon: Shield, value: '100%', label: 'Certifié DGAC' },
  { icon: Users, value: '200+', label: 'Clients satisfaits' },
  { icon: Plane, value: 'France', label: "Zone d'intervention" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: 'devis', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    const subjectLabel = SUBJECTS.find(s => s.value === form.subject)?.label || form.subject;

    // Email to Brenne Aerial
    await base44.integrations.Core.SendEmail({
      to: 'contact@brenneaerial.fr',
      from_name: 'Site Brenne Aerial',
      subject: `[Contact Site] ${subjectLabel} — ${form.name}`,
      body: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e8edf5; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1a6fa8, #0e5a8a); padding: 32px 36px;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">Nouveau message — Site Brenne Aerial</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">${subjectLabel}</p>
  </div>
  <div style="padding: 32px 36px; background: #0d1f35;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-size: 12px; color: rgba(180,200,220,0.6); width: 130px;">Nom</td><td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #e8edf5;">${form.name}</td></tr>
      <tr><td style="padding: 8px 0; font-size: 12px; color: rgba(180,200,220,0.6);">Email</td><td style="padding: 8px 0; font-size: 14px; color: #38aadc;"><a href="mailto:${form.email}" style="color: #38aadc;">${form.email}</a></td></tr>
      ${form.phone ? `<tr><td style="padding: 8px 0; font-size: 12px; color: rgba(180,200,220,0.6);">Téléphone</td><td style="padding: 8px 0; font-size: 14px; color: #e8edf5;">${form.phone}</td></tr>` : ''}
      ${form.company ? `<tr><td style="padding: 8px 0; font-size: 12px; color: rgba(180,200,220,0.6);">Société</td><td style="padding: 8px 0; font-size: 14px; color: #e8edf5;">${form.company}</td></tr>` : ''}
    </table>
    <div style="margin-top: 20px; padding: 16px; background: rgba(56,170,220,0.08); border: 1px solid rgba(56,170,220,0.15); border-radius: 8px;">
      <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(180,200,220,0.5);">Message</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #c8d8e8; white-space: pre-wrap;">${form.message}</p>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);">
      <a href="mailto:${form.email}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1a6fa8, #0e5a8a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px;">
        Répondre à ${form.name}
      </a>
    </div>
  </div>
  <div style="padding: 16px 36px; background: #060e1a; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2);">Reçu depuis brenne-aerial.fr • ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</div>`,
    });

    // Confirmation email to user
    await base44.integrations.Core.SendEmail({
      to: form.email,
      from_name: 'Brenne Aerial',
      subject: 'Votre message a bien été reçu — Brenne Aerial',
      body: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e8edf5; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1a6fa8, #0e5a8a); padding: 40px 36px; text-align: center;">
    <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
      <span style="font-size: 28px;">✈️</span>
    </div>
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">Message bien reçu !</h1>
    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Merci ${form.name}, nous avons bien reçu votre demande.</p>
  </div>
  <div style="padding: 36px; background: #0d1f35;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #c8d8e8;">Votre message concernant <strong style="color: #38aadc;">${SUBJECTS.find(s => s.value === form.subject)?.label}</strong> a été transmis à notre équipe.</p>
    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #c8d8e8;">Nous vous répondrons dans les <strong style="color: #fff;">24 à 48 heures ouvrées</strong>. En cas d'urgence, vous pouvez nous joindre directement par téléphone.</p>
    <div style="background: rgba(56,170,220,0.08); border: 1px solid rgba(56,170,220,0.15); border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(180,200,220,0.5);">Récapitulatif</p>
      <p style="margin: 0; font-size: 13px; color: #a0b8d0; line-height: 1.6;">Sujet : ${SUBJECTS.find(s => s.value === form.subject)?.label}<br/>Date : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
    <a href="https://brenne-aerial.fr/quote" style="display: block; text-align: center; padding: 14px 28px; background: linear-gradient(135deg, #1a6fa8, #0e5a8a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
      Demander un devis détaillé →
    </a>
  </div>
  <div style="padding: 20px 36px; background: #060e1a; text-align: center;">
    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.4);">Brenne Aerial — Drone professionnel</p>
    <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2);">contact@brenneaerial.fr • France entière</p>
  </div>
</div>`,
    });

    setSending(false);
    setSent(true);
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-20 px-5 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Nous contacter</p>
            <h1 className="font-grotesk font-black text-5xl sm:text-6xl lg:text-7xl mb-5 leading-none">
              Parlons de<br /><span className="gradient-text">votre projet</span>
            </h1>
            <p className="font-inter text-muted-foreground text-lg max-w-lg mx-auto">
              Une idée, un projet, une urgence — notre équipe vous répond sous 48h.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <p className="font-grotesk font-black text-xl text-foreground">{value}</p>
                <p className="font-inter text-xs text-muted-foreground text-center">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left column — info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact cards */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="space-y-3">
              {[
                { icon: Mail, label: 'Email', value: 'contact@brenneaerial.fr', href: 'mailto:contact@brenneaerial.fr', color: 'text-primary' },
                { icon: Phone, label: 'Téléphone', value: '+33 6 00 00 00 00', href: 'tel:+33600000000', color: 'text-green-400' },
                { icon: MapPin, label: 'Zone d\'intervention', value: 'Brenne, Indre (36) — Toute la France', href: null, color: 'text-accent' },
              ].map(item => (
                <a key={item.label} href={item.href || '#'} className={`flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group ${!item.href ? 'cursor-default' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-inter text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-mono text-sm font-semibold">{item.value}</p>
                  </div>
                  {item.href && <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                </a>
              ))}
            </motion.div>

            {/* Horaires */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-grotesk font-bold text-sm">Horaires</h3>
              </div>
              <div className="space-y-2">
                {[
                  { j: 'Lun — Ven', h: '8h00 — 19h00', open: true },
                  { j: 'Samedi', h: '9h00 — 17h00', open: true },
                  { j: 'Dimanche', h: 'Fermé', open: false },
                ].map(({ j, h, open }) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="font-inter text-sm text-muted-foreground">{j}</span>
                    <span className={`font-mono text-xs font-semibold ${open ? 'text-green-400' : 'text-muted-foreground'}`}>{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA devis */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="relative rounded-xl overflow-hidden border border-primary/30 p-5"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 6%), hsl(195 80% 5%))' }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <Zap className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-grotesk font-bold text-base mb-1">Besoin d'un devis rapide ?</h3>
              <p className="font-inter text-xs text-muted-foreground mb-4">Remplissez notre formulaire en 2 min. Réponse personnalisée sous 48h.</p>
              <Link to="/quote">
                <Button className="w-full bg-primary text-primary-foreground font-grotesk font-semibold gap-2 sky-glow">
                  <Plane className="w-4 h-4" /> Demander un devis
                </Button>
              </Link>
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-xl overflow-hidden border border-border" style={{ height: 200 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d87058.56!2d1.25!3d46.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47fcf6f9b2b53e9b%3A0x0!2zQnJlbm5lLCBJbmRyZQ!5e0!3m2!1sfr!2sfr!4v1"
                className="w-full h-full"
                style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(0.75)' }}
                loading="lazy"
                title="Brenne Aerial — Localisation"
              />
            </motion.div>
          </div>

          {/* Right column — form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-card border border-primary/30"
                  style={{ background: 'linear-gradient(135deg, hsl(214 40% 7%), hsl(205 40% 6%))' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mb-6 sky-glow">
                    <Check className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="font-grotesk font-black text-3xl mb-3">Message envoyé !</h3>
                  <p className="font-inter text-muted-foreground max-w-sm mb-2">
                    Votre message a bien été transmis à notre équipe. Vous recevrez également un email de confirmation.
                  </p>
                  <p className="font-mono text-xs text-primary">Réponse attendue sous 24 à 48h</p>
                  <div className="flex gap-3 mt-8">
                    <Button variant="outline" onClick={() => setSent(false)} className="border-border">
                      Nouveau message
                    </Button>
                    <Link to="/quote">
                      <Button className="bg-primary text-primary-foreground gap-2">
                        <Plane className="w-4 h-4" /> Faire un devis
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-card border border-border overflow-hidden">

                  {/* Form header */}
                  <div className="px-6 py-5 border-b border-border flex items-center gap-3"
                    style={{ background: 'linear-gradient(90deg, hsl(205 90% 58% / 0.06), transparent)' }}>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-grotesk font-bold text-base">Envoyer un message</h2>
                      <p className="font-inter text-xs text-muted-foreground">Tous les champs marqués * sont obligatoires</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Subject selector */}
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-2 block font-medium">Motif de contact *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SUBJECTS.map(s => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => u('subject', s.value)}
                            className={`text-left px-3 py-2 rounded-xl border text-xs font-inter transition-all ${
                              form.subject === s.value
                                ? 'border-primary/60 bg-primary/10 text-foreground'
                                : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nom complet *</label>
                        <Input required value={form.name} onChange={e => u('name', e.target.value)}
                          onFocus={() => setActiveField('name')} onBlur={() => setActiveField(null)}
                          placeholder="Jean Dupont"
                          className={`bg-secondary border-border transition-all ${activeField === 'name' ? 'border-primary/60 ring-1 ring-primary/20' : ''}`} />
                      </div>
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Email *</label>
                        <Input required type="email" value={form.email} onChange={e => u('email', e.target.value)}
                          onFocus={() => setActiveField('email')} onBlur={() => setActiveField(null)}
                          placeholder="jean@exemple.fr"
                          className={`bg-secondary border-border transition-all ${activeField === 'email' ? 'border-primary/60 ring-1 ring-primary/20' : ''}`} />
                      </div>
                    </div>

                    {/* Phone + Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Téléphone</label>
                        <Input value={form.phone} onChange={e => u('phone', e.target.value)}
                          onFocus={() => setActiveField('phone')} onBlur={() => setActiveField(null)}
                          placeholder="+33 6 12 34 56 78"
                          className={`bg-secondary border-border transition-all ${activeField === 'phone' ? 'border-primary/60 ring-1 ring-primary/20' : ''}`} />
                      </div>
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Société / Organisation</label>
                        <Input value={form.company} onChange={e => u('company', e.target.value)}
                          onFocus={() => setActiveField('company')} onBlur={() => setActiveField(null)}
                          placeholder="Optionnel"
                          className={`bg-secondary border-border transition-all ${activeField === 'company' ? 'border-primary/60 ring-1 ring-primary/20' : ''}`} />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Message *</label>
                      <Textarea required value={form.message} onChange={e => u('message', e.target.value)}
                        onFocus={() => setActiveField('message')} onBlur={() => setActiveField(null)}
                        placeholder="Décrivez votre projet, la localisation, la date souhaitée et toute information utile…"
                        className={`bg-secondary border-border min-h-[160px] transition-all ${activeField === 'message' ? 'border-primary/60 ring-1 ring-primary/20' : ''}`} />
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">{form.message.length} caractère{form.message.length > 1 ? 's' : ''}</p>
                    </div>

                    <Button type="submit" disabled={sending} size="lg"
                      className="w-full bg-primary text-primary-foreground font-grotesk font-bold sky-glow gap-2">
                      {sending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
                        : <><Send className="w-4 h-4" /> Envoyer le message</>
                      }
                    </Button>

                    <p className="font-inter text-xs text-muted-foreground text-center">
                      En soumettant ce formulaire, vous acceptez que vos données soient traitées pour répondre à votre demande.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}