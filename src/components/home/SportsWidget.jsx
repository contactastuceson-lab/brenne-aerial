import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isToday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return "Auj.";
  return format(d, 'd MMM', { locale: fr });
}

function StatusBadge({ status }) {
  const isLive = status === 'LIVE' || status === 'IN_PLAY' || status === 'PAUSED';
  const isScheduled = status === 'SCHEDULED' || status === 'TIMED';
  if (isLive) return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
      Live
    </span>
  );
  if (isScheduled) return (
    <span className="text-[10px] text-primary/70 font-medium">À venir</span>
  );
  return <span className="text-[10px] text-muted-foreground/40">Terminé</span>;
}

function MatchRow({ match }) {
  const homeWon = match.homeScore !== null && match.homeScore > match.awayScore;
  const awayWon = match.awayScore !== null && match.awayScore > match.homeScore;
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-border/20 last:border-0">
      {/* Date */}
      <div className="w-8 flex-shrink-0 text-center">
        <span className="text-[10px] text-muted-foreground/40 font-mono">
          {formatMatchDate(match.date)}
        </span>
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0">
        {/* Home */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-mono text-[9px] text-muted-foreground/40 w-5 flex-shrink-0">{match.homeCountry}</span>
          <span className={`text-[12px] truncate leading-tight ${homeWon ? 'font-bold text-foreground' : 'text-muted-foreground/70'}`}>
            {match.homeTeam}
          </span>
        </div>
        {/* Away */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-muted-foreground/40 w-5 flex-shrink-0">{match.awayCountry}</span>
          <span className={`text-[12px] truncate leading-tight ${awayWon ? 'font-bold text-foreground' : 'text-muted-foreground/70'}`}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Score or status */}
      <div className="flex-shrink-0 text-center w-10">
        {hasScore ? (
          <div className="bg-muted/60 rounded-md px-1.5 py-1 flex flex-col items-center leading-tight">
            <span className={`font-mono font-bold text-[13px] leading-none ${homeWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {match.homeScore}
            </span>
            <span className="font-mono font-bold text-[13px] leading-none mt-0.5 text-muted-foreground/30">—</span>
            <span className={`font-mono font-bold text-[13px] leading-none mt-0.5 ${awayWon ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {match.awayScore}
            </span>
          </div>
        ) : (
          <StatusBadge status={match.status} />
        )}
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

  if (isLoading) {
    return (
      <div className="mb-5 rounded-2xl bg-card border border-border p-4">
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-3" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-muted animate-pulse rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-2.5 w-1/2 bg-muted animate-pulse rounded" />
            </div>
            <div className="w-10 h-8 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!matches.length) return null;

  // Group by league
  const leagues = [...new Set(matches.map(m => m.league))];

  return (
    <div className="mb-5 rounded-2xl overflow-hidden bg-card border border-border">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚽</span>
          <h2 className="font-grotesk font-bold text-sm text-foreground">Résultats</h2>
        </div>
        {leagues.length === 1 && (
          <span className="text-[10px] font-medium text-muted-foreground/50 bg-muted/50 px-2 py-0.5 rounded-full">
            {leagues[0]}
          </span>
        )}
      </div>

      {/* Matches */}
      <div className="px-3 pb-2">
        {leagues.map(league => (
          <div key={league}>
            {leagues.length > 1 && (
              <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-1 pt-1 pb-1">
                {league}
              </p>
            )}
            {matches.filter(m => m.league === league).map(m => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}