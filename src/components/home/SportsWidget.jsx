import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isToday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  return format(d, 'd MMM', { locale: fr });
}

function MatchRow({ match }) {
  const homeWon = match.homeScore !== null && match.homeScore > match.awayScore;
  const awayWon = match.awayScore !== null && match.awayScore > match.homeScore;
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const dateLabel = hasScore ? `Fin · ${formatMatchDate(match.date)}` : formatMatchDate(match.date);

  return (
    <div className="py-2 border-b border-border/20 last:border-0">
      {/* Home team */}
      <div className="flex items-center gap-2">
        <span className="w-6 font-mono text-[10px] text-muted-foreground/50 flex-shrink-0">{match.homeCountry}</span>
        <span className={`flex-1 text-xs truncate ${homeWon ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          {match.homeTeam}
        </span>
        {hasScore && (
          <span className={`font-mono font-bold text-xs w-4 text-right flex-shrink-0 ${homeWon ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.homeScore}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground/40 text-right w-20 flex-shrink-0 leading-tight row-span-2">
          {dateLabel}
        </span>
      </div>
      {/* Away team */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-6 font-mono text-[10px] text-muted-foreground/50 flex-shrink-0">{match.awayCountry}</span>
        <span className={`flex-1 text-xs truncate ${awayWon ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          {match.awayTeam}
        </span>
        {hasScore && (
          <span className={`font-mono font-bold text-xs w-4 text-right flex-shrink-0 ${awayWon ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.awayScore}
          </span>
        )}
        <span className="w-20 flex-shrink-0" />
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
        <div className="h-5 w-28 bg-muted animate-pulse rounded mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-3 space-y-1.5">
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!matches.length) return null;

  const league = matches[0]?.league || 'Football';

  return (
    <div className="mb-5 rounded-2xl overflow-hidden bg-card border border-border">
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-grotesk font-bold text-xl text-foreground">⚽ {league}</h2>
      </div>

      <div className="px-3 pb-1">
        {matches.map(m => <MatchRow key={m.id} match={m} />)}
      </div>

      <div className="px-3 pb-3 pt-2">
        <button className="w-full py-2 rounded-xl text-xs font-grotesk font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition-colors">
          Afficher plus →
        </button>
      </div>
    </div>
  );
}