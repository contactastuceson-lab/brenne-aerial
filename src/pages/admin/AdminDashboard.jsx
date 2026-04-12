import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, Users, Calendar, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, Download, Flag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice, SERVICE_PRICES } from '@/lib/droneUtils';
import { Link } from 'react-router-dom';

const CHART_COLORS = ['hsl(205 90% 58%)', 'hsl(195 80% 50%)', 'hsl(45 93% 58%)', 'hsl(0 72% 51%)', 'hsl(145 60% 50%)', 'hsl(270 60% 65%)'];

export default function AdminDashboard() {
  const { data: quotes = [] } = useQuery({ queryKey: ['adm-quotes'], queryFn: () => base44.entities.Quote.list('-created_date', 100) });
  const { data: users = [] } = useQuery({ queryKey: ['adm-users'], queryFn: () => base44.entities.User.list() });
  const { data: appts = [] } = useQuery({ queryKey: ['adm-appts'], queryFn: () => base44.entities.Appointment.list('-date', 50) });
  const { data: messages = [] } = useQuery({ queryKey: ['adm-msgs'], queryFn: () => base44.entities.Message.list('-created_date', 50) });
  const { data: reports = [] } = useQuery({ queryKey: ['adm-reports-dash'], queryFn: () => base44.entities.Report.filter({ status: 'pending' }) });

  const revenue = quotes.filter(q => q.status === 'accepted' || q.status === 'completed').reduce((s, q) => s + (q.prix_final || q.prix_estime || 0), 0);
  const conversionRate = quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'accepted' || q.status === 'completed').length / quotes.length) * 100) : 0;

  const exportQuotesCSV = () => {
    const rows = [['Client', 'Email', 'Service', 'Date souhaitée', 'Statut', 'Prix estimé', 'Prix final', 'Créé le']];
    quotes.forEach(q => rows.push([q.client_name || '', q.client_email || '', q.service_type || '', q.date_souhaitee || '', q.status || '', q.prix_estime || '', q.prix_final || '', q.created_date ? q.created_date.split('T')[0] : '']));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'devis.csv'; a.click();
  };

  const stats = [
    { label: 'Revenus estimés', value: formatPrice(revenue), icon: TrendingUp, color: 'text-primary' },
    { label: 'Devis total', value: quotes.length, icon: FileText, color: 'text-accent' },
    { label: 'Membres', value: users.length, icon: Users, color: 'text-chart-5' },
    { label: 'RDV planifiés', value: appts.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length, icon: Calendar, color: 'text-green-400' },
    { label: 'Taux de conversion', value: `${conversionRate}%`, icon: Percent, color: 'text-purple-400' },
    { label: 'Msgs non lus', value: messages.filter(m => !m.is_read).length, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Signalements', value: reports.length, icon: Flag, color: reports.length > 0 ? 'text-destructive' : 'text-muted-foreground' },
    { label: 'Devis acceptés', value: quotes.filter(q => q.status === 'accepted' || q.status === 'completed').length, icon: CheckCircle, color: 'text-green-400' },
  ];

  const byStatus = ['pending', 'reviewing', 'accepted', 'refused'].map(s => ({
    name: s, value: quotes.filter(q => q.status === s).length
  }));

  const byService = Object.keys(SERVICE_PRICES).map(k => ({
    name: SERVICE_PRICES[k].label.substring(0, 10), count: quotes.filter(q => q.service_type === k).length
  })).filter(s => s.count > 0);

  const recentQuotes = quotes.slice(0, 5);
  const pendingCount = quotes.filter(q => q.status === 'pending').length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Dashboard</h1>
          <p className="font-inter text-sm text-muted-foreground mt-1">Vue d'ensemble de Brenne Aerial</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportQuotesCSV} className="border-border text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exporter devis CSV
        </Button>
      </div>

      {/* Alerts */}
      {(pendingCount > 0 || unreadMessages > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {pendingCount > 0 && (
            <Link to="/admin/quotes" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-chart-5/10 border border-chart-5/30 font-inter text-xs text-chart-5 hover:bg-chart-5/20 transition-colors">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} devis en attente de traitement
            </Link>
          )}
          {unreadMessages > 0 && (
            <Link to="/admin/messaging" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 font-inter text-xs text-primary hover:bg-primary/20 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> {unreadMessages} message(s) non lu(s)
            </Link>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl bg-card border border-border">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="font-grotesk font-bold text-2xl">{s.value}</p>
            <p className="font-inter text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-grotesk font-semibold text-sm mb-4">Devis par statut</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(214 40% 7%)', border: '1px solid hsl(214 25% 14%)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-grotesk font-semibold text-sm mb-4">Devis par prestation</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byService}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 15% 55%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(214 40% 7%)', border: '1px solid hsl(214 25% 14%)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(205 90% 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent quotes */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-grotesk font-semibold text-sm">Devis récents</h3>
          <Link to="/admin/quotes" className="font-inter text-xs text-primary hover:underline">Voir tout</Link>
        </div>
        <div className="space-y-2">
          {recentQuotes.map(q => (
            <div key={q.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-inter text-sm font-medium">{q.client_name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{q.service_type?.replace(/_/g,' ')} • {q.date_souhaitee || '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                {q.prix_estime && <span className="font-mono text-xs text-primary">{formatPrice(q.prix_estime)}</span>}
                <StatusBadge status={q.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}