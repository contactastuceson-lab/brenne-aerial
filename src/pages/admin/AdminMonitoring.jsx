import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, Clock, Zap, RefreshCw, Brain,
  ChevronDown, ChevronUp, Activity, Wifi, Database, MessageSquare, FileText, Bell, Link, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG = {
  ok:       { icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'OK' },
  degraded: { icon: Zap,          color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Dégradé' },
  error:    { icon: AlertCircle,  color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Erreur' },
  timeout:  { icon: Clock,        color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Timeout' },
};

const SERVICE_ICONS = {
  aria_llm: Brain,
  nexus_agent: Brain,
  planning_scheduler: MessageSquare,
  quote_pdf: FileText,
  email_service: Bell,
  push_notifications: Bell,
  stripe_webhook: Activity,
  database_quotes: Database,
  database_notifications: Database,
  database_appointments: Database,
};

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ok;
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${
      status === 'ok' ? 'bg-green-400' :
      status === 'degraded' ? 'bg-yellow-400' :
      status === 'timeout' ? 'bg-orange-400' : 'bg-red-400'
    }`} />
  );
}

function ServiceCard({ name, label, logs }) {
  const [expanded, setExpanded] = useState(false);
  const latestLog = logs[0];
  if (!latestLog) return null;

  const cfg = STATUS_CONFIG[latestLog.status] || STATUS_CONFIG.ok;
  const Icon = SERVICE_ICONS[name] || Activity;
  const StatusIcon = cfg.icon;

  const last24h = logs.slice(0, 20);
  const uptimeCount = last24h.filter(l => l.status === 'ok').length;
  const uptime = last24h.length > 0 ? Math.round((uptimeCount / last24h.length) * 100) : 100;
  const avgResponse = last24h.length > 0
    ? Math.round(last24h.reduce((s, l) => s + (l.response_time_ms || 0), 0) / last24h.length)
    : 0;

  return (
    <motion.div
      layout
      className={`bg-card border ${cfg.border} rounded-xl overflow-hidden`}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-inter font-semibold text-sm">{label}</p>
            <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {avgResponse}ms moy.
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Uptime {uptime}%
            </span>
            {latestLog.checked_at && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(latestLog.checked_at), { addSuffix: true, locale: fr })}
              </span>
            )}
          </div>
        </div>

        {/* Mini sparkline */}
        <div className="flex items-end gap-0.5 h-6 flex-shrink-0">
          {last24h.slice(0, 12).reverse().map((log, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-sm ${
                log.status === 'ok' ? 'bg-green-400' :
                log.status === 'degraded' ? 'bg-yellow-400' :
                log.status === 'timeout' ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ height: `${Math.min(100, Math.max(20, 100 - (log.response_time_ms || 0) / 100))}%` }}
            />
          ))}
        </div>

        <div className="flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Latest incident diagnosis */}
              {latestLog.ai_diagnosis && (
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest">Diagnostic IA</span>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{latestLog.ai_diagnosis}</p>
                </div>
              )}

              {/* Log history */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Historique récent</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {logs.slice(0, 10).map((log, i) => {
                    const logCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.ok;
                    const LogIcon = logCfg.icon;
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <LogIcon className={`w-3 h-3 flex-shrink-0 mt-0.5 ${logCfg.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${logCfg.color}`}>{log.status.toUpperCase()}</span>
                            <span className="font-mono text-muted-foreground">{log.response_time_ms}ms</span>
                            <span className="font-mono text-muted-foreground/60 text-[10px]">
                              {log.checked_at ? formatDistanceToNow(new Date(log.checked_at), { addSuffix: true, locale: fr }) : ''}
                            </span>
                          </div>
                          {log.error_message && (
                            <p className="text-muted-foreground text-[10px] truncate mt-0.5">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminMonitoring() {
  const qc = useQueryClient();
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: logs = [], isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['monitoring-logs'],
    queryFn: () => base44.entities.MonitoringLog.list('-checked_at', 200),
    refetchInterval: 60000,
  });

  // Group logs by service
  const byService = logs.reduce((acc, log) => {
    if (!acc[log.service_name]) acc[log.service_name] = [];
    acc[log.service_name].push(log);
    return acc;
  }, {});

  // Latest log per service
  const latestByService = Object.entries(byService).map(([name, serviceLogs]) => ({
    name,
    label: serviceLogs[0]?.service_label || name,
    latestLog: serviceLogs[0],
    logs: serviceLogs,
  }));

  const incidents = latestByService.filter(s => s.latestLog?.is_incident);
  const degraded = latestByService.filter(s => s.latestLog?.status === 'degraded');
  const okServices = latestByService.filter(s => s.latestLog?.status === 'ok');

  const handleRunNow = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await base44.functions.invoke('runMonitoring', { manual: true });
      setRunResult(res.data);
      qc.invalidateQueries({ queryKey: ['monitoring-logs'] });
      if (res.data?.incidents > 0) {
        toast.warning(`${res.data.incidents} anomalie(s) détectée(s)`);
      } else {
        toast.success('Tous les services sont opérationnels');
      }
    } catch (e) {
      toast.error('Erreur lors du monitoring: ' + e.message);
    } finally {
      setRunning(false);
    }
  };

  const handleSimulate = async (status) => {
    const services = [
      { name: 'aria_llm', label: 'IA ARIA (Chatbot)' },
      { name: 'database_quotes', label: 'Base de données - Devis' },
      { name: 'email_service', label: 'Service Email (Notifications)' },
    ];
    const pick = services[Math.floor(Math.random() * services.length)];
    await base44.entities.MonitoringLog.create({
      service_name: pick.name,
      service_label: pick.label,
      status,
      response_time_ms: status === 'degraded' ? 8500 : 0,
      error_message: status === 'error' ? 'Connection refused: ECONNREFUSED (simulé)' : null,
      ai_diagnosis: status === 'error'
        ? '[CRITIQUE] Cause: Simulation de panne — le service ne répond plus. | Solution: Vérifier les logs Deno et relancer le déploiement.'
        : '[MINEURE] Cause: Temps de réponse élevé (simulé). | Solution: Surveiller pendant 15 min avant d\'escalader.',
      checked_at: new Date().toISOString(),
      is_incident: status === 'error',
      incident_resolved: false,
    });
    qc.invalidateQueries({ queryKey: ['monitoring-logs'] });
    toast.success(`Simulation "${status}" injectée sur ${pick.label}`);
  };

  const globalHealth = latestByService.length > 0
    ? Math.round((okServices.length / latestByService.length) * 100)
    : 100;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Monitoring IA</h1>
          <p className="font-inter text-sm text-muted-foreground">
            Surveillance automatique des services critiques — check toutes les 5 min
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleSimulate('degraded')} variant="outline" size="sm" className="gap-1.5 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10 text-xs">
            <Zap className="w-3 h-3" /> Simuler dégradé
          </Button>
          <Button onClick={() => handleSimulate('error')} variant="outline" size="sm" className="gap-1.5 text-red-400 border-red-400/30 hover:bg-red-400/10 text-xs">
            <AlertCircle className="w-3 h-3" /> Simuler erreur
          </Button>
          <Button onClick={handleRunNow} disabled={running} className="gap-2 bg-primary">
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Analyse...' : 'Lancer un check'}
          </Button>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`bg-card border rounded-xl p-4 ${globalHealth === 100 ? 'border-green-400/20' : globalHealth > 70 ? 'border-yellow-400/20' : 'border-red-400/20'}`}>
          <p className="font-mono text-xs text-muted-foreground">Santé globale</p>
          <p className={`font-grotesk font-bold text-2xl mt-1 ${globalHealth === 100 ? 'text-green-400' : globalHealth > 70 ? 'text-yellow-400' : 'text-red-400'}`}>
            {globalHealth}%
          </p>
        </div>
        <div className="bg-card border border-green-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-green-400">Opérationnels</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-green-400">{okServices.length}</p>
        </div>
        <div className="bg-card border border-yellow-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-yellow-400">Dégradés</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-yellow-400">{degraded.length}</p>
        </div>
        <div className="bg-card border border-red-400/20 rounded-xl p-4">
          <p className="font-mono text-xs text-red-400">En erreur</p>
          <p className="font-grotesk font-bold text-2xl mt-1 text-red-400">{incidents.length}</p>
        </div>
      </div>

      {/* AI Global Diagnosis (shown after manual check) */}
      {runResult?.ai_diagnosis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <p className="font-grotesk font-semibold text-sm">Analyse IA — Claude Sonnet</p>
          </div>
          <p className="font-inter text-sm text-muted-foreground mb-3">{runResult.ai_diagnosis.global_assessment}</p>
          {runResult.ai_diagnosis.incidents?.map((inc, i) => (
            <div key={i} className={`mt-2 p-3 rounded-lg border text-xs ${
              inc.severity === 'CRITIQUE' ? 'bg-red-400/5 border-red-400/20' :
              inc.severity === 'IMPORTANTE' ? 'bg-orange-400/5 border-orange-400/20' :
              'bg-yellow-400/5 border-yellow-400/20'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-mono font-bold text-[10px] ${
                  inc.severity === 'CRITIQUE' ? 'text-red-400' :
                  inc.severity === 'IMPORTANTE' ? 'text-orange-400' : 'text-yellow-400'
                }`}>{inc.severity}</span>
                <span className="font-inter font-medium">{inc.service}</span>
              </div>
              <p className="text-muted-foreground mb-1"><strong className="text-foreground">Cause :</strong> {inc.cause}</p>
              <p className="text-muted-foreground"><strong className="text-foreground">Solution :</strong> {inc.solution}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : latestByService.length === 0 ? (
        <div className="text-center py-16">
          <Wifi className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-inter text-sm text-muted-foreground">Aucune donnée — lancez un check pour démarrer</p>
          <Button onClick={handleRunNow} disabled={running} className="mt-4 gap-2">
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            Premier check
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Incidents first */}
          {[...incidents, ...degraded, ...okServices].map(({ name, label, logs: serviceLogs }) => (
            <ServiceCard key={name} name={name} label={label} logs={serviceLogs} />
          ))}
        </div>
      )}

      {/* Endpoints Section */}
      <EndpointsPanel />

      {dataUpdatedAt > 0 && (
        <p className="font-mono text-[10px] text-muted-foreground/50 text-center">
          Données actualisées {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true, locale: fr })}
          {' · '}Prochain check auto dans ~5 min
        </p>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex-shrink-0 p-1 rounded hover:bg-secondary/60 transition-colors">
      {copied
        ? <Check className="w-3 h-3 text-green-400" />
        : <Copy className="w-3 h-3 text-muted-foreground" />
      }
    </button>
  );
}

function EndpointsPanel() {
  const [open, setOpen] = useState(false);
  const BASE = 'https://brenneaerial.base44.app/api/functions';

  const endpoints = [
    { label: 'Monitoring global', fn: 'runMonitoring', desc: 'Déclenche tous les checks (BetterStack / cron externe)', icon: Activity },
    { label: 'Check statut modules', fn: 'statusCheck', desc: 'Vérifie l\'état des modules publics', icon: CheckCircle2 },
    { label: 'Génération PDF Devis', fn: 'generateQuotePDF', desc: 'Service PDF (POST + quoteId)', icon: FileText },
    { label: 'Service Email', fn: 'emailNotification', desc: 'Envoi de notifications email', icon: Bell },
    { label: 'Push Notifications', fn: 'pushNotification', desc: 'Envoi de notifications push', icon: Bell },
    { label: 'Webhook Stripe', fn: 'handleStripeWebhook', desc: 'Réception des événements Stripe', icon: Activity },
    { label: 'Agent PDG (Nexus)', fn: 'pdgAIAgent', desc: 'IA conversationnelle PDG', icon: Brain },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Link className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-inter font-semibold text-sm">Endpoints HTTP</p>
          <p className="font-mono text-[10px] text-muted-foreground">{endpoints.length} URLs disponibles — cliquer pour copier</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {endpoints.map(({ label, fn, desc, icon: Icon }) => (
                <div key={fn} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs font-medium">{label}</p>
                    <p className="font-mono text-[10px] text-primary truncate">{BASE}/{fn}</p>
                    <p className="font-inter text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <CopyButton text={`${BASE}/${fn}`} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}