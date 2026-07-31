import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Loader2, Gift, Zap, Calendar, Award } from 'lucide-react';
import { REWARD_ACTION_LIST } from '@/lib/rewardActions';
import { Link } from 'react-router-dom';

const ACTION_ICONS = {
  daily_login: Calendar,
  create_post: Sparkles,
  create_reply: Zap,
  like_post: Award,
  follow_user: TrendingUp,
  create_community: Gift,
  join_community: Gift,
  create_space: Zap,
  create_discussion: TrendingUp,
  share_post: Gift,
};

export default function RewardsDashboard({ user }) {
  const qc = useQueryClient();
  const [todayStats, setTodayStats] = useState({});

  // Historique des récompenses de l'utilisateur
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['reward-logs', user?.email],
    queryFn: () => base44.entities.RewardLog.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  // Calcul des stats du jour par action
  useEffect(() => {
    if (!logs.length) { setTodayStats({}); return; }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const stats = {};
    logs.forEach(l => {
      if (new Date(l.created_date) >= todayStart) {
        stats[l.action] = (stats[l.action] || 0) + 1;
      }
    });
    setTodayStats(stats);
  }, [logs]);

  const totalEarnedToday = logs
    .filter(l => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return new Date(l.created_date) >= todayStart;
    })
    .reduce((s, l) => s + (l.credits || 0), 0);

  const totalAllTime = logs.reduce((s, l) => s + (l.credits || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header — solde + stats */}
      <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/8 via-orange-400/5 to-primary/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-grotesk font-bold text-base">Économie de récompenses</h3>
            <p className="font-inter text-xs text-muted-foreground">Gagnez des crédits en utilisant la plateforme</p>
          </div>
          <div className="text-right">
            <p className="font-grotesk font-black text-2xl text-amber-400">{user?.referral_credits || 0}</p>
            <p className="font-mono text-[9px] text-muted-foreground/60 uppercase">crédits</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <p className="font-grotesk font-black text-xl text-foreground">+{totalEarnedToday}</p>
            <p className="font-inter text-[10px] text-muted-foreground mt-0.5">Crédits aujourd'hui</p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-center">
            <p className="font-grotesk font-black text-xl text-foreground">{totalAllTime}</p>
            <p className="font-inter text-[10px] text-muted-foreground mt-0.5">Total gagné (actions)</p>
          </div>
        </div>
      </div>

      {/* Catalogue des actions */}
      <div>
        <h4 className="font-grotesk font-bold text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Actions récompensées
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {REWARD_ACTION_LIST.map(({ key, credits, dailyCap, label, description }) => {
            const Icon = ACTION_ICONS[key] || Gift;
            const todayCount = todayStats[key] || 0;
            const remaining = Math.max(0, dailyCap - todayCount);
            const isMaxed = remaining === 0;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-3.5 transition-all ${
                  isMaxed
                    ? 'border-border bg-secondary/20 opacity-60'
                    : 'border-amber-400/20 bg-amber-400/5 hover:border-amber-400/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isMaxed ? 'bg-secondary/40' : 'bg-amber-400/15 border border-amber-400/25'
                  }`}>
                    <Icon className={`w-4 h-4 ${isMaxed ? 'text-muted-foreground' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-grotesk font-semibold text-sm truncate">{label}</p>
                      <span className={`flex items-center gap-0.5 font-grotesk font-black text-sm flex-shrink-0 ${
                        isMaxed ? 'text-muted-foreground' : 'text-amber-400'
                      }`}>
                        +{credits}
                      </span>
                    </div>
                    <p className="font-inter text-[11px] text-muted-foreground leading-snug">{description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isMaxed ? 'bg-muted-foreground/30' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, (todayCount / dailyCap) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground/60 flex-shrink-0">
                        {isMaxed ? 'Complet' : `${remaining}/${dailyCap} restant`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Historique récent */}
      {logs.length > 0 && (
        <div>
          <h4 className="font-grotesk font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Historique récent
          </h4>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="divide-y divide-border/50 max-h-[280px] overflow-y-auto">
                {logs.slice(0, 20).map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium truncate">{l.action_label || l.action}</p>
                      <p className="font-mono text-[10px] text-muted-foreground/50">
                        {new Date(l.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="font-grotesk font-black text-sm text-amber-400 flex-shrink-0">+{l.credits}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lien boutique */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
        <p className="font-inter text-sm text-muted-foreground mb-3">
          Dépensez vos crédits dans la boutique pour des boosts, pins et avantages exclusifs.
        </p>
        <Link to="/boutique"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
          <Gift className="w-4 h-4" /> Ouvrir la boutique
        </Link>
      </div>
    </div>
  );
}