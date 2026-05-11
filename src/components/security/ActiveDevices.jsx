import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Tablet, LogOut, MapPin, Clock, CheckCircle, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SESSION_KEY = 'ba_device_session_id';

export default function ActiveDevices({ user }) {
  const queryClient = useQueryClient();
  const [confirmDisconnect, setConfirmDisconnect] = useState(null);
  const [revokedTimer, setRevokedTimer] = useState(null);

  const currentSessionId = sessionStorage.getItem(SESSION_KEY);

  // Countdown timer for revocation
  useEffect(() => {
    if (revokedTimer === null) return;
    if (revokedTimer <= 0) {
      base44.auth.logout();
      return;
    }
    const timer = setTimeout(() => setRevokedTimer(revokedTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [revokedTimer]);

  // Subscription: when admin revokes current session → show timer popup
  useEffect(() => {
    if (!user?.email) return;
    const currentDeviceSessionId = sessionStorage.getItem(SESSION_KEY);
    if (!currentDeviceSessionId) return;
    
    const unsubscribe = base44.entities.DeviceSession.subscribe((event) => {
      // Find the current session in the list to compare IDs
      if (event.type === 'delete') {
        // event.id is the deleted session's ID
        if (event.id === currentDeviceSessionId) {
          setRevokedTimer(5);
        } else {
          queryClient.invalidateQueries({ queryKey: ['active-devices'] });
        }
      } else if (event.type === 'create' || event.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ['active-devices'] });
      }
    });
    return () => unsubscribe();
  }, [user?.email, queryClient]);

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['active-devices', user?.email],
    queryFn: () => base44.entities.DeviceSession.filter({ user_email: user.email }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });



  const currentDevice = devices.find(d => d.session_id === currentSessionId);
  const otherDevices = devices.filter(d => d.session_id !== currentSessionId);

  const disconnectMutation = useMutation({
    mutationFn: (sessionId) => base44.functions.invoke('deleteDeviceSession', { session_id: sessionId }),
    onSuccess: (_, sessionId) => {
      // Always invalidate to refresh list
      queryClient.invalidateQueries({ queryKey: ['active-devices'] });

      // If we just deleted the current session, logout
      if (sessionId === currentSessionId) {
        toast.success('Déconnexion en cours...');
        setTimeout(() => base44.auth.logout(), 1000);
      } else {
        toast.success('Appareil déconnecté');
      }
      setConfirmDisconnect(null);
    },
    onError: () => toast.error('Erreur lors de la déconnexion'),
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      for (const d of otherDevices) {
        await base44.functions.invoke('deleteDeviceSession', { session_id: d.session_id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-devices'] });
      toast.success('Tous les autres appareils ont été déconnectés');
    },
    onError: () => toast.error('Erreur lors de la déconnexion'),
  });

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'mobile') return Smartphone;
    if (deviceType === 'tablet') return Tablet;
    return Monitor;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 space-y-5"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-grotesk font-semibold text-base">Appareils connectés</h2>
            <p className="font-inter text-xs text-muted-foreground">{devices.length} appareil{devices.length > 1 ? 's' : ''} actif{devices.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        {otherDevices.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => disconnectAllMutation.mutate()}
            disabled={disconnectAllMutation.isPending}
            className="gap-2"
          >
            {disconnectAllMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Déco tout
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-inter text-sm text-muted-foreground">Aucun appareil enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentDevice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-green-400/30 bg-green-400/10"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {React.createElement(getDeviceIcon(currentDevice.device_type), {
                    className: 'w-5 h-5 text-green-500',
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-grotesk font-semibold text-sm">{currentDevice.device_name}</p>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[9px] font-mono text-green-600">
                      <CheckCircle className="w-2.5 h-2.5" /> Cet appareil
                    </span>
                  </div>
                  <div className="space-y-1">
                    {currentDevice.ip_address && currentDevice.ip_address !== 'unknown' && (
                      <p className="font-inter text-xs text-muted-foreground">
                        IP: <span className="font-mono">{currentDevice.ip_address}</span>
                      </p>
                    )}
                    <p className="font-inter text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentDevice.city
                        ? `${currentDevice.city}${currentDevice.country ? `, ${currentDevice.country}` : ''}`
                        : currentDevice.ip_address && currentDevice.ip_address !== 'unknown'
                          ? `Localisation en cours…`
                          : 'Localisation inconnue'}
                    </p>
                    <p className="font-inter text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(currentDevice.last_activity || currentDevice.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {otherDevices.map((device, i) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1">
                      {React.createElement(getDeviceIcon(device.device_type), {
                        className: 'w-5 h-5 text-muted-foreground',
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-grotesk font-semibold text-sm truncate">{device.device_name}</p>
                      <div className="space-y-1 mt-1">
                        {device.ip_address && device.ip_address !== 'unknown' && (
                          <p className="font-inter text-xs text-muted-foreground">
                            IP: <span className="font-mono">{device.ip_address}</span>
                          </p>
                        )}
                        <p className="font-inter text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {device.city
                            ? `${device.city}${device.country ? `, ${device.country}` : ''}`
                            : device.ip_address && device.ip_address !== 'unknown'
                              ? 'Localisation en cours…'
                              : 'Localisation inconnue'}
                        </p>
                        <p className="font-inter text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(device.last_activity || device.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDisconnect(device.id)}
                    className="gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <AnimatePresence>
                  {confirmDisconnect === device.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-border/50 space-y-2"
                    >
                      <p className="font-inter text-xs text-muted-foreground">Êtes-vous sûr ? Cet appareil sera déconnecté.</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => disconnectMutation.mutate(device.session_id)}
                          disabled={disconnectMutation.isPending}
                          className="flex-1 text-xs"
                        >
                          {disconnectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Déconnecter'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDisconnect(null)}
                          className="flex-1 text-xs"
                        >
                          Annuler
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
        <p className="font-inter text-xs text-blue-600">
          💡 Votre session actuelle est automatiquement marquée. Vous pouvez déconnecter les autres appareils.
        </p>
      </div>

      {/* Revocation security popup */}
      <AnimatePresence>
        {revokedTimer !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              className="bg-card border-2 border-destructive/50 rounded-2xl shadow-2xl p-8 max-w-sm mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                  <LogOut className="w-8 h-8 text-destructive animate-pulse" />
                </div>
                <div>
                  <h2 className="font-grotesk font-bold text-lg text-destructive mb-1">Session révoquée</h2>
                  <p className="text-muted-foreground text-sm">
                    Votre session a été fermée par un administrateur.
                  </p>
                </div>
                <div className="pt-4 space-y-3">
                  <div className="inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 w-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                    <span className="font-grotesk font-semibold text-destructive">Déconnexion en {revokedTimer}s</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vous serez automatiquement déconnecté.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}