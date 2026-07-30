import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  Eye, Heart, MessageCircle, TrendingUp, Download, FileText, Loader2,
  BarChart3, Award, Zap, ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { hasAdvancedAnalytics } from '@/lib/subscriptionGating';
import { toast } from 'sonner';

const DAY = 86400000;

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n || 0);
}

function exportCSV(posts, stats) {
  const rows = [
    ['Statistique', 'Valeur'],
    ['Publications totales', stats.posts],
    ['Vues totales', stats.totalViews],
    ['Likes totaux', stats.totalLikes],
    ['Reponses totales', stats.totalReplies],
    ["Taux d'engagement %", stats.engagementRate],
    ['', ''],
    ['Top posts', ''],
    ['Titre', 'Vues', 'Likes', 'Reponses', 'Engagement %', 'Date'],
    ...posts.map(p => [
      (p.content || '').slice(0, 80).replace(/[\n,]/g, ' '),
      p.views_count || 0,
      p.likes_count || 0,
      p.replies_count || 0,
      (((p.likes_count || 0) + (p.replies_count || 0)) / Math.max(1, p.views_count || 0) * 100).toFixed(1),
      new Date(p.created_date).toLocaleDateString('fr-FR'),
    ]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eza-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPDF(posts, stats, timeSeries) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Rapport Analytics Eza', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

  doc.setTextColor(40);
  let y = 44;
  doc.setFontSize(13);
  doc.text('Synthese', 14, y);
  y += 8;
  doc.setFontSize(10);
  const summary = [
    ['Publications totales', stats.posts],
    ['Vues totales', stats.totalViews],
    ['Likes totaux', stats.totalLikes],
    ['Reponses totales', stats.totalReplies],
    ["Taux d'engagement", stats.engagementRate + '%'],
  ];
  summary.forEach(([label, val]) => {
    doc.setTextColor(100);
    doc.text(String(label), 14, y);
    doc.setTextColor(20);
    doc.text(String(val), 120, y);
    y += 6;
  });

  y += 8;
  doc.setFontSize(13);
  doc.setTextColor(40);
  doc.text('Top publications', 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Vues', 14, y);
  doc.text('Likes', 40, y);
  doc.text(' Rep.', 60, y);
  doc.text('Eng.', 80, y);
  doc.text('Apercu', 120, y);
  y += 5;

  const top = [...posts].sort((a, b) =>
    ((b.likes_count || 0) + (b.replies_count || 0)) - ((a.likes_count || 0) + (a.replies_count || 0))
  ).slice(0, 10);

  doc.setTextColor(30);
  top.forEach(p => {
    if (y > 270) { doc.addPage(); y = 20; }
    const eng = (((p.likes_count || 0) + (p.replies_count || 0)) / Math.max(1, p.views_count || 0) * 100).toFixed(1);
    doc.text(String(p.views_count || 0), 14, y);
    doc.text(String(p.likes_count || 0), 40, y);
    doc.text(String(p.replies_count || 0), 60, y);
    doc.text(eng + '%', 80, y);
    const excerpt = (p.content || '').slice(0, 50).replace(/\n/g, ' ');
    doc.text(excerpt, 120, y);
    y += 6;
  });

  y += 6;
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setTextColor(40);
  doc.text('Activite des 30 derniers jours', 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Date       Vues    Likes   Rep.', 14, y);
  y += 5;
  timeSeries.forEach(d => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.setTextColor(30);
    const date = d.date.slice(5);
    doc.text(`${date}   ${String(d.views).padStart(6)}  ${String(d.likes).padStart(6)}  ${String(d.replies).padStart(6)}`, 14, y);
    y += 5;
  });

  doc.save(`eza-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function AnalyticsDashboard({ user }) {
  const [range, setRange] = useState(30);
  const perks = user?.perks || {};
  const hasAnalytics = hasAdvancedAnalytics(perks);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['my-analytics-posts', user?.id],
    queryFn: () => base44.entities.Post.filter(
      { author_id: user.id, is_draft: false },
      '-created_date',
      200
    ),
    enabled: !!user?.id,
    staleTime: 60000,
  });

  const stats = useMemo(() => {
    const totalViews = posts.reduce((s, p) => s + (p.views_count || 0), 0);
    const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
    const totalReplies = posts.reduce((s, p) => s + (p.replies_count || 0), 0);
    const engagementRate = totalViews > 0
      ? (((totalLikes + totalReplies) / totalViews) * 100).toFixed(1)
      : '0.0';
    return { posts: posts.length, totalViews, totalLikes, totalReplies, engagementRate };
  }, [posts]);

  const timeSeries = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + DAY);
      const dayPosts = posts.filter(p => {
        const d = new Date(p.created_date);
        return d >= dayStart && d < dayEnd;
      });
      days.push({
        date: dayStart.toISOString().slice(0, 10),
        vues: dayPosts.reduce((s, p) => s + (p.views_count || 0), 0),
        likes: dayPosts.reduce((s, p) => s + (p.likes_count || 0), 0),
        replies: dayPosts.reduce((s, p) => s + (p.replies_count || 0), 0),
        posts: dayPosts.length,
      });
    }
    return days;
  }, [posts, range]);

  const topPosts = useMemo(() =>
    [...posts].sort((a, b) =>
      ((b.likes_count || 0) + (b.replies_count || 0) * 2 + (b.views_count || 0) * 0.01) -
      ((a.likes_count || 0) + (a.replies_count || 0) * 2 + (a.views_count || 0) * 0.01)
    ).slice(0, 10), [posts]);

  if (!hasAnalytics) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-7 h-7 text-amber-400" />
        </div>
        <h3 className="font-grotesk font-bold text-base mb-1">Analytics avancees</h3>
        <p className="font-inter text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
          Les graphiques d'evolution, le top des publications et l'export PDF/CSV sont reserves aux abonnes Business et Enterprise.
        </p>
        <Link to="/boutique">
          <Button size="sm" className="gap-1.5 text-xs h-9">
            <Zap className="w-3.5 h-3.5" /> Passer a Business
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-grotesk font-bold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Analytics
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {stats.posts} publications · {range} derniers jours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-secondary/40 rounded-lg p-0.5">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  range === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {d}j
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border"
            onClick={() => { exportCSV(topPosts, stats); toast.success('CSV exporte'); }}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border"
            onClick={async () => { await exportPDF(topPosts, stats, timeSeries); toast.success('PDF exporte'); }}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Publications', value: stats.posts, icon: BarChart3, color: 'text-primary' },
              { label: 'Vues totales', value: formatNum(stats.totalViews), icon: Eye, color: 'text-cyan-400' },
              { label: 'Likes', value: formatNum(stats.totalLikes), icon: Heart, color: 'text-rose-400' },
              { label: 'Engagement', value: stats.engagementRate + '%', icon: Zap, color: 'text-amber-400' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                  <Icon className={`w-4 h-4 mb-2 ${s.color}`} />
                  <p className="font-grotesk font-black text-2xl">{s.value}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-grotesk font-bold text-sm mb-3">Evolution des vues & engagement</h4>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(205 90% 58%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(205 90% 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195 80% 50%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(195 80% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="vues" stroke="hsl(205 90% 58%)" fill="url(#gViews)" name="Vues" strokeWidth={2} />
                <Area type="monotone" dataKey="likes" stroke="hsl(195 80% 50%)" fill="url(#gLikes)" name="Likes" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-grotesk font-bold text-sm mb-3">Publications par jour</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={d => d.slice(8)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="posts" fill="hsl(var(--primary))" name="Posts" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-grotesk font-bold text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Top publications
            </h4>
            {topPosts.length === 0 ? (
              <p className="font-inter text-xs text-muted-foreground text-center py-6">
                Pas encore de publication. Publiez pour voir vos statistiques.
              </p>
            ) : (
              <div className="space-y-1.5">
                {topPosts.map((p, i) => {
                  const eng = (((p.likes_count || 0) + (p.replies_count || 0)) / Math.max(1, p.views_count || 0) * 100).toFixed(1);
                  return (
                    <Link key={p.id} to={`/post/${p.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/40 transition-colors group">
                      <span className={`font-grotesk font-black text-xs w-5 text-center ${
                        i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-muted-foreground'
                      }`}>
                        #{i + 1}
                      </span>
                      <p className="font-inter text-xs text-foreground/80 flex-1 truncate">
                        {p.content?.slice(0, 60) || '(post)'}
                      </p>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-cyan-400">
                          <Eye className="w-3 h-3" /> {formatNum(p.views_count || 0)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-rose-400">
                          <Heart className="w-3 h-3" /> {formatNum(p.likes_count || 0)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-400">
                          <MessageCircle className="w-3 h-3" /> {formatNum(p.replies_count || 0)}
                        </span>
                        <span className="font-mono text-[10px] text-amber-400 hidden sm:inline">{eng}%</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}