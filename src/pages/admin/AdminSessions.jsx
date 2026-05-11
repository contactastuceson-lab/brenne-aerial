import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Monitor, Smartphone, Tablet, LogOut, MapPin, Clock, Shield, Loader2, AlertTriangle, Search, RefreshCw, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PDG_EMAILS, PDG_ADJOINT_EMAILS } from '@/lib/roles';

export default function AdminSessions() {
  const qc = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmKillAll, setConfirmKillAll] = useState(false);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const isTopMgmt = currentUser && (
    currentUser.role === 'owner' ||
    currentUser.role === 'pdg_adjoint' ||
    PDG_EMAILS.includes(currentUser.email) ||
    PDG_ADJOINT_EMAILS.includes(currentUser.email)
  );

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-all-sessions'],
    queryFn: async () => {
      const res = await base44.asServiceRole?.entities?.DeviceSession?.list('-last_activity', 200)
        .catch(() => base44.entities.DeviceSession.list('-last_activity', 200));
      return res || [];
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
  });

  const revokeOneMutation = useMutation({
    mutationFn: (sessionId) => base44.functions.invoke('deleteDeviceSession', { session_id: sessionId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-sessions'] });
      toast.success('Session révoquée');
    },
    onError: (err) => toast.error('Erreur: ' + err.message),
  });

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const toRevoke = sessions.filter(s => s.user_email !== currentUser?.email);
      for (const s of toRevoke) {
        await base44.functions.invoke('deleteDeviceSession', { session_id: s.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-sessions'] });
      toast.success('Toutes les sessions ont été révoquées');
      setConfirmKillAll(false);
    },
    onError: () => toast.error('Erreur lors de la révocation'),
  });

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'mobile') return Smartphone;
    if (deviceType === 'tablet') return Tablet;
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

  // Group by user
  const grouped = {};
  sessions.forEach(s => {
    if (!grouped[s.user_email]) grouped[s.user_email] = [];
    grouped[s.user_email].push(s);
  });

  const filtered = Object.entries(grouped).filter(([email]) =>
    !search || email.toLowerCase().includes(search.toLowerCase())
  );

  const mySessionId = sessionStorage.getItem('ba_device_session_id');

  if (!isTopMgmt && currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-grotesk font-bold text-lg">Accès refusé</p>
        <p className="font-inter text-sm text-muted-foreground">Seuls le PDG et le PDG-Adjoint peuvent gérer les sessions.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-grotesk font-bold text-2xl">Sessions Actives</h1>
              <p className="font-inter text-sm text-muted-foreground">
                {sessions.length} session{sessions.length > 1 ? 's' : ''} — {Object.keys(grouped).length} utilisateur{Object.keys(grouped).length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Actualiser
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmKillAll(true)}
              disabled={sessions.filter(s => s.user_email !== currentUser?.email).length === 0}
              className="gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Révoquer tout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="font-grotesk font-bold text-2xl text-primary">{sessions.length}</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Sessions totales</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="font-grotesk font-bold text-2xl text-green-400">{Object.keys(grouped).length}</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Utilisateurs connectés</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="font-grotesk font-bold text-2xl text-blue-400">{sessions.filter(s => s.device_type === 'desktop').length}</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Desktop</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="font-grotesk font-bold text-2xl text-orange-400">{sessions.filter(s => s.device_type === 'mobile').length}</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Mobile</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Confirm kill all dialog */}
      {confirmKillAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-grotesk font-bold">Révoquer toutes les sessions</h3>
                <p className="font-inter text-xs text-muted-foreground">Cette action déconnectera tous les utilisateurs</p>
              </div>
            </div>
            <p className="font-inter text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3">
              {sessions.filter(s => s.user_email !== currentUser?.email).length} session(s) seront révoquées.
              Votre propre session sera préservée.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmKillAll(false)}>Annuler</Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={revokeAllMutation.isPending}
                onClick={() => revokeAllMutation.mutate()}
              >
                {revokeAllMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">
          Aucune session trouvée
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(([email, userSessions]) => (
            <div key={email} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* User header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="font-mono text-xs text-foreground">{email}</p>
                  {email === currentUser?.email && (
                    <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Vous</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-inter text-xs text-muted-foreground">{userSessions.length} session{userSessions.length > 1 ? 's' : ''}</span>
                  {email !== currentUser?.email && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 px-2"
                      onClick={() => {
                        userSessions.forEach(s => revokeOneMutation.mutate(s.id));
                      }}
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Tout déco
                    </Button>
                  )}
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-border">
                {userSessions.map(session => {
                  const DeviceIcon = getDeviceIcon(session.device_type);
                  const isCurrentSession = session.session_id === mySessionId;
                  return (
                    <div key={session.id} className={`flex items-center gap-3 px-4 py-3 ${isCurrentSession ? 'bg-green-400/5' : ''}`}>
                      <DeviceIcon className={`w-4 h-4 flex-shrink-0 ${isCurrentSession ? 'text-green-400' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-inter text-xs font-medium truncate">{session.device_name || 'Appareil inconnu'}</p>
                          {isCurrentSession && (
                            <span className="font-mono text-[9px] bg-green-400/10 text-green-400 border border-green-400/20 px-1.5 py-0.5 rounded-full">Session actuelle</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {session.ip_address && session.ip_address !== 'unknown' && (
                            <span className="font-mono text-[10px] text-muted-foreground">{session.ip_address}</span>
                          )}
                          {(session.city || session.country) && (
                            <span className="font-inter text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {[session.city, session.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                          <span className="font-inter text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(session.last_activity || session.created_at)}
                          </span>
                        </div>
                      </div>
                      {!isCurrentSession && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                          onClick={() => revokeOneMutation.mutate(session.id)}
                          disabled={revokeOneMutation.isPending}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="mt-8 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="font-inter text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-yellow-400">Sécurité des sessions</p>
            <p>• Révoquer une session déconnecte immédiatement l'utilisateur concerné.</p>
            <p>• Votre propre session ne peut pas être révoquée depuis cette interface.</p>
            <p>• Accessible uniquement aux PDG et PDG-Adjoint.</p>
          </div>
        </div>
      </div>
    </div>
  );
}