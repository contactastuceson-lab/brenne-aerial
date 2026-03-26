import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Code, Palette, Wrench, GraduationCap, Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const serviceOptions = [
  { key: 'consulting', icon: Briefcase },
  { key: 'development', icon: Code },
  { key: 'design', icon: Palette },
  { key: 'maintenance', icon: Wrench },
  { key: 'formation', icon: GraduationCap },
  { key: 'autre', icon: Sparkles },
];

const budgetOptions = ['< 1000€', '1000€ - 5000€', '5000€ - 10000€', '10000€ - 25000€', '> 25000€'];
const urgencyOptions = [
  { key: 'low', labelFr: 'Basse', labelEn: 'Low' },
  { key: 'medium', labelFr: 'Moyenne', labelEn: 'Medium' },
  { key: 'high', labelFr: 'Haute', labelEn: 'High' },
  { key: 'urgent', labelFr: 'Urgente', labelEn: 'Urgent' },
];

export default function QuotePage() {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    service_type: '',
    description: '',
    budget_range: '',
    urgency: 'medium',
    client_name: '',
    client_email: '',
    client_phone: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setSending(true);
    await base44.entities.Quote.create(form);
    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: form.client_email,
      subject: 'Votre demande de devis a été reçue — ENOR.',
      body: `Bonjour ${form.client_name},\n\nNous avons bien reçu votre demande de devis pour le service "${form.service_type}".\nNous reviendrons vers vous dans les plus brefs délais.\n\nCordialement,\nEnor Lefoulon Meyer`
    });
    setSending(false);
    setSent(true);
    toast.success(t('quote.success'));
  };

  const steps = [t('quote.step1'), t('quote.step2'), t('quote.step3'), t('quote.step4')];

  const canNext = () => {
    if (step === 0) return form.service_type;
    if (step === 1) return form.description;
    if (step === 2) return form.client_name && form.client_email;
    return true;
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h2 className="font-syne font-extrabold text-3xl mb-3">{t('quote.success')}</h2>
          <p className="font-inter text-muted-foreground">
            {lang === 'fr'
              ? 'Nous vous recontacterons rapidement par email.'
              : 'We will contact you shortly by email.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 lg:px-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">{t('quote.title')}</p>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-8">
            {t('quote.title')}<span className="text-primary">.</span>
          </h1>
        </motion.div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-12">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                  i <= step ? 'border-primary bg-primary/10' : 'border-border'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline font-inter text-xs">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h2 className="font-syne font-bold text-xl mb-6">
                  {lang === 'fr' ? 'Quel service vous intéresse ?' : 'Which service interests you?'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {serviceOptions.map((s) => {
                    const Icon = s.icon;
                    const selected = form.service_type === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => update('service_type', s.key)}
                        className={`p-6 rounded-xl border text-left transition-all duration-200 ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-muted-foreground/30'
                        }`}
                      >
                        <Icon className={`w-7 h-7 mb-3 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-syne font-bold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                          {t(`services.${s.key}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-2 block">{t('quote.description')}</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder={t('quote.description')}
                    className="min-h-[150px] bg-card border-border font-inter"
                  />
                </div>
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-3 block">{t('quote.budget')}</label>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map((b) => (
                      <button
                        key={b}
                        onClick={() => update('budget_range', b)}
                        className={`px-4 py-2 rounded-lg font-mono text-xs border transition-colors ${
                          form.budget_range === b
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-3 block">{t('quote.urgency')}</label>
                  <div className="flex flex-wrap gap-2">
                    {urgencyOptions.map((u) => (
                      <button
                        key={u.key}
                        onClick={() => update('urgency', u.key)}
                        className={`px-4 py-2 rounded-lg font-mono text-xs border transition-colors ${
                          form.urgency === u.key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                      >
                        {lang === 'fr' ? u.labelFr : u.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-2 block">{t('quote.name')}</label>
                  <Input value={form.client_name} onChange={(e) => update('client_name', e.target.value)} className="bg-card border-border" />
                </div>
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-2 block">{t('quote.email')}</label>
                  <Input type="email" value={form.client_email} onChange={(e) => update('client_email', e.target.value)} className="bg-card border-border" />
                </div>
                <div>
                  <label className="font-inter text-sm text-muted-foreground mb-2 block">{t('quote.phone')}</label>
                  <Input value={form.client_phone} onChange={(e) => update('client_phone', e.target.value)} className="bg-card border-border" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-8 rounded-xl bg-card border border-border">
                <h3 className="font-syne font-bold text-lg mb-6">
                  {lang === 'fr' ? 'Récapitulatif' : 'Summary'}
                </h3>
                <div className="space-y-4 font-inter text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{t(`services.${form.service_type}`)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-mono">{form.budget_range || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('quote.name')}</span>
                    <span className="font-medium">{form.client_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-mono text-xs">{form.client_email}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Description</span>
                    <p className="text-foreground">{form.description}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="font-inter border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('quote.prev')}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="font-inter bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('quote.next')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={sending}
              className="font-syne font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('quote.submit')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}