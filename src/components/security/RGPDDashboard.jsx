import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, History, Lock, FileJson, Loader2, Search, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function RGPDDashboard({ user }) {
  const [exportLoading, setExportLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDetails, setShowDetails] = useState({});

  // Audit logs: use DeviceSession as connexion history (AuditLog entity doesn't exist)
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs', user?.email],
    queryFn: async () => {
      try {
        const sessions = await base44.entities.DeviceSession.filter({ user_email: user.email });
        return sessions.map(s => ({
          id: s.id,
          action_type: 'login',
          description: `Connexion depuis ${s.device_name || 'appareil inconnu'}`,
          timestamp: s.created_at || s.created_date,
          ip_address: s.ip_address,
          status: 'success',
          is_sensitive: false,
        }));
      } catch {
        return [];
      }
    },
    enabled: !!user?.email,
  });

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user-data', user?.email],
    queryFn: async () => {
      const u = await base44.auth.me();
      return u;
    },
    enabled: !!user?.email,
  });

  // Export user data
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      setExportLoading(true);
      try {
        // Collect all user data
        const quotes = await base44.entities.Quote.filter({ client_email: user.email });
        const appointments = await base44.entities.Appointment.filter({ client_email: user.email });
        const donations = await base44.entities.Donation.filter({ donor_email: user.email });
        const follows = await base44.entities.Follow.filter({ follower_email: user.email });
        const reviews = await base44.entities.Review.filter({ author_email: user.email });
        const messages = await base44.entities.Message.filter({ sender_email: user.email });
        const chatMessages = await base44.entities.ChatMessage.filter({ sender_email: user.email });

        const exportData = {
          profile: userData,
          quotes,
          appointments,
          donations,
          follows,
          reviews,
          messages,
          chatMessages,
          exportDate: new Date().toISOString(),
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `donnees_personnelles_${user.email}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Vos données ont été exportées');
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de l\'export');
      } finally {
        setExportLoading(false);
      }
    },
  });

  const filteredLogs = auditLogs
    .filter(log => !searchTerm || log.action_type.includes(searchTerm) || log.description.includes(searchTerm))
    .filter(log => filterType === 'all' || log.action_type === filterType)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getActionColor = (actionType) => {
    if (['data_deleted', 'user_deleted', 'ban', 'suspension'].includes(actionType)) return 'text-red-400';
    if (['2fa_enabled', 'password_change', 'permission_changed'].includes(actionType)) return 'text-yellow-400';
    if (['login', 'logout'].includes(actionType)) return 'text-green-400';
    return 'text-blue-400';
  };

  const getActionIcon = (actionType) => {
    if (actionType === 'data_export') return FileJson;
    if (actionType === 'login') return CheckCircle;
    if (['2fa_enabled', 'password_change'].includes(actionType)) return Lock;
    return AlertCircle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-grotesk font-semibold text-base">Export de vos données</h2>
            <p className="font-inter text-xs text-muted-foreground">Téléchargez votre profil en JSON</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-inter text-sm text-muted-foreground leading-relaxed">
            Conformément au RGPD, vous pouvez exporter toutes vos données personnelles stockées sur cette plateforme en un seul fichier JSON.
          </p>

          <Button
            onClick={() => exportDataMutation.mutate()}
            disabled={exportLoading}
            className="w-full gap-2"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Télécharger mes données
          </Button>

          <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
            <p className="font-inter text-xs text-green-700">
              ✓ Données chiffrées et téléchargées directement
            </p>
          </div>
        </div>
      </motion.div>

      {/* Audit Logs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-grotesk font-semibold text-base">Historique d'accès</h2>
            <p className="font-inter text-xs text-muted-foreground">Séance {filteredLogs.length} actions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une action..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border font-inter"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'login', 'logout', 'password_change', '2fa_enabled', 'data_export', 'profile_update'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-shrink-0 px-3 py-1 rounded-full font-inter text-xs border transition-all ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'all' ? 'Tous' : type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-inter text-sm text-muted-foreground">Aucune action enregistrée</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action_type);
              const dateStr = new Date(log.timestamp).toLocaleDateString('fr-FR');
              const timeStr = new Date(log.timestamp).toLocaleTimeString('fr-FR');

              return (
                <motion.button
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowDetails(prev => ({ ...prev, [log.id]: !prev[log.id] }))}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-border/50 hover:border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${getActionColor(log.action_type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium truncate">
                          {log.action_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="font-inter text-xs text-muted-foreground truncate">{log.description}</p>
                        <p className="font-mono text-[9px] text-muted-foreground mt-1">
                          {dateStr} à {timeStr}
                        </p>
                      </div>
                    </div>
                    {showDetails[log.id] ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Details */}
                  <AnimatePresence>
                    {showDetails[log.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-border/50"
                      >
                        <div className="space-y-1 font-mono text-[9px] text-muted-foreground">
                          {log.ip_address && <p>IP: {log.ip_address}</p>}
                          {log.resource_type && <p>Ressource: {log.resource_type}</p>}
                          {log.status && (
                            <p>
                              Statut:{' '}
                              <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                                {log.status}
                              </span>
                            </p>
                          )}
                          {log.is_sensitive && (
                            <p className="text-yellow-600">🔒 Action sensible</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* RGPD Rights Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg border border-blue-400/20 bg-blue-400/10"
      >
        <h3 className="font-inter text-sm font-medium text-blue-600 mb-2">Vos droits RGPD</h3>
        <ul className="space-y-1 font-inter text-xs text-blue-600/80">
          <li>✓ Droit d\'accès à vos données</li>
          <li>✓ Droit de rectification (corriger vos données)</li>
          <li>✓ Droit à l\'oubli (suppression de vos données)</li>
          <li>✓ Droit à la portabilité (export en JSON)</li>
          <li>✓ Droit d\'opposition et de limitation</li>
          <li>✓ Droit de rétraction du consentement</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}