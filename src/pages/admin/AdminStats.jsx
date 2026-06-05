import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TOOLTIP_STYLE = { background: 'hsl(214 40% 7%)', border: '1px solid hsl(214 25% 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210 20% 94%)' };

export default function AdminStats() {
  const [monthsBack, setMonthsBack] = useState(0); // offset for 12-month window

  const { data: quotes = [] } = useQuery({ queryKey: ['stats-quotes'], queryFn: () => base44.entities.Quote.list('-created_date', 500) });
  const { data: appts = [] } = useQuery({ queryKey: ['stats-appts'], queryFn: () => base44.entities.Appointment.list('-date', 500) });

  // Build 12-month window ending at (today - monthsBack months)
  const endMonth = subMonths(new Date(), monthsBack);
  const months = Array.from({ length: 12 }, (_, i) => subMonths(endMonth, 11 - i));

  const monthData = months.map(m => {
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const interval = { start, end };

    const quotesThisMonth = quotes.filter(q => {
      try { return isWithinInterval(parseISO(q.created_date), interval); } catch { return false; }
    });
    const apptsThisMonth = appts.filter(a => {
      try { return isWithinInterval(parseISO(a.date), interval); } catch { return false; }
    });

    return {
      month: format(m, 'MMM yy', { locale: fr }),
      devis: quotesThisMonth.length,
      acceptes: quotesThisMonth.filter(q => q.status === 'accepted' || q.status === 'completed').length,
      rdv: apptsThisMonth.filter(a => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'completed').length,
      rdv_termines: apptsThisMonth.filter(a => a.status === 'completed').length,
      ca: quotesThisMonth.filter(q => q.status === 'accepted' || q.status === 'completed').reduce((s, q) => s + (q.prix_final || q.prix_estime || 0), 0),
    };
  });

  // Totals for the window
  const totals = monthData.reduce((acc, m) => ({
    devis: acc.devis + m.devis,
    acceptes: acc.acceptes + m.acceptes,
    rdv: acc.rdv + m.rdv,
    ca: acc.ca + m.ca,
  }), { devis: 0, acceptes: 0, rdv: 0, ca: 0 });

  const convRate = totals.devis > 0 ? Math.round((totals.acceptes / totals.devis) * 100) : 0;

  const summaryCards = [
    { label: 'Devis reçus', value: totals.devis, color: 'text-primary', bg: 'bg-primary/10', icon: FileText },
    { label: 'Devis acceptés', value: totals.acceptes, color: 'text-green-400', bg: 'bg-green-400/10', icon: TrendingUp },
    { label: 'RDV planifiés', value: totals.rdv, color: 'text-accent', bg: 'bg-accent/10', icon: Calendar },
    { label: 'Taux conversion', value: `${convRate}%`, color: 'text-chart-5', bg: 'bg-chart-5/10', icon: TrendingUp },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Statistiques d'activité</h1>
          <p className="font-inter text-sm text-muted-foreground mt-0.5">Suivi mensuel des devis et rendez-vous</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonthsBack(m => m + 12)} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Période préc.
          </Button>
          <span className="font-mono text-xs text-muted-foreground px-2">
            {format(months[0], 'MMM yyyy', { locale: fr })} – {format(months[11], 'MMM yyyy', { locale: fr })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setMonthsBack(m => Math.max(0, m - 12))} disabled={monthsBack === 0} className="gap-1">
            Période suiv. <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.bg}`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div>
              <p className={`font-grotesk font-bold text-2xl ${c.color}`}>{c.value}</p>
              <p className="font-inter text-xs text-muted-foreground">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Devis chart */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="font-grotesk font-semibold text-sm mb-4">Devis reçus vs acceptés par mois</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 25% 14%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="devis" name="Devis reçus" fill="hsl(205 90% 58%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="acceptes" name="Acceptés" fill="hsl(145 60% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RDV chart */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="font-grotesk font-semibold text-sm mb-4">Rendez-vous par mois</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 25% 14%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="rdv" name="RDV planifiés" stroke="hsl(195 80% 50%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="rdv_termines" name="RDV terminés" stroke="hsl(145 60% 50%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly detail table */}
      <div className="p-5 rounded-xl bg-card border border-border overflow-x-auto">
        <h3 className="font-grotesk font-semibold text-sm mb-4">Détail mois par mois</h3>
        <table className="w-full text-sm font-inter">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase">
              <th className="text-left pb-2">Mois</th>
              <th className="text-right pb-2">Devis reçus</th>
              <th className="text-right pb-2">Acceptés</th>
              <th className="text-right pb-2">Taux</th>
              <th className="text-right pb-2">RDV</th>
            </tr>
          </thead>
          <tbody>
            {[...monthData].reverse().map((m, i) => (
              <tr key={i} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                <td className="py-2 font-medium capitalize">{m.month}</td>
                <td className="py-2 text-right text-primary font-mono">{m.devis}</td>
                <td className="py-2 text-right text-green-400 font-mono">{m.acceptes}</td>
                <td className="py-2 text-right text-chart-5 font-mono">{m.devis > 0 ? Math.round((m.acceptes / m.devis) * 100) : 0}%</td>
                <td className="py-2 text-right text-accent font-mono">{m.rdv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}