/**
 * MyAffiliationsTab — Onglet côté AFFILIÉ (utilisateur membre d'une organisation).
 * Affiche les invitations reçues et les affiliations actives.
 * Permet d'accepter/refuser les invitations et de gérer sa visibilité.
 */

import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CheckCircle2, XCircle, Eye, EyeOff,
  Loader2, RefreshCw, Clock, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notifyAffiliationStatus } from '@/lib/affiliationNotifications';
import { useOrganizationAffiliations, refreshAffiliations } from '@/hooks/useOrganizationAffiliations';

const STATUS_STYLES = {
  accepted: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
  pending:  'border-amber-400/30 text-amber-400 bg-amber-400/10',
  rejected: 'border-red-400/30 text-red-400 bg-red-400/10',
  removed:  'border-border text-muted-foreground bg-muted/30',
};
const STATUS_LABELS = { accepted: 'Accepté', pending: 'Invitation reçue', rejected: 'Refusé', removed: 'Retiré' };
const ROLE_LABELS   = { member: 'Membre', moderator: 'Modérateur', admin: 'Admin' };

export default function MyAffiliationsTab({ user }) {
  const descriptor = useMemo(() => (user?.id ? { userId: user.id } : null), [user?.id]);
  const { affiliations, loading, error } = useOrganizationAffiliations(descriptor);

  const pending  = useMemo(() => affiliations.filter((r) => r.status === 'pending'),  [affiliations]);
  const accepted = useMemo(() => affiliations.filter((r) => r.status === 'accepted'), [affiliations]);
  const other    = useMemo(() => affiliations.filter((r) => r.status !== 'pending' && r.status !== 'accepted'), [affiliations]);

  const handleAccept = async (row) => {
    try {
      await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'respond',
        affiliationId: row.id,
        patch: { status: 'accepted' },
      });
      await notifyAffiliationStatus({
        targetEmail: user.email,
        organizationName: row.organizationName,
        status: 'accepted',
      });
      await refreshAffiliations({ userId: user.id });
      toast.success(`Affiliation avec ${row.organizationName} acceptée`);
    } catch (e) {
      toast.error(e?.message || 'Impossible d\'accepter l\'invitation');
    }
  };

  const handleReject = async (row) => {
    try {
      await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'respond',
        affiliationId: row.id,
        patch: { status: 'rejected' },
      });
      await refreshAffiliations({ userId: user.id });
      toast.success('Invitation refusée');
    } catch (e) {
      toast.error(e?.message || 'Impossible de refuser l\'invitation');
    }
  };

  const handleToggleVisibility = async (row) => {
    const next = row.visibility === 'public' ? 'private' : 'public';
    try {
      await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'respond',
        affiliationId: row.id,
        patch: { visibility: next },
      });
      await refreshAffiliations({ userId: user.id });
      toast.success(next === 'public' ? 'Badge affiché publiquement' : 'Badge masqué');
    } catch (e) {
      toast.error('Impossible de modifier la visibilité');
    }
  };

  if (loading && affiliations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Chargement de vos affiliations…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-grotesk font-semibold text-base">Mes affiliations</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organisations auxquelles vous êtes affilié ou avez été invité.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => refreshAffiliations({ userId: user.id })}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {error && affiliations.length === 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center">
          Erreur de chargement. Cliquez sur ↻ pour réessayer.
        </div>
      )}

      {/* ── Invitations en attente ── */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <p className="font-grotesk font-semibold text-sm text-amber-400">
              {pending.length} invitation{pending.length > 1 ? 's' : ''} en attente
            </p>
          </div>
          <AnimatePresence initial={false}>
            {pending.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {row.organizationAvatarUrl
                      ? <img src={row.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                      : <Building2 className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-grotesk font-semibold text-sm truncate">{row.organizationName || 'Organisation'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground border border-border rounded-full px-2 py-0.5">
                        {ROLE_LABELS[row.role] || row.role}
                      </span>
                      {row.createdAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      )}
                    </div>
                    {row.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{row.message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleAccept(row)}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepter
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={() => handleReject(row)}>
                    <XCircle className="w-3.5 h-3.5" /> Refuser
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Affiliations actives ── */}
      {accepted.length > 0 && (
        <div className="space-y-2">
          <p className="font-grotesk font-semibold text-sm text-muted-foreground uppercase tracking-wider text-[11px]">
            Affiliations actives
          </p>
          <AnimatePresence initial={false}>
            {accepted.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-xl border border-border bg-background/60 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {row.organizationAvatarUrl
                      ? <img src={row.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                      : <Building2 className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-grotesk font-semibold text-sm truncate">{row.organizationName || 'Organisation'}</p>
                      <span className={`text-[10px] font-mono uppercase tracking-wider rounded-full border px-2 py-0.5 ${STATUS_STYLES.accepted}`}>
                        {STATUS_LABELS.accepted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground border border-border rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" /> {ROLE_LABELS[row.role] || row.role}
                      </span>
                      <span className={`text-[10px] font-mono rounded-full border px-2 py-0.5 ${row.visibility === 'public' ? 'border-primary/30 text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>
                        {row.visibility === 'public' ? 'Badge visible' : 'Badge masqué'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 flex-shrink-0"
                  onClick={() => handleToggleVisibility(row)}
                >
                  {row.visibility === 'public' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {row.visibility === 'public' ? 'Masquer badge' : 'Afficher badge'}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Historique ── */}
      {other.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors select-none list-none flex items-center gap-2">
            <span className="group-open:hidden">▸</span>
            <span className="hidden group-open:inline">▾</span>
            Voir l'historique ({other.length} entrée{other.length > 1 ? 's' : ''})
          </summary>
          <div className="mt-2 space-y-2">
            {other.map((row) => (
              <div key={row.id} className="rounded-xl border border-border bg-background/40 p-3 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                  {row.organizationAvatarUrl
                    ? <img src={row.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                    : <Building2 className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{row.organizationName || 'Organisation'}</p>
                  <span className={`text-[10px] font-mono uppercase tracking-wider rounded-full border px-2 py-0.5 ${STATUS_STYLES[row.status] || ''}`}>
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ── État vide ── */}
      {!loading && affiliations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-2">
          <Building2 className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="font-grotesk font-semibold">Aucune affiliation</p>
          <p className="text-sm text-muted-foreground">
            Vous n'êtes affilié à aucune organisation pour le moment.
            Une organisation peut vous inviter à rejoindre son réseau.
          </p>
        </div>
      )}
    </div>
  );
}