import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

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

  const togglePref = (key) => {
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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

      <div className="flex gap-2">
        <Button
          onClick={() => saveMutation.mutate(localPrefs)}
          disabled={saveMutation.isPending}
          className="flex-1"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            '💾 Sauvegarder les préférences'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocalPrefs(getDefaultPrefs())}
          className="flex-1"
        >
          🔄 Réinitialiser
        </Button>
      </div>

      <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
        <p className="font-inter text-xs text-blue-600">
          💡 Vous pouvez contrôler entièrement comment vous recevez les notifications. Ces paramètres ne s'appliquent qu'à vous.
        </p>
      </div>
    </motion.div>
  );
}