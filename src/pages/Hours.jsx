import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const dayLabelsEn = { lundi: 'Monday', mardi: 'Tuesday', mercredi: 'Wednesday', jeudi: 'Thursday', vendredi: 'Friday', samedi: 'Saturday', dimanche: 'Sunday' };

export default function Hours() {
  const { t, lang } = useLanguage();

  const { data: hours = [], isLoading } = useQuery({
    queryKey: ['business-hours'],
    queryFn: () => base44.entities.BusinessHours.list(),
  });

  const sortedHours = dayOrder.map(day => hours.find(h => h.day_of_week === day)).filter(Boolean);
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

  return (
    <div className="min-h-screen py-32 px-6 lg:px-20">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">{t('hours.title')}</p>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl mb-12">
            {t('hours.title')}<span className="text-primary">.</span>
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedHours.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-inter text-muted-foreground">
              {lang === 'fr' ? 'Les horaires seront bientôt disponibles.' : 'Hours will be available soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHours.map((h, i) => {
              const isToday = h.day_of_week === today;
              return (
                <motion.div
                  key={h.day_of_week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
                    isToday
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {isToday && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    <span className="font-syne font-bold text-base capitalize min-w-[100px]">
                      {lang === 'fr' ? h.day_of_week : dayLabelsEn[h.day_of_week]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {h.is_open ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="font-mono text-sm">
                          {h.open_time} — {h.close_time}
                        </span>
                        {h.break_start && h.break_end && (
                          <span className="font-mono text-xs text-muted-foreground ml-2">
                            ({t('hours.break')}: {h.break_start}–{h.break_end})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="font-mono text-sm text-muted-foreground">{t('hours.closed')}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}