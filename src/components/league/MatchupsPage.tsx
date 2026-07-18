import { useParams, useSearchParams } from "react-router-dom";
import { useRecap, usePlayoffs } from "../../api/hooks";
import SeasonHeader from "./SeasonHeader";
import { NO_SEASONS_MESSAGE, useSeasonSelection } from "./useSeasonSelection";
import PlayoffBracket from "./PlayoffBracket";
import MatchupCard from "./MatchupCard";
import AwardsPodium from "./AwardsPodium";
import ErrorBanner from "../shared/ErrorBanner";
import Skeleton from "../shared/Skeleton";

export default function MatchupsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const weekParam = searchParams.get("week");

  const { seasons, selectedSeason, setSeason,
          loading: seasonsLoading, error: seasonsError } = useSeasonSelection(slug!);

  // 1) undated call learns the season's current/latest week (client-side cached)
  const { data: currentRecap } = useRecap(slug!, undefined, selectedSeason ?? undefined);
  // Guard against a stale response from the previous season: useApiData keeps old
  // data until the new fetch resolves, so trust currentWeek only when seasons agree.
  const seasonMatches =
    currentRecap != null && (selectedSeason == null || currentRecap.season === selectedSeason);
  const currentWeek = seasonMatches ? currentRecap.week : null;

  // 2) the page renders the selected week (falls back to current)
  const week = weekParam ? Number(weekParam) : currentWeek ?? undefined;
  const { data: recap, loading, error } = useRecap(slug!, week, selectedSeason ?? undefined, true);

  const selectedSeasonInfo = seasons?.find((s) => s.season === selectedSeason);
  const isFinished = selectedSeasonInfo?.is_finished ?? false;
  const { data: playoffData } = usePlayoffs(slug!, selectedSeason ?? undefined, isFinished);

  function goToWeek(w: number) {
    const next = new URLSearchParams(searchParams);
    next.set("week", String(w));
    setSearchParams(next);
  }

  if (seasonsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }
  if (seasonsError) return <ErrorBanner message={seasonsError} />;
  if (!seasons || seasons.length === 0) {
    return <ErrorBanner message={NO_SEASONS_MESSAGE} />;
  }

  return (
    <div className="space-y-8">
      <SeasonHeader slug={slug!} season={selectedSeason} seasons={seasons}
        onChange={setSeason} />

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}
      {error && <ErrorBanner message={error} />}

      {recap && (
        <>
          <div className="flex items-center justify-between">
            <button className="toggle-btn rounded-sm border border-rule disabled:opacity-40"
              disabled={!recap || recap.week <= 1} onClick={() => goToWeek(recap!.week - 1)}>
              ‹ Week {recap ? recap.week - 1 : ""}
            </button>
            <p className="eyebrow">
              Week {recap?.week} · {recap?.week_start} – {recap?.week_end}
            </p>
            <button className="toggle-btn rounded-sm border border-rule disabled:opacity-40"
              disabled={!recap || currentWeek == null || recap.week >= currentWeek}
              onClick={() => goToWeek(recap!.week + 1)}>
              Week {recap ? recap.week + 1 : ""} ›
            </button>
          </div>

          <AwardsPodium recap={recap} />

          <div className="grid gap-4 md:grid-cols-2">
            {recap.matchups.map((m, i) => <MatchupCard key={i} matchup={m} />)}
          </div>
        </>
      )}

      {isFinished && playoffData && playoffData.rounds.length > 0 && (
        <PlayoffBracket rounds={playoffData.rounds} />
      )}
    </div>
  );
}
