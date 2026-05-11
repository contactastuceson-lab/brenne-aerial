import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isTopManagement } from '@/lib/roles';
import { Activity, Search, Filter, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const actionColors = {
  create: 'bg-green-400/10 text-green-400',
  update: 'bg-blue-400/10 text-blue-400',
  delete: 'bg-red-400/10 text-red-400',
  read: 'bg-gray-400/10 text-gray-400',
  login: 'bg-purple-400/10 text-purple-400',
  logout: 'bg-orange-400/10 text-orange-400',
};

const actionLabels = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  read: 'Lecture',
  login: 'Connexion',
  logout: 'Déconnexion',
};

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  const canAccess = isTopManagement(user);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-grotesk font-bold text-lg">Accès refusé</p>
        <p className="font-inter text-sm text-muted-foreground">Seuls le PDG et PDG-Adjoint peuvent accéder aux logs.</p>
      </div>
    );
  }

  const filtered = logs.filter(log => {
    const matchSearch = !search || 
      log.user_email.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(search.toLowerCase());
    const matchAction = !filterAction || log.action === filterAction;
    const matchEntity = !filterEntity || log.entity_type === filterEntity;
    return matchSearch && matchAction && matchEntity;
  });

  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))];
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl">Journal d'audit</h1>
            <p className="text-sm text-muted-foreground">{logs.length} événement(s) enregistré(s)</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email, entité ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-inter text-foreground"
          >
            <option value="">Toutes les actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{actionLabels[action] || action}</option>
            ))}
          </select>

          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-inter text-foreground"
          >
            <option value="">Tous les types</option>
            {uniqueEntities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-inter text-sm">Aucun log trouvé</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-grotesk font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-grotesk font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-grotesk font-semibold">Entité</th>
                  <th className="px-4 py-3 text-left font-grotesk font-semibold">Date & Heure</th>
                  <th className="px-4 py-3 text-left font-grotesk font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="font-inter font-medium text-xs">{log.user_name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{log.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-gray-400/10 text-gray-400'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="font-inter text-xs font-medium">{log.entity_type}</p>
                        {log.entity_id && (
                          <p className="font-mono text-[10px] text-muted-foreground truncate max-w-xs">{log.entity_id}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-inter text-xs text-muted-foreground">{formatDate(log.created_date)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-muted-foreground">{log.ip_address || '—'}</p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20 text-sm text-blue-600">
        <p className="font-inter text-xs">
          💡 Les logs sont enregistrés automatiquement pour chaque création, modification et suppression d'entités.
        </p>
      </div>
    </div>
  );
}