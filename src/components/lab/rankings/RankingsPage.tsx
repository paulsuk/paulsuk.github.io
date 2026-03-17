// web/src/components/lab/rankings/RankingsPage.tsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLabUiConfig, useRankings } from "../../../api/hooks";
import type { RankingsFilter } from "../../../api/types";
import RankingsControls from "./RankingsControls";
import RankingsTable from "./RankingsTable";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";

export default function RankingsPage() {
  const { sport = "mlb" } = useParams<{ sport: string }>();
  const { data: config, loading: configLoading, error: configError } = useLabUiConfig(sport);

  const [filter, setFilter] = useState<RankingsFilter>({
    season: "",
    model: "",
    start: "",
    end: "",
    position: "All",
    team: "",
    availableOnly: false,
    punted: [],
    search: "",
  });

  // Apply defaults once config loads
  const effectiveFilter = useMemo<RankingsFilter>(() => {
    if (!config) return filter;
    return {
      ...filter,
      season: filter.season || config.seasons[0]?.id || "",
      model: filter.model || config.models.find((m) => m.default)?.id || config.models[0]?.id || "",
    };
  }, [config, filter]);

  const { data: rankings, loading: rankingsLoading, error: rankingsError } = useRankings(
    sport,
    {
      season: effectiveFilter.season,
      model: effectiveFilter.model,
      start: effectiveFilter.start || undefined,
      end: effectiveFilter.end || undefined,
      position: effectiveFilter.position !== "All" ? effectiveFilter.position : undefined,
      team: effectiveFilter.team || undefined,
      available_only: effectiveFilter.availableOnly || undefined,
      punt: effectiveFilter.punted.length ? effectiveFilter.punted.join(",") : undefined,
    }
  );

  const teams = useMemo(() => {
    const set = new Set(
      (rankings?.players ?? []).map((p) => p.team).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [rankings]);

  if (configLoading) return <LoadingSpinner />;
  if (configError || !config) return <ErrorBanner message={configError ?? "Failed to load config"} />;

  return (
    <div>
      <RankingsControls
        sport={sport}
        config={config}
        filter={effectiveFilter}
        teams={teams}
        onChange={(patch) => setFilter((f) => ({ ...f, ...patch }))}
      />

      {rankingsLoading && <LoadingSpinner />}
      {rankingsError && <ErrorBanner message={rankingsError} />}

      {rankings && (
        <>
          <p className="text-meta mb-3">{rankings.season_meta.data_source}</p>
          <RankingsTable
            sport={sport}
            players={rankings.players}
            season={effectiveFilter.season}
            model={effectiveFilter.model}
            start={effectiveFilter.start || undefined}
            end={effectiveFilter.end || undefined}
            search={effectiveFilter.search}
          />
        </>
      )}
    </div>
  );
}
