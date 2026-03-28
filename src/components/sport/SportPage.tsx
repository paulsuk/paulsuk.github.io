import { useParams, useSearchParams } from "react-router-dom";
import { useSeasons, useRecap, useArticles, usePlayoffs } from "../../api/hooks";
import { formatSeason } from "../../utils/records-helpers";
import { defaultScoringMode } from "../../utils/sport-config";
import SeasonPicker from "./SeasonPicker";
import SeasonOverview from "./SeasonOverview";
import RankingsSection from "./RankingsSection";
import ArticleFeed from "./ArticleFeed";
import PlayoffBracket from "./PlayoffBracket";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function SportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const scoringMode = defaultScoringMode(slug!);
  const seasonParam = searchParams.get("season");

  const { data: seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(slug!);

  // Determine selected season: from URL param, or latest available
  const selectedSeason = seasonParam
    ? Number(seasonParam)
    : seasons && seasons.length > 0
      ? seasons[0].season
      : null;

  const { data: recap, loading: recapLoading, error: recapError } = useRecap(
    slug!,
    undefined,
    selectedSeason ?? undefined
  );

  const { data: rawArticles } = useArticles(slug!, selectedSeason ?? undefined);
  // Also filter client-side to guarantee only current season articles appear
  const articles = selectedSeason != null
    ? rawArticles.filter((a) => a.season === selectedSeason)
    : rawArticles;

  const selectedSeasonInfo = seasons?.find((s) => s.season === selectedSeason);
  const isFinished = selectedSeasonInfo?.is_finished ?? false;
  const { data: playoffData } = usePlayoffs(slug!, selectedSeason ?? undefined, isFinished);

  function handleSeasonChange(season: number) {
    setSearchParams({ season: String(season) });
  }

  if (seasonsLoading) return <LoadingSpinner />;
  if (seasonsError) return <ErrorBanner message={seasonsError} />;
  if (!seasons || seasons.length === 0) {
    return <ErrorBanner message="No synced seasons found for this league." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{recap?.league_name ?? slug}</h1>
          <p className="text-sm text-gray-500">
            {selectedSeason ? formatSeason(selectedSeason, slug!) : ""} Season{recap ? ` — Week ${recap.week}` : ""}
          </p>
        </div>
        <SeasonPicker
          seasons={seasons}
          selected={selectedSeason}
          onChange={handleSeasonChange}
          slug={slug!}
        />
      </div>

      {recapLoading && <LoadingSpinner />}
      {recapError && <ErrorBanner message={recapError} />}

      {recap && (
        <>
          <SeasonOverview recap={recap} scoringMode={scoringMode} />
          <RankingsSection profiles={recap.profiles} season={selectedSeason ?? recap.season} />
        </>
      )}

      {isFinished && playoffData && playoffData.rounds.length > 0 && (
        <PlayoffBracket
          rounds={playoffData.rounds}
          totalRounds={playoffData.rounds.length}
          slug={slug!}
        />
      )}

      <ArticleFeed articles={articles} slug={slug!} />
    </div>
  );
}
