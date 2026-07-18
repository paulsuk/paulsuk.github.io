import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSeasons, useRecap, useArticles } from "../../api/hooks";
import { formatSeason, winPct } from "../../utils/records-helpers";
import { defaultScoringMode } from "../../utils/league-config";
import SeasonPicker from "./SeasonPicker";
import RankingsSection from "./RankingsSection";
import AwardsPodium from "./AwardsPodium";
import ArticleCard from "../shared/ArticleCard";
import ErrorBanner from "../shared/ErrorBanner";
import Skeleton from "../shared/Skeleton";

export default function LeagueHubPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const scoringMode = defaultScoringMode(slug!);
  const seasonParam = searchParams.get("season");

  const { data: seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(slug!);
  const selectedSeason = seasonParam
    ? Number(seasonParam)
    : seasons && seasons.length > 0 ? seasons[0].season : null;

  const { data: recap, loading: recapLoading, error: recapError } = useRecap(
    slug!, undefined, selectedSeason ?? undefined
  );
  const { data: articles } = useArticles(slug!, selectedSeason ?? undefined);
  const latest = [...articles].sort((a, b) => b.date.localeCompare(a.date))[0];

  if (seasonsLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (seasonsError) return <ErrorBanner message={seasonsError} />;
  if (!seasons || seasons.length === 0) {
    return <ErrorBanner message="No synced seasons found for this league." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          {selectedSeason ? formatSeason(selectedSeason, slug!) : ""} Season
          {recap ? ` — Week ${recap.week}` : ""}
        </p>
        <SeasonPicker seasons={seasons} selected={selectedSeason}
          onChange={(s) => setSearchParams({ season: String(s) })} slug={slug!} />
      </div>

      {recapLoading && (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      {recapError && <ErrorBanner message={recapError} />}
      {recap && (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="section-rule eyebrow mb-3 pt-1">Latest story</h2>
              {latest ? (
                <ArticleCard article={latest} slug={slug!} />
              ) : (
                <p className="text-sm italic text-ink-faint">No stories this season yet. The typewriter is warming up.</p>
              )}
            </section>
            <RankingsSection profiles={recap.profiles} season={selectedSeason ?? recap.season} />
          </div>
          <aside className="space-y-2">
            {recap && <AwardsPodium recap={recap} compact />}
            <h2 className="section-rule eyebrow mb-3 pt-1">
              <Link to={`/${slug}/standings`} className="no-underline hover:text-accent">Standings ›</Link>
            </h2>
            {rankStandings(recap.standings, scoringMode).map((s) => {
              const w = scoringMode === "category" ? s.cat_wins : s.wins;
              const l = scoringMode === "category" ? s.cat_losses : s.losses;
              const t = scoringMode === "category" ? s.cat_ties : s.ties;
              return (
                <div key={s.team_key} className="flex items-baseline justify-between text-sm">
                  <span className="truncate">
                    <span className="agate mr-1.5">{s.displayRank}.</span>{s.team_name}
                  </span>
                  <span className="agate">{w}-{l}-{t} ({winPct(w, l, t)})</span>
                </div>
              );
            })}
          </aside>
        </div>
      )}
    </div>
  );
}
