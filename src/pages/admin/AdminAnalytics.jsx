import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, FileText, Calendar, MessageSquare, Heart,
  Eye, Globe2, ArrowUpRight, ArrowDownRight, ExternalLink, Activity
} from 'lucide-react';
import { subDays, format, startOfDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['hsl(205 90% 58%)', 'hsl(195 80% 50%)', 'hsl(45 93% 58%)', 'hsl(0 72% 51%)', 'hsl(270 60% 60%)'];

function StatCard({ icon: Icon, label, value, sub, trend, color = 'text-primary', bg = 'bg-primary/10', border = 'border-primary/20' }) {
  return (
    <div className={`rounded-2xl border ${border} bg-card p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 font-mono text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-grotesk font-black text-3xl text-foreground">{value}</p>
      <p className="font-inter text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="font-mono text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-inter text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState(30);

  // Fetch all key entities
  const { data: quotes = [] } = useQuery({ queryKey: ['analytics-quotes'], queryFn: () => base44.entities.Quote.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['analytics-users'], queryFn: () => base44.entities.User.list('-created_date', 200) });
  const { data: appointments = [] } = useQuery({ queryKey: ['analytics-appointments'], queryFn: () => base44.entities.Appointment.list('-created_date', 200) });
  const { data: messages = [] } = useQuery({ queryKey: ['analytics-messages'], queryFn: () => base44.entities.ChatMessage.list('-created_date', 200) });
  const { data: donations = [] } = useQuery({ queryKey: ['analytics-donations'], queryFn: () => base44.entities.Donation.list('-created_date', 200) });
  const { data: discussions = [] } = useQuery({ queryKey: ['analytics-discussions'], queryFn: () => base44.entities.Discussion.list('-created_date', 200) });

  // Build daily data for the last `period` days
  const days = Array.from({ length: period }, (_, i) => {
    const d = subDays(new Date(), period - 1 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const countByDay = (items, dateField = 'created_date') =>
    days.map(day => ({
      date: day,
      label: format(parseISO(day), 'd MMM', { locale: fr }),
      count: items.filter(it => {
        const val = it[dateField];
        if (!val) return false;
        return val.startsWith(day);
      }).length,
    }));

  const quotesByDay = countByDay(quotes);
  const usersByDay = countByDay(users);

  // Combined chart data
  const chartData = days.map((day, i) => ({
    label: format(parseISO(day), 'd MMM', { locale: fr }),
    Devis: quotesByDay[i].count,
    Inscrits: usersByDay[i].count,
  }));

  // Period window filter
  const since = subDays(new Date(), period);
  const inPeriod = (items, field = 'created_date') =>
    items.filter(it => it[field] && new Date(it[field]) >= since);

  const recentQuotes = inPeriod(quotes);
  const recentUsers = inPeriod(users);
  const recentMessages = inPeriod(messages);
  const recentDonations = inPeriod(donations);

  // Conversion rate (quotes accepted / total)
  const accepted = quotes.filter(q => q.status === 'accepted' || q.status === 'completed').length;
  const conversionRate = quotes.length > 0 ? Math.round((accepted / quotes.length) * 100) : 0;

  // Revenue estimate
  const totalRevenue = quotes
    .filter(q => q.status === 'accepted' || q.status === 'completed')
    .reduce((s, q) => s + (q.prix_final || q.prix_estime || 0), 0);

  // Quote status breakdown for pie
  const statusCounts = ['pending', 'reviewing', 'accepted', 'refused', 'completed'].map(s => ({
    name: { pending: 'En attente', reviewing: 'En cours', accepted: 'Accepté', refused: 'Refusé', completed: 'Terminé' }[s],
    value: quotes.filter(q => q.status === s).length,
  })).filter(d => d.value > 0);

  // Service type breakdown
  const serviceLabels = {
    video_evenement: 'Vidéo événement', inspection_toiture: 'Inspection toiture',
    suivi_chantier: 'Suivi chantier', captation_particulier: 'Particulier',
    captation_entreprise: 'Entreprise', retour_temps_reel: 'Temps réel', autre: 'Autre',
  };
  const serviceData = Object.entries(serviceLabels).map(([key, label]) => ({
    name: label,
    value: quotes.filter(q => q.service_type === key).length,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Top forum activity
  const topDiscussions = [...discussions].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

  const totalDonationAmount = donations.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Analytique du site</h1>
          <p className="font-inter text-sm text-muted-foreground mt-0.5">Vue d'ensemble du trafic et des performances</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                period === d ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {d}j
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Devis reçus" value={recentQuotes.length} sub={`sur ${period} jours`} color="text-primary" bg="bg-primary/10" border="border-primary/20" />
        <StatCard icon={Users} label="Nouvelles inscriptions" value={recentUsers.length} sub={`total: ${users.length}`} color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
        <StatCard icon={TrendingUp} label="Taux de conversion" value={`${conversionRate}%`} sub={`${accepted} devis acceptés`} color="text-emerald-400" bg="bg-emerald-400/10" border="border-emerald-400/20" />
        <StatCard icon={Heart} label="Revenus estimés" value={`${totalRevenue.toLocaleString('fr-FR')} €`} sub={`${totalDonationAmount.toFixed(0)} € dons`} color="text-amber-400" bg="bg-amber-400/10" border="border-amber-400/20" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="RDV planifiés" value={appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length} sub="actifs" color="text-violet-400" bg="bg-violet-400/10" border="border-violet-400/20" />
        <StatCard icon={MessageSquare} label="Messages envoyés" value={recentMessages.length} sub={`sur ${period} jours`} color="text-cyan-400" bg="bg-cyan-400/10" border="border-cyan-400/20" />
        <StatCard icon={Activity} label="Discussions forum" value={discussions.length} sub={`${discussions.reduce((s, d) => s + (d.views_count || 0), 0)} vues totales`} color="text-orange-400" bg="bg-orange-400/10" border="border-orange-400/20" />
        <StatCard icon={Users} label="Membres totaux" value={users.length} sub="inscrits sur la plateforme" color="text-rose-400" bg="bg-rose-400/10" border="border-rose-400/20" />
      </div>

      {/* Evolution chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-grotesk font-bold text-base mb-6">Évolution — {period} derniers jours</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={Math.floor(period / 7)} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Devis" fill="hsl(205 90% 58%)" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="Inscrits" fill="hsl(195 80% 50%)" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quote status pie */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-grotesk font-bold text-base mb-6">Répartition des devis</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusCounts.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="font-inter text-xs">{s.name}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-grotesk font-bold text-base mb-6">Devis par prestation</h2>
          <div className="space-y-3">
            {serviceData.slice(0, 6).map((s, i) => (
              <div key={s.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-inter text-xs">{s.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.value}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${serviceData[0].value > 0 ? (s.value / serviceData[0].value) * 100 : 0}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top forum discussions */}
      {topDiscussions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-grotesk font-bold text-base mb-5">Top discussions forum</h2>
          <div className="space-y-3">
            {topDiscussions.map((d, i) => (
              <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <span className="font-grotesk font-black text-xl text-muted-foreground/30 w-7 text-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium truncate">{d.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">{d.author_display_name || d.author_name} · {d.category}</p>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1 font-mono text-xs"><Eye className="w-3 h-3" />{d.views_count || 0}</span>
                  <span className="flex items-center gap-1 font-mono text-xs"><MessageSquare className="w-3 h-3" />{d.replies_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-grotesk font-bold text-base mb-5">Outils externes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Google Search Console', desc: 'Trafic organique, impressions, clics', url: 'https://search.google.com/search-console', icon: Globe2, color: 'text-blue-400' },
            { label: 'PageSpeed Insights', desc: 'Performances & Core Web Vitals', url: 'https://pagespeed.web.dev/analysis?url=https://brenneaerial.fr', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Status Brenne Aerial', desc: 'Uptime et incidents en temps réel', url: 'https://status.brenneaerial.fr', icon: Activity, color: 'text-primary' },
          ].map(tool => {
            const Icon = tool.icon;
            return (
              <a key={tool.label} href={tool.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all group">
                <Icon className={`w-5 h-5 ${tool.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium group-hover:text-primary transition-colors">{tool.label}</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}