import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Loader2, Smartphone, BellOff, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const getDefaultPrefs = () => ({
  email_notifications: true,
  push_notifications: true,
  quote_updates: true,
  appointment_reminders: true,
  new_messages: true,
  badge_awarded: true,
  donation_updates: true,
  newsletter: false,
  marketing_emails: false,
});

export default function NotificationSettings({ user }) {
  const { isSupported, permission, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();
  const [localPrefs, setLocalPrefs] = useState(() => ({
    ...getDefaultPrefs(),
    ...(user?.notification_prefs || {}),
  }));

  useEffect(() => {
    if (user?.notification_prefs) {
      setLocalPrefs({ ...getDefaultPrefs(), ...user.notification_prefs });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      return await base44.auth.updateMe({ notification_prefs: prefs });
    },
    onSuccess: () => {
      toast.success('Préférences sauvegardées');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  const sendConfirmEmail = async (label, enabled) => {
    const action = enabled ? 'activée' : 'désactivée';
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🔔 Préférence notification ${action} — ${label}`,
      body: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#060e1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060e1a;padding:40px 16px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#0c1a30;border:1px solid rgba(56,170,220,0.2);border-radius:16px;overflow:hidden;">
<tr><td style="height:3px;background:linear-gradient(90deg,#38aadc,#1dd8b4,#38aadc);"></td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#38aadc;opacity:0.8;">BRENNE AERIAL</p>
  <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#e8edf5;">Confirmation de modification</h1>
  <p style="margin:0 0 16px;font-size:14px;color:#6a8aaa;line-height:1.6;">Bonjour <strong style="color:#a0c0d8;">${user.display_name || user.full_name || user.email}</strong>,</p>
  <p style="margin:0 0 24px;font-size:14px;color:#6a8aaa;line-height:1.6;">La préférence de notification <strong style="color:#e8edf5;">${label}</strong> vient d'être <strong style="color:${enabled ? '#1dd8b4' : '#f87171'};">${action}</strong> sur votre compte.</p>
  <div style="background:rgba(10,22,40,0.7);border:1px solid rgba(56,170,220,0.15);border-left:3px solid ${enabled ? '#1dd8b4' : '#f87171'};border-radius:10px;padding:16px 20px;margin-bottom:28px;">
    <p style="margin:0;font-size:13px;color:#c8d8e8;">📌 <strong>${label}</strong> — <span style="color:${enabled ? '#1dd8b4' : '#f87171'};">${enabled ? '✓ Activée' : '✗ Désactivée'}</span></p>
  </div>
  <p style="margin:0;font-size:12px;color:#3a5a7a;">Si vous n'êtes pas à l'origine de cette modification, <a href="https://brenneaerial.fr/profile" style="color:#38aadc;">sécurisez votre compte</a>.</p>
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid rgba(56,170,220,0.1);text-align:center;">
  <p style="font-size:11px;color:#1e3050;margin:0;">Brenne Aerial · <a href="https://brenneaerial.fr" style="color:#38aadc;text-decoration:none;">brenneaerial.fr</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });
  };

  const togglePref = (key) => {
    const newValue = !localPrefs[key];
    const updated = { ...localPrefs, [key]: newValue };
    setLocalPrefs(updated);
    saveMutation.mutate(updated);
    // Find label for the toggled key
    const label = notificationOptions.flatMap(s => s.items).find(i => i.key === key)?.label || key;
    sendConfirmEmail(label, newValue).catch(() => {});
  };

  const notificationOptions = [
    {
      category: 'Communications',
      icon: Mail,
      items: [
        { key: 'email_notifications', label: 'Notifications par email', desc: 'Recevoir des mails importants' },
        { key: 'push_notifications', label: 'Notifications push', desc: 'Alertes en temps réel' },
        { key: 'new_messages', label: 'Nouveaux messages', desc: 'Quand vous recevez des messages' },
      ],
    },
    {
      category: 'Activité Compte',
      icon: Bell,
      items: [
        { key: 'quote_updates', label: 'Mise à jour des devis', desc: 'Changements de statut des devis' },
        { key: 'appointment_reminders', label: 'Rappels rendez-vous', desc: '24h avant votre rendez-vous' },
        { key: 'badge_awarded', label: 'Badge reçu', desc: 'Quand vous gagnez un badge' },
        { key: 'donation_updates', label: 'Mise à jour donations', desc: 'Confirmation des dons' },
      ],
    },
    {
      category: 'Marketing & Newsletter',
      icon: MessageSquare,
      items: [
        { key: 'newsletter', label: 'Newsletter', desc: 'Actualités et mises à jour' },
        { key: 'marketing_emails', label: 'Emails marketing', desc: 'Promotions et offres spéciales' },
      ],
    },
  ];

  const [testLoading, setTestLoading] = useState(false);

  const handleTestPush = async () => {
    setTestLoading(true);
    try {
      await base44.functions.invoke('sendWebPush', {
        user_email: user.email,
        title: '🔔 Test notification',
        body: 'Les notifications push fonctionnent correctement !',
        url: 'https://brenneaerial.fr',
      });
      toast.success('Notification de test envoyée !');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du test');
    }
    setTestLoading(false);
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success('Notifications push désactivées');
    } else {
      const ok = await subscribe();
      if (ok) toast.success('Notifications push activées ! 🔔');
      else if (permission === 'denied') toast.error('Autorisations bloquées — modifiez les paramètres de votre navigateur');
      else toast.error('Impossible d\'activer les notifications');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* Push Notifications block */}
      {isSupported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{ background: 'hsl(var(--card))', border: `1px solid ${isSubscribed ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSubscribed ? 'bg-primary/20 border border-primary/30' : 'bg-secondary border border-border'}`}>
                {isSubscribed ? <Smartphone className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-grotesk font-semibold text-sm">Notifications push</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">
                  {permission === 'denied'
                    ? '⚠️ Bloquées dans les paramètres du navigateur'
                    : isSubscribed
                    ? '✓ Activées sur cet appareil'
                    : 'Recevez des alertes directement sur votre écran'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSubscribed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestPush}
                  disabled={testLoading}
                  className="font-inter text-xs gap-1.5"
                  title="Envoyer une notification de test"
                >
                  {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FlaskConical className="w-3 h-3" />}
                  Test
                </Button>
              )}
              <Button
                size="sm"
                variant={isSubscribed ? 'outline' : 'default'}
                onClick={handlePushToggle}
                disabled={pushLoading || permission === 'denied'}
                className="font-inter text-xs"
              >
                {pushLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isSubscribed ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {notificationOptions.map((section, sectionIdx) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
            className="rounded-2xl p-6"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-grotesk font-semibold text-base">{section.category}</h3>
            </div>

            <div className="space-y-3">
              {section.items.map(item => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-inter text-sm font-medium">{item.label}</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => togglePref(item.key)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      localPrefs[item.key] ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                      animate={{ x: localPrefs[item.key] ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      <div className="flex items-center justify-between px-1">
        <p className="font-inter text-xs text-muted-foreground flex items-center gap-1.5">
          {saveMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          {saveMutation.isPending ? 'Sauvegarde...' : saveMutation.isSuccess ? '✓ Sauvegardé' : 'Les changements sont sauvegardés automatiquement'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { const d = getDefaultPrefs(); setLocalPrefs(d); saveMutation.mutate(d); }}
          className="text-xs text-muted-foreground"
        >
          Réinitialiser
        </Button>
      </div>
    </motion.div>
  );
}