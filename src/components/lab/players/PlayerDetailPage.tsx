import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { usePlayerDetail, useLabUiConfig } from "../../../api/hooks";
import { useLabSport } from "../../../utils/use-lab-sport";
import { LAB_DEFAULT_SEASON, LAB_DEFAULT_MODEL } from "../../../utils/lab-config";
import { isNumericPlayerParam } from "../../../utils/lab-helpers";
import PlayerSearchBox from "./PlayerSearchBox";
import PlayerHeader from "./PlayerHeader";
import PlayerSelectors from "./PlayerSelectors";
import ValueBreakdown from "./ValueBreakdown";
import SeasonHistory from "./SeasonHistory";
import TransactionHistory from "./TransactionHistory";
import MLBStatsPanel from "./mlb/MLBStatsPanel";
import StatcastPanel from "./mlb/StatcastPanel";
import NBAStatsPanel from "./nba/NBAStatsPanel";
import EfficiencyPanel from "./nba/EfficiencyPanel";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import { LabNumericPlayerRedirect } from "../../shared/legacy-redirects";

export default function PlayerDetailPage() {
  const { slug, sportCode } = useLabSport();
  const { uid: playerParam } = useParams<{ uid: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [season, setSeason] = useState(searchParams.get("season") || LAB_DEFAULT_SEASON);
  const [model, setModel] = useState(searchParams.get("model") || LAB_DEFAULT_MODEL);
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  const isLegacyNumeric = !!playerParam && isNumericPlayerParam(playerParam);
  const { data: config, loading: configLoading } = useLabUiConfig(sportCode);
  const { data: player, loading, error } = usePlayerDetail(
    sportCode,
    isLegacyNumeric ? null : (playerParam ?? null),
    season, model, start, end,
  );

  if (isLegacyNumeric) {
    return (
      <LabNumericPlayerRedirect slug={slug} sportCode={sportCode} numericId={playerParam!} />
    );
  }

  if (configLoading || loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!player || !config) return null;

  const isPitcher = "ERA" in player.stats && !("HR" in player.stats);

  function navigateToPlayer(uid: string) {
    const params = new URLSearchParams({ season, model });
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    navigate(`/lab/${slug}/players/${encodeURIComponent(uid)}?${params.toString()}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top bar: back button + player search */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-ink-faint hover:text-ink-soft"
        >
          ← Back to Rankings
        </button>

        <PlayerSearchBox
          sportCode={sportCode}
          onSelect={(uid) => navigateToPlayer(uid)}
          placeholder="Find another player..."
        />
      </div>

      <PlayerHeader
        name={player.name}
        team={player.team}
        positions={player.positions}
        rank={player.rank}
        value={player.value}
      />

      <PlayerSelectors
        config={config}
        season={season}
        model={model}
        onSeasonChange={setSeason}
        onModelChange={setModel}
      />

      {player.data_source && (
        <p className="text-meta text-xs mb-4">{player.data_source}</p>
      )}

      {/* Sport-specific stats */}
      {sportCode === "mlb" ? (
        <>
          <MLBStatsPanel stats={player.stats} isPitcher={isPitcher} />
          <StatcastPanel stats={player.stats} isPitcher={isPitcher} />
        </>
      ) : (
        <>
          <NBAStatsPanel stats={player.stats} />
          <EfficiencyPanel stats={player.stats} />
        </>
      )}

      <ValueBreakdown items={player.value_breakdown} />

      {/* Rolling windows stub */}
      <div className="mb-6 rounded border border-dashed border-rule p-4 text-center">
        <p className="text-xs text-ink-faint">Rolling stat windows — coming soon</p>
      </div>

      <SeasonHistory rows={player.season_history} />
      <TransactionHistory records={player.transactions} />
    </div>
  );
}
