import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Monitor, Smartphone, Tablet, LogOut, MapPin, Clock, Trash2, Loader2, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { isTopManagement } from '@/lib/roles';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const getDeviceIcon = (type) => {
  if (type === 'mobile') return Smartphone;
  if (type === 'tablet') return Tablet;
  return Monitor;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
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

export default function AdminSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  const [disconnectedUser, setDisconnectedUser] = useState(null);
  const [disconnectTimer, setDisconnectTimer] = useState(5);

  const canForceClose = isTopManagement(user);

  useEffect(() => {
    if (!disconnectedUser) return;
    if (disconnectTimer <= 0) {
      setDisconnectedUser(null);
      return;
    }
    const timer = setTimeout(() => setDisconnectTimer(disconnectTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [disconnectedUser, disconnectTimer]);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin-all-sessions'],
    queryFn: () => base44.entities.DeviceSession.list('-last_activity', 200),
    refetchInterval: 15000,
  });

  // Group sessions by user
  const sessionsByUser = sessions.reduce((acc, s) => {
    const key = s.user_email || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const deleteSingleMutation = useMutation({
    mutationFn: async (sessionId) => {
      const res = await base44.functions.invoke('deleteDeviceSession', { session_id: sessionId });
      return res.data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(['admin-all-sessions'], (old) => 
        old.filter(s => s.id !== sessionId)
      );
      setDisconnectedUser('session');
      setDisconnectTimer(5);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Erreur lors de la fermeture'),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const res = await base44.functions.invoke('adminDeleteAllSessions', { target_user_email: targetEmail || null });
      return res.data;
    },
    onSuccess: (data, targetEmail) => {
      queryClient.setQueryData(['admin-all-sessions'], (old) => 
        targetEmail ? old.filter(s => s.user_email !== targetEmail) : []
      );
      setDisconnectedUser(targetEmail || 'all');
      setDisconnectTimer(5);
      setConfirmAll(false);
      setConfirmUser(null);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Erreur lors de la fermeture des sessions'),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl">Sessions actives</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} session(s) — {Object.keys(sessionsByUser).length} utilisateur(s)</p>
          </div>
        </div>

        {canForceClose && (
          <div>
            {confirmAll ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Fermer toutes les sessions ?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteAllMutation.mutate(undefined)}
                  disabled={deleteAllMutation.isPending}
                >
                  {deleteAllMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmAll(false)}>Annuler</Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmAll(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Tout fermer
              </Button>
            )}
          </div>
        )}
      </div>

      {/* PDG access notice */}
      {!canForceClose && (
        <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-sm text-yellow-600">
          🔒 La fermeture forcée des sessions est réservée au PDG et PDG-Adjoint.
        </div>
      )}

      {/* Popup de déconnexion */}
      <AnimatePresence>
        {disconnectedUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <LogOut className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-grotesk font-bold text-xl">
                  {disconnectedUser === 'all' ? 'Toutes les sessions fermées' : 'Session fermée'}
                </h2>
                <p className="text-muted-foreground">
                  {disconnectedUser === 'all'
                    ? 'Tous les utilisateurs ont été déconnectés.'
                    : disconnectedUser === 'session'
                    ? 'La session a été fermée instantanément.'
                    : `Tous les appareils de cet utilisateur ont été déconnectés.`}
                </p>
                <div className="pt-4">
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">{disconnectTimer}s</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucune session active</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(sessionsByUser).map(([email, userSessions]) => (
            <motion.div
              key={email}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* User header */}
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-inter font-medium text-sm">{email}</span>
                  <Badge variant="outline" className="text-xs">{userSessions.length} session(s)</Badge>
                </div>
                {canForceClose && (
                  <div>
                    {confirmUser === email ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAllMutation.mutate(email)}
                          disabled={deleteAllMutation.isPending}
                          className="text-xs"
                        >
                          {deleteAllMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmer'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmUser(null)} className="text-xs">Annuler</Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmUser(email)}
                        className="gap-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs"
                      >
                        <LogOut className="w-3 h-3" />
                        Déco tout
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Sessions list */}
              <div className="divide-y divide-border/50">
                {userSessions.map((session) => {
                  const Icon = getDeviceIcon(session.device_type);
                  return (
                    <div key={session.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-inter text-sm font-medium">{session.device_name || 'Appareil inconnu'}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {session.ip_address && session.ip_address !== 'unknown' && (
                              <span className="font-mono text-xs text-muted-foreground">{session.ip_address}</span>
                            )}
                            {(session.city || session.country) && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {[session.city, session.country].filter(Boolean).join(', ')}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(session.last_activity || session.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {canForceClose && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSingleMutation.mutate(session.id)}
                          disabled={deleteSingleMutation.isPending}
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}