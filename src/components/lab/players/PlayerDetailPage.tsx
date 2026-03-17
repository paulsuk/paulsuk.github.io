import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { usePlayerDetail, useLabUiConfig, useRankings } from "../../../api/hooks";
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

export default function PlayerDetailPage() {
  const { sport = "mlb", id } = useParams<{ sport: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [season, setSeason] = useState(searchParams.get("season") || "projections");
  const [model, setModel] = useState(searchParams.get("model") || "gscore");
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  const playerId = id ? parseInt(id, 10) : null;

  // Player name search state
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all players for the current season/model (used for name search)
  const { data: allRankings } = useRankings(sport, {
    season,
    model,
    start: start || undefined,
    end: end || undefined,
  });

  // Filter players by typed name
  const searchResults =
    searchText.length >= 2
      ? (allRankings?.players ?? []).filter((p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase())
        ).slice(0, 10)
      : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: config, loading: configLoading } = useLabUiConfig(sport);
  const { data: player, loading, error } = usePlayerDetail(
    sport, playerId, season, model, start, end
  );

  if (configLoading || loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!player || !config) return null;

  const isPitcher = "ERA" in player.stats && !("HR" in player.stats);

  function navigateToPlayer(newPlayerId: number) {
    const params = new URLSearchParams({ season, model });
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    navigate(`/lab/players/${sport}/${newPlayerId}?${params.toString()}`);
    setSearchText("");
    setShowDropdown(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top bar: back button + player search */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to Rankings
        </button>

        {/* Player name search */}
        <div ref={searchRef} className="relative">
          <input
            type="search"
            placeholder="Find another player..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm w-52 shadow-sm"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {searchResults.map((p) => (
                <button
                  key={p.player_id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
                  onClick={() => navigateToPlayer(p.player_id)}
                >
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.positions ?? ""} · #{p.rank}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
      {sport === "mlb" ? (
        <>
          <MLBStatsPanel stats={player.stats} />
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
      <div className="mb-6 rounded border border-dashed border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-400">Rolling stat windows — coming soon</p>
      </div>

      <SeasonHistory rows={player.season_history} />
      <TransactionHistory records={player.transactions} />
    </div>
  );
}
