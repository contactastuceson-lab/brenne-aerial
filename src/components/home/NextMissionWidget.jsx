import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NextMissionWidget() {
  const { data: appointments = [] } = useQuery({
    queryKey: ['next-mission-widget'],
    queryFn: () => base44.entities.Appointment.filter({ status: 'confirmed' }, 'date', 10),
    staleTime: 60000,
  });

  const next = appointments.find(a => isAfter(parseISO(a.date), new Date()));

  if (!next) return null;

  return (
    <Link to="/planning"
      className="inline-flex items-center gap-3 bg-primary/10 border border-primary/25 hover:border-primary/50 hover:bg-primary/15 transition-all rounded-xl px-4 py-2.5 max-w-fit group">
      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Calendar className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest">Prochaine mission</p>
        <p className="font-grotesk font-semibold text-sm truncate">
          {next.service_type || 'Mission confirmée'} — {format(parseISO(next.date), 'dd MMM yyyy', { locale: fr })}
        </p>
        {next.location && (
          <p className="font-inter text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {next.location}
          </p>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  );
}