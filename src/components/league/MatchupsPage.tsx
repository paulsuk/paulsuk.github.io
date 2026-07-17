import { useParams, useSearchParams } from "react-router-dom";
import { useSeasons, useRecap, usePlayoffs } from "../../api/hooks";
import { formatSeason } from "../../utils/records-helpers";
import SeasonPicker from "./SeasonPicker";
import PlayoffBracket from "./PlayoffBracket";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function MatchupsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonParam = searchParams.get("season");
  const weekParam = searchParams.get("week");

  const { data: seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(slug!);
  const selectedSeason = seasonParam
    ? Number(seasonParam)
    : seasons && seasons.length > 0 ? seasons[0].season : null;

  // 1) undated call learns the season's current/latest week (client-side cached)
  const { data: currentRecap } = useRecap(slug!, undefined, selectedSeason ?? undefined);
  // Guard against a stale response from the previous season: useApiData keeps old
  // data until the new fetch resolves, so trust currentWeek only when seasons agree.
  const seasonMatches =
    currentRecap != null && (selectedSeason == null || currentRecap.season === selectedSeason);
  const currentWeek = seasonMatches ? currentRecap.week : null;

  // 2) the page renders the selected week (falls back to current)
  const week = weekParam ? Number(weekParam) : currentWeek ?? undefined;
  const { data: recap, loading, error } = useRecap(slug!, week, selectedSeason ?? undefined);

  const selectedSeasonInfo = seasons?.find((s) => s.season === selectedSeason);
  const isFinished = selectedSeasonInfo?.is_finished ?? false;
  const { data: playoffData } = usePlayoffs(slug!, selectedSeason ?? undefined, isFinished);

  function goToWeek(w: number) {
    const next = new URLSearchParams(searchParams);
    next.set("week", String(w));
    setSearchParams(next);
  }

  if (seasonsLoading) return <LoadingSpinner />;
  if (seasonsError) return <ErrorBanner message={seasonsError} />;
  if (!seasons || seasons.length === 0) {
    return <ErrorBanner message="No synced seasons found for this league." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          {selectedSeason ? formatSeason(selectedSeason, slug!) : ""} Season
        </p>
        <SeasonPicker seasons={seasons} selected={selectedSeason}
          onChange={(s) => setSearchParams({ season: String(s) })} slug={slug!} />
      </div>

      {loading && <LoadingSpinner />}
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

          <div className="space-y-2">
            {recap.matchups.map((m) => (
              <div
                key={`${m.team_1_name}-${m.team_2_name}`}
                className="item-card flex items-center justify-between gap-3"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.team_1_name}</span>
                <span className="score-pill flex-shrink-0">{m.cats_won_1} – {m.cats_won_2}</span>
                <span className="min-w-0 flex-1 truncate text-right text-sm font-medium">{m.team_2_name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {isFinished && playoffData && playoffData.rounds.length > 0 && (
        <PlayoffBracket rounds={playoffData.rounds} totalRounds={playoffData.rounds.length} slug={slug!} />
      )}
    </div>
  );
}
