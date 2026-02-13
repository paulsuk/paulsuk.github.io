import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSeasons, useRecap, useArticles, usePlayoffs } from "../../api/hooks";
import type { ScoringMode } from "../records/RecordsPage";
import SeasonPicker from "./SeasonPicker";
import SeasonOverview from "./SeasonOverview";
import MatchupsSection from "./MatchupsSection";
import AwardsSection from "./AwardsSection";
import RankingsSection from "./RankingsSection";
import ArticleFeed from "./ArticleFeed";
import PlayoffBracket from "./PlayoffBracket";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function SportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scoringMode, setScoringMode] = useState<ScoringMode>(
    slug === "baseball" ? "category" : "matchup"
  );

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

  const { articles } = useArticles(slug!, selectedSeason ?? undefined);

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
            {selectedSeason} Season{recap ? ` — Week ${recap.week}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="toggle-group">
            <button
              onClick={() => setScoringMode("category")}
              className={`toggle-btn ${
                scoringMode === "category"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-l-md`}
            >
              Categories
            </button>
            <button
              onClick={() => setScoringMode("matchup")}
              className={`toggle-btn ${
                scoringMode === "matchup"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700"
              } rounded-r-md`}
            >
              Matchups
            </button>
          </div>
          <SeasonPicker
            seasons={seasons}
            selected={selectedSeason}
            onChange={handleSeasonChange}
          />
        </div>
      </div>

      {recapLoading && <LoadingSpinner />}
      {recapError && <ErrorBanner message={recapError} />}

      {recap && (
        <>
          <SeasonOverview recap={recap} scoringMode={scoringMode} />
          <MatchupsSection matchups={recap.matchups} week={recap.week} />
          <AwardsSection
            batter_of_week={recap.batter_of_week}
            pitcher_of_week={recap.pitcher_of_week}
            player_of_week={recap.player_of_week}
          />
          <RankingsSection profiles={recap.profiles} />
        </>
      )}

      {isFinished && playoffData && playoffData.rounds.length > 0 && (
        <PlayoffBracket
          rounds={playoffData.rounds}
          totalRounds={playoffData.rounds.length}
        />
      )}

      <ArticleFeed articles={articles} slug={slug!} />
    </div>
  );
}
