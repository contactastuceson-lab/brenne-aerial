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

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 border-b border-border/20 last:border-0">
      {/* Home */}
      <div className="flex flex-col items-end min-w-0">
        <span className={`text-xs truncate max-w-full text-right ${homeWon ? 'font-bold text-foreground' : 'text-muted-foreground/80'}`}>
          {match.homeTeam}
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-mono">{match.homeCountry}</span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {hasScore ? (
          <>
            <span className={`font-mono font-bold text-sm w-5 text-center ${homeWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {match.homeScore}
            </span>
            <span className="text-muted-foreground/30 text-xs">-</span>
            <span className={`font-mono font-bold text-sm w-5 text-center ${awayWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {match.awayScore}
            </span>
          </>
        ) : (
          <span className="text-[10px] text-primary/70 font-medium px-1">{formatDate(match.date)}</span>
        )}
      </div>

      {/* Away */}
      <div className="flex flex-col items-start min-w-0">
        <span className={`text-xs truncate max-w-full ${awayWon ? 'font-bold text-foreground' : 'text-muted-foreground/80'}`}>
          {match.awayTeam}
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-mono">{match.awayCountry}</span>
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
    <div className="mb-5 rounded-2xl bg-card border border-border p-4 space-y-3">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      {[1,2,3].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
    </div>
  );

  if (!matches.length) return null;

  const league = matches[0]?.league || 'Football';

  return (
    <div className="mb-5 rounded-2xl overflow-hidden bg-card border border-border">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          <span>⚽</span>
          <span className="font-grotesk font-bold text-sm text-foreground">Résultats</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 bg-muted/60 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
          {league}
        </span>
      </div>

      {/* Matches */}
      <div className="px-4 py-1">
        {matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>
    </div>
  );
}