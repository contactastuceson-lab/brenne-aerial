import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return "Auj.";
  return format(d, 'd MMM', { locale: fr });
}

function MatchRow({ match }) {
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const homeWon = hasScore && match.homeScore > match.awayScore;
  const awayWon = hasScore && match.awayScore > match.homeScore;
  const isDraw = hasScore && match.homeScore === match.awayScore;

  return (
    <div className="grid grid-cols-[1fr_52px_1fr] items-center gap-1 py-2.5 border-b border-white/5 last:border-0">
      {/* Home */}
      <div className="flex flex-col items-end gap-0.5 min-w-0 pr-1">
        <span className={`text-[12px] leading-tight truncate max-w-full text-right font-medium ${homeWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
          {match.homeTeam}
        </span>
        <span className="text-[9px] text-muted-foreground/30 font-mono tracking-wider">{match.homeCountry}</span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center">
        {hasScore ? (
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/8">
            <span className={`font-mono font-bold text-sm leading-none ${homeWon ? 'text-foreground' : isDraw ? 'text-muted-foreground/70' : 'text-muted-foreground/40'}`}>
              {match.homeScore}
            </span>
            <span className="text-muted-foreground/20 text-[10px]">:</span>
            <span className={`font-mono font-bold text-sm leading-none ${awayWon ? 'text-foreground' : isDraw ? 'text-muted-foreground/70' : 'text-muted-foreground/40'}`}>
              {match.awayScore}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-primary/80 font-semibold">{formatDate(match.date)}</span>
            <span className="text-[8px] text-muted-foreground/30 uppercase tracking-wide">à venir</span>
          </div>
        )}
      </div>

      {/* Away */}
      <div className="flex flex-col items-start gap-0.5 min-w-0 pl-1">
        <span className={`text-[12px] leading-tight truncate max-w-full font-medium ${awayWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
          {match.awayTeam}
        </span>
        <span className="text-[9px] text-muted-foreground/30 font-mono tracking-wider">{match.awayCountry}</span>
      </div>
    </div>
  );
}

export default function SportsWidget() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['football-scores'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getFootballScores', {});
      return res?.data?.matches || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) return (
    <div className="mb-4 rounded-2xl bg-white/3 border border-white/8 p-4 space-y-3">
      <div className="h-3.5 w-20 bg-white/8 animate-pulse rounded-full" />
      {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 animate-pulse rounded-xl" />)}
    </div>
  );

  if (!matches.length) return null;

  const league = matches[0]?.league || 'Football';

  return (
    <div className="mb-4 rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-sm">⚽</div>
          <span className="font-grotesk font-semibold text-[13px] text-foreground">Résultats</span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground/40 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full uppercase tracking-widest">
          {league}
        </span>
      </div>
      <div className="px-3 pb-2">
        {matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
    </div>
  );
}