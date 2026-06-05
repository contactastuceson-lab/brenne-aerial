import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, addWeeks, addMonths, addYears, startOfWeek, startOfMonth, startOfYear,
  isSameDay, isToday, isPast, getDaysInMonth, getDay, eachDayOfInterval, endOfMonth, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VIEWS = [
  { key: 'day', label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'year', label: 'Année' },
];

// getDayStatus: returns 'blocked' | 'unknown' | 'available' | 'booked' | null
function getStatusForDay(day, appointments, blockedDays, isAdmin) {
  const ds = format(day, 'yyyy-MM-dd');
  const block = blockedDays?.find(b => b.date === ds);
  if (block) return block.status; // 'blocked' or 'unknown'

  const slots = appointments.filter(a => a.date === ds);
  const available = slots.filter(s => s.status === 'confirmed' && !s.client_email && !s.client_name);
  const booked = slots.filter(s => s.status === 'scheduled');

  if (isAdmin) {
    if (slots.length > 0) return 'has_slots';
    return null;
  }
  if (available.length > 0) return 'available';
  if (booked.length > 0) return 'booked';
  return null;
}

function DayCell({ day, appointments, blockedDays, isAdmin, onSelect, selected, compact = false }) {
  const past = isPast(day) && !isToday(day);
  const today = isToday(day);
  const sel = selected && isSameDay(day, selected);
  const status = !past ? getStatusForDay(day, appointments, blockedDays, isAdmin) : null;

  const ds = format(day, 'yyyy-MM-dd');
  const slots = appointments.filter(a => a.date === ds);
  const available = slots.filter(s => s.status === 'confirmed' && !s.client_email && !s.client_name);
  const booked = slots.filter(s => s.status === 'scheduled');

  let cellClass = 'border-border bg-card hover:bg-secondary/40';
  let textClass = '';
  if (status === 'blocked') { cellClass = 'border-red-500/40 bg-red-500/10'; textClass = 'text-red-400'; }
  else if (status === 'unknown') { cellClass = 'border-gray-500/30 bg-gray-500/5'; textClass = 'text-gray-400'; }
  else if (sel) { cellClass = 'border-primary bg-primary/10 sky-glow scale-105'; textClass = 'text-primary'; }
  else if (today) { cellClass = 'border-primary/40 bg-primary/5 hover:bg-primary/10'; textClass = 'text-primary'; }
  else if (status === 'available') { cellClass = 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50'; }
  else if (status === 'has_slots') { cellClass = 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10'; }

  const clickable = !past && status !== 'blocked' && status !== 'unknown';

  return (
    <button
      disabled={!clickable && !isAdmin}
      onClick={() => onSelect && onSelect(day)}
      className={[
        'relative flex flex-col items-center rounded-xl border transition-all duration-200 py-2 px-1 text-center',
        compact ? 'min-h-[60px]' : 'min-h-[80px]',
        past ? 'opacity-30 cursor-default' : clickable || isAdmin ? 'cursor-pointer' : 'cursor-not-allowed',
        cellClass,
      ].join(' ')}
    >
      {today && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-[8px] uppercase font-bold">
          Auj
        </span>
      )}
      <p className={`font-mono text-[10px] uppercase mb-0.5 ${textClass || 'text-muted-foreground'}`}>
        {format(day, 'EEE', { locale: fr })}
      </p>
      <p className={`font-grotesk font-bold ${compact ? 'text-base' : 'text-lg'} ${textClass}`}>
        {format(day, 'd')}
      </p>
      {!past && (
        <div className="mt-1 flex flex-col items-center gap-0.5">
          {status === 'blocked' && <span className="font-mono text-[9px] text-red-400 font-bold">Indispo</span>}
          {status === 'unknown' && <span className="font-mono text-[9px] text-gray-400">?</span>}
          {(status === 'available' || status === 'has_slots') && available.length > 0 && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[9px] text-green-500 font-bold">{available.length}</span>
            </span>
          )}
          {booked.length > 0 && isAdmin && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30">
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="font-mono text-[9px] text-primary font-bold">{booked.length}</span>
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export default function CalendarViewSwitcher({ appointments = [], blockedDays = [], isAdmin = false, onDaySelect, selectedDay, extraHeaderContent }) {
  const [view, setView] = useState('week');
  const [anchor, setAnchor] = useState(new Date());

  const goToday = () => setAnchor(new Date());

  const navigate = (dir) => {
    if (view === 'day') setAnchor(d => addDays(d, dir));
    else if (view === 'week') setAnchor(d => addWeeks(d, dir));
    else if (view === 'month') setAnchor(d => addMonths(d, dir));
    else if (view === 'year') setAnchor(d => addYears(d, dir));
  };

  const periodLabel = () => {
    if (view === 'day') return format(anchor, 'EEEE d MMMM yyyy', { locale: fr });
    if (view === 'week') {
      const ws = startOfWeek(anchor, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return `${format(ws, 'd MMM', { locale: fr })} – ${format(we, 'd MMM yyyy', { locale: fr })}`;
    }
    if (view === 'month') return format(anchor, 'MMMM yyyy', { locale: fr });
    if (view === 'year') return format(anchor, 'yyyy');
  };

  // Days to render
  const renderDays = () => {
    if (view === 'day') return [anchor];
    if (view === 'week') {
      const ws = startOfWeek(anchor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    }
    if (view === 'month') {
      const ms = startOfMonth(anchor);
      const me = endOfMonth(anchor);
      // Fill grid: start from Monday of first week
      const gridStart = startOfWeek(ms, { weekStartsOn: 1 });
      const gridEnd = endOfWeek(me, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: gridStart, end: gridEnd });
    }
    if (view === 'year') {
      // Return first day of each month
      return Array.from({ length: 12 }, (_, i) => new Date(anchor.getFullYear(), i, 1));
    }
  };

  const days = renderDays();

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday} className="gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" /> Aujourd'hui
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)} className="h-8 w-8 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="font-grotesk font-semibold text-sm capitalize">{periodLabel()}</span>
        </div>

        <div className="flex items-center gap-1">
          {extraHeaderContent}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {VIEWS.map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={[
                  'px-3 py-1 rounded-md font-inter text-xs font-medium transition-all',
                  view === v.key ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div key={view + anchor.toISOString()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {view === 'year' ? (
            // Year: 12 months shown as month names with dot indicators
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {days.map((monthStart, idx) => {
                const monthDays = eachDayOfInterval({ start: startOfMonth(monthStart), end: endOfMonth(monthStart) });
                const hasAvailable = monthDays.some(d => {
                  const s = getStatusForDay(d, appointments, blockedDays, isAdmin);
                  return s === 'available' || s === 'has_slots';
                });
                const hasBlocked = monthDays.some(d => getStatusForDay(d, appointments, blockedDays, isAdmin) === 'blocked');
                const isCurrentMonth = monthStart.getMonth() === new Date().getMonth() && monthStart.getFullYear() === new Date().getFullYear();

                return (
                  <button
                    key={idx}
                    onClick={() => { setAnchor(monthStart); setView('month'); }}
                    className={[
                      'p-4 rounded-xl border text-left transition-all hover:scale-105',
                      isCurrentMonth ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:bg-secondary/40',
                    ].join(' ')}
                  >
                    <p className={`font-grotesk font-bold text-base capitalize ${isCurrentMonth ? 'text-primary' : ''}`}>
                      {format(monthStart, 'MMMM', { locale: fr })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {hasAvailable && <span className="w-2 h-2 rounded-full bg-green-500" />}
                      {hasBlocked && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : view === 'month' ? (
            // Month: 7-col grid with day-of-week headers
            <div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <p key={d} className="font-mono text-[10px] text-muted-foreground text-center uppercase py-1">{d}</p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const inMonth = day.getMonth() === anchor.getMonth();
                  return (
                    <div key={i} className={inMonth ? '' : 'opacity-25'}>
                      <DayCell
                        day={day}
                        appointments={appointments}
                        blockedDays={blockedDays}
                        isAdmin={isAdmin}
                        onSelect={onDaySelect}
                        selected={selectedDay}
                        compact
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Day / Week: simple row
            <div className={`grid gap-2 ${view === 'day' ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-7'}`}>
              {days.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  appointments={appointments}
                  blockedDays={blockedDays}
                  isAdmin={isAdmin}
                  onSelect={onDaySelect}
                  selected={selectedDay}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}