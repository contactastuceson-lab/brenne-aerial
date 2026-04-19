import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(68 100% 50%)', 'hsl(174 72% 51%)', 'hsl(0 72% 51%)', 'hsl(240 5% 65%)'];

export default function AdminStats() {
  const { t, lang } = useLanguage();

  const { data: quotes = [] } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: () => base44.entities.Quote.list(),
  });
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });
  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list(),
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => base44.entities.Appointment.list(),
  });

  const stats = [
    { label: t('admin.quotes'), value: quotes.length, icon: FileText, color: 'text-primary' },
    { label: t('admin.users'), value: users.length, icon: Users, color: 'text-accent' },
    { label: t('admin.messaging'), value: messages.length, icon: MessageSquare, color: 'text-chart-5' },
    { label: t('admin.appointments'), value: appointments.length, icon: Calendar, color: 'text-chart-4' },
  ];

  const quotesByStatus = ['pending', 'reviewing', 'accepted', 'refused'].map(s => ({
    name: t(`common.${s}`),
    value: quotes.filter(q => q.status === s).length,
  }));

  const quotesByService = ['consulting', 'development', 'design', 'maintenance', 'formation', 'autre']
    .map(s => ({ name: t(`services.${s}`), count: quotes.filter(q => q.service_type === s).length }))
    .filter(s => s.count > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-syne font-extrabold text-2xl">{t('admin.stats')}</h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          {lang === 'fr' ? 'Vue d\'ensemble de votre activité' : 'Overview of your activity'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="font-syne font-extrabold text-2xl">{s.value}</p>
            <p className="font-inter text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-syne font-bold text-sm mb-4">
            {lang === 'fr' ? 'Devis par statut' : 'Quotes by status'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quotesByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {quotesByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(240 5% 7.5%)', border: '1px solid hsl(240 4% 16%)', borderRadius: '8px', fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-syne font-bold text-sm mb-4">
            {lang === 'fr' ? 'Devis par service' : 'Quotes by service'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quotesByService}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(240 5% 65%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(240 5% 65%)' }} />
                <Tooltip contentStyle={{ background: 'hsl(240 5% 7.5%)', border: '1px solid hsl(240 4% 16%)', borderRadius: '8px', fontFamily: 'Inter' }} />
                <Bar dataKey="count" fill="hsl(68 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}