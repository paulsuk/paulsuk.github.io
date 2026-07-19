import { Link } from "react-router-dom";
import { useArticles, useRecap } from "../../api/hooks";
import type { LeagueConfig } from "../../utils/league-config";
import { closestMatchup } from "../../utils/matchup-helpers";
import { formatRecord, rankStandings, recordFor } from "../../utils/records-helpers";
import Skeleton from "../shared/Skeleton";

const LEAGUE_ICONS: Record<string, string> = { baseball: "⚾", basketball: "🏀" };

interface LeagueHeroCardProps {
  league: LeagueConfig;
}

export default function LeagueHeroCard({ league }: LeagueHeroCardProps) {
  const recap = useRecap(league.slug);
  const articles = useArticles(league.slug);

  // Cold-start or network failure: never let the home page look broken —
  // fall back to the pre-task static form (icon + label + tagline only).
  const showData = !recap.error;

  const marquee = recap.data ? closestMatchup(recap.data.matchups) : null;
  const top3 = recap.data ? rankStandings(recap.data.standings, league.scoringMode).slice(0, 3) : [];
  const latest = articles.data?.[0] ?? null;

  return (
    <Link to={`/${league.slug}`} className="card-editorial group block p-6 hover:border-ink">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl">{LEAGUE_ICONS[league.slug] ?? "•"}</span>
        <div>
          <h2 className="font-display text-2xl group-hover:text-accent">{league.label}</h2>
          <p className="text-sm italic text-ink-faint">{league.tagline}</p>
        </div>
      </div>

      {showData && recap.loading && <Skeleton className="mt-4 h-24 w-full" />}

      {showData && recap.data && (
        <div className="mt-4 space-y-3">
          {marquee && (
            <p className="text-sm text-ink-soft">
              <span className="eyebrow mr-2">Week {recap.data.week}</span>
              {marquee.team_1_name} {marquee.cats_won_1}, {marquee.team_2_name} {marquee.cats_won_2}
            </p>
          )}
          <ol className="space-y-0.5 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            {top3.map((s) => (
              <li key={s.team_key} className="flex justify-between gap-2">
                <span className="truncate">
                  <span className="text-ink-faint mr-1.5">{s.displayRank}.</span>
                  {s.team_name}
                </span>
                <span className="text-ink-soft">
                  {formatRecord(recordFor(s, league.scoringMode))}
                </span>
              </li>
            ))}
          </ol>
          {latest && (
            <p className="border-t border-rule pt-2 text-sm">
              <span className="text-meta mr-2">Latest</span>
              <span className="text-ink-soft group-hover:text-ink">{latest.title}</span>
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
