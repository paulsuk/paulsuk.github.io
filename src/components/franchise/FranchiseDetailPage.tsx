import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useFranchiseDetail } from "../../api/hooks";
import type { FranchiseSeasonRecord, FranchiseH2HEntry, Trade, TransactionCount, SeasonKeepers, ScoringMode } from "../../api/types";
import Card from "../shared/Card";
import Stat from "../shared/Stat";
import SeasonRow from "../shared/SeasonRow";
import SeasonRoster from "./SeasonRoster";
import KeepersCard from "./KeepersCard";
import RosterTab from "./RosterTab";
import TradeCard from "./TradeCard";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import { ordinal, getMedals, getChampionshipYears, getFinishGroups, winPct } from "../../utils/records-helpers";

type ViewScope = "franchise" | "manager";
type DetailTab = "overview" | "roster";

export default function FranchiseDetailPage() {
  const { slug, franchiseId } = useParams<{ slug: string; franchiseId: string }>();
  const { data, loading, error } = useFranchiseDetail(slug!, franchiseId!);
  const [scoringMode, setScoringMode] = useState<ScoringMode>(
    slug === "baseball" ? "category" : "matchup"
  );
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [viewScope, setViewScope] = useState<ViewScope>("franchise");
  const [tradesExpanded, setTradesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [rosterSeason, setRosterSeason] = useState<number | null>(null);
  const [keeperSeason, setKeeperSeason] = useState<number | null>(null);

  // All useMemo hooks must be called before any early returns (Rules of Hooks)
  const isManagerView = viewScope === "manager";

  const currentEraFrom = useMemo(() => {
    if (!data) return 0;
    const ownership = data.overview.ownership;
    return ownership[ownership.length - 1].from;
  }, [data]);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    if (!isManagerView) return data.season_records;
    return data.season_records.filter((sr) => sr.season >= currentEraFrom);
  }, [data, isManagerView, currentEraFrom]);

  const filteredCounts = useMemo(() => {
    if (!data) return [];
    if (!isManagerView) return data.transactions.counts;
    return data.transactions.counts.filter((c: TransactionCount) => c.season >= currentEraFrom);
  }, [data, isManagerView, currentEraFrom]);

  const filteredTrades = useMemo(() => {
    if (!data) return [];
    if (!isManagerView) return data.transactions.trades;
    return data.transactions.trades.filter((t: Trade) => t.season >= currentEraFrom);
  }, [data, isManagerView, currentEraFrom]);

  const displayStats = useMemo(() => {
    if (!data) return { wins: 0, losses: 0, ties: 0, cat_wins: 0, cat_losses: 0, cat_ties: 0, championships: 0, best_finish: null as number | null, worst_finish: null as number | null };
    if (!isManagerView) return data.stats;
    let wins = 0, losses = 0, ties = 0, cat_wins = 0, cat_losses = 0, cat_ties = 0, championships = 0;
    let best_finish: number | null = null, worst_finish: number | null = null;
    for (const sr of filteredRecords) {
      wins += sr.wins; losses += sr.losses; ties += sr.ties;
      cat_wins += sr.cat_wins; cat_losses += sr.cat_losses; cat_ties += sr.cat_ties;
      if (sr.finish === 1) championships++;
      if (sr.finish != null && sr.finish > 0) {
        if (best_finish == null || sr.finish < best_finish) best_finish = sr.finish;
        if (worst_finish == null || sr.finish > worst_finish) worst_finish = sr.finish;
      }
    }
    return { wins, losses, ties, cat_wins, cat_losses, cat_ties, championships, best_finish, worst_finish };
  }, [data, isManagerView, filteredRecords]);

  const filteredKeepers = useMemo(() => {
    if (!data) return [];
    if (!isManagerView) return data.keepers;
    return data.keepers.filter((sk: SeasonKeepers) => sk.season >= currentEraFrom);
  }, [data, isManagerView, currentEraFrom]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return <ErrorBanner message="Franchise not found." />;

  const { overview, manager_eras, h2h, rosters, roster_costs, current_matchup } = data;
  const hasMultipleOwners = overview.ownership.length > 1;
  const isBaseball = slug === "baseball";

  const medals = getMedals(filteredRecords);
  const champYears = getChampionshipYears(filteredRecords);

  const w = scoringMode === "category" ? displayStats.cat_wins : displayStats.wins;
  const l = scoringMode === "category" ? displayStats.cat_losses : displayStats.losses;
  const t = scoringMode === "category" ? displayStats.cat_ties : displayStats.ties;
  const record = `${w}-${l}-${t}`;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to={`/${slug}/records`} className="text-sm text-gray-400 hover:text-gray-600">
        &larr; Back to Records
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {overview.current_team_name}
            {medals.length > 0 && <span className="ml-2">{medals.join("")}</span>}
          </h1>
          <p className="text-sm text-gray-500">
            {overview.name} franchise &middot; Managed by {overview.current_manager}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasMultipleOwners && (
            <div className="toggle-group">
              <button
                onClick={() => setViewScope("franchise")}
                className={`toggle-btn ${viewScope === "franchise" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"} rounded-l-md`}
              >
                All-Time
              </button>
              <button
                onClick={() => setViewScope("manager")}
                className={`toggle-btn ${viewScope === "manager" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"} rounded-r-md`}
              >
                Current Manager
              </button>
            </div>
          )}
          <div className="toggle-group">
            <button
              onClick={() => setScoringMode("category")}
              className={`toggle-btn ${scoringMode === "category" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"} rounded-l-md`}
            >
              Categories
            </button>
            <button
              onClick={() => setScoringMode("matchup")}
              className={`toggle-btn ${scoringMode === "matchup" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"} rounded-r-md`}
            >
              Matchups
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`tab-btn ${activeTab === "overview" ? "tab-btn-active" : ""}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`tab-btn ${activeTab === "roster" ? "tab-btn-active" : ""}`}
        >
          Roster
        </button>
      </div>

      {activeTab === "overview" && <>
      {/* Stats overview */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Overall Record" value={record} />
          <Stat
            label="Championships"
            value={champYears.length > 0 ? `${champYears.length} (${champYears.join(", ")})` : "0"}
          />
          <Stat label="Best Finish" value={displayStats.best_finish ? ordinal(displayStats.best_finish) : "N/A"} />
          <Stat
            label="Playoff Finishes"
            value={formatFinishGroups(getFinishGroups(filteredRecords, "finish").filter((g) => g.rank <= 3))}
          />
          <Stat label="Seasons" value={filteredRecords.map((sr) => sr.season).join(", ")} />
          <Stat label="Win %" value={winPct(w, l, t)} />
        </div>
      </Card>

      {/* Ownership Timeline */}
      <Card title="Ownership History">
        {overview.ownership.length === 1 ? (
          <p className="text-sm text-gray-600">
            {overview.ownership[0].manager} &middot; Est. <span className="text-gray-400">{overview.ownership[0].from}</span> &mdash; present
          </p>
        ) : (
          <div className="space-y-1">
            {overview.ownership.map((o) => (
              <div key={o.guid} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{o.manager}</span>
                <span className="text-gray-400 tabular-nums">
                  {o.from}{o.to ? `\u2013${o.to}` : "+"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Manager Eras (only for multi-owner franchises, hidden in manager view) */}
      {manager_eras.length > 1 && !isManagerView && (
        <Card title="Manager Eras">
          <div className="space-y-3">
            {manager_eras.map((era) => {
              const ew = scoringMode === "category" ? era.cat_wins : era.wins;
              const el = scoringMode === "category" ? era.cat_losses : era.losses;
              const et = scoringMode === "category" ? era.cat_ties : era.ties;
              return (
                <div key={era.guid} className="item-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{era.name}</div>
                      <div className="text-label">
                        <span className="text-gray-400">{era.from}{era.to ? `\u2013${era.to}` : "+"}</span> &middot; {era.seasons.length} season{era.seasons.length !== 1 ? "s" : ""}
                        {era.championships > 0 && (
                          <span className="ml-2 badge-championship">
                            {era.championships}x champ
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="stat-value">
                      {ew}-{el}{et > 0 ? `-${et}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Season-by-Season */}
      <Card title="Season Breakdown">
        <div className="space-y-1">
          {filteredRecords.map((sr: FranchiseSeasonRecord) => (
            <div key={sr.season}>
              <button
                onClick={() => setExpandedSeason(expandedSeason === sr.season ? null : sr.season)}
                className="w-full text-left"
              >
                <SeasonRow season={sr} showManager={manager_eras.length > 1} scoringMode={scoringMode} />
              </button>
              {current_matchup && current_matchup.season === sr.season && (
                <div className="pl-4 py-1 text-sm text-gray-500">
                  This Week (Wk {current_matchup.week}): vs {current_matchup.opponent_team_name} &mdash;{" "}
                  <span className="font-medium tabular-nums text-gray-700">
                    {current_matchup.cats_won}-{current_matchup.cats_lost}
                    {current_matchup.cats_tied > 0 ? `-${current_matchup.cats_tied}` : ""}
                  </span>
                  {current_matchup.is_playoffs && (
                    <span className="ml-1.5 text-xs text-amber-600 font-medium">Playoffs</span>
                  )}
                </div>
              )}
              {expandedSeason === sr.season && rosters[sr.season] && (
                <SeasonRoster players={rosters[sr.season]} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* H2H vs Other Franchises */}
      {h2h.length > 0 && (
        <Card title="Head-to-Head vs Other Franchises">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="pb-2 pr-4">Franchise</th>
                  <th className="pb-2 pr-4">W</th>
                  <th className="pb-2 pr-4">L</th>
                  <th className="pb-2 pr-4">T</th>
                  <th className="pb-2">Win %</th>
                </tr>
              </thead>
              <tbody>
                {h2h.map((entry: FranchiseH2HEntry) => {
                  const pct = winPct(entry.wins, entry.losses, entry.ties);
                  const isWinning = entry.wins > entry.losses;
                  const isLosing = entry.wins < entry.losses;
                  return (
                    <tr key={entry.franchise_id} className="border-b border-gray-50">
                      <td className="py-1.5 pr-4">
                        <Link
                          to={`/${slug}/franchise/${entry.franchise_id}`}
                          className="font-medium text-gray-700 hover:text-gray-900"
                        >
                          {entry.name}
                        </Link>
                      </td>
                      <td className={`py-1.5 pr-4 tabular-nums ${isWinning ? "text-green-600" : ""}`}>
                        {entry.wins}
                      </td>
                      <td className={`py-1.5 pr-4 tabular-nums ${isLosing ? "text-red-600" : ""}`}>
                        {entry.losses}
                      </td>
                      <td className="py-1.5 pr-4 tabular-nums text-gray-400">{entry.ties}</td>
                      <td className="py-1.5 tabular-nums">{pct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Keepers */}
      {filteredKeepers.length > 0 && (
        <KeepersCard
          keepers={filteredKeepers}
          isBaseball={isBaseball}
          selectedSeason={keeperSeason}
          onSeasonChange={setKeeperSeason}
        />
      )}

      {/* Transaction Activity */}
      <Card title="Transaction Activity">
        {/* Adds/Drops summary */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="pb-2 pr-4">Season</th>
                <th className="pb-2 pr-4">Adds</th>
                <th className="pb-2 pr-4">Drops</th>
                <th className="pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredCounts.map((c) => (
                <tr key={c.season} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-medium text-gray-400">{c.season}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{c.adds}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{c.drops}</td>
                  <td className="py-1.5 tabular-nums font-medium">{c.adds + c.drops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trade History */}
        {filteredTrades.length > 0 && (
          <div className="divider">
            <button
              onClick={() => setTradesExpanded(!tradesExpanded)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="section-label">Trade History</div>
              <span className="text-xs text-gray-400">
                {filteredTrades.length} trade{filteredTrades.length !== 1 ? "s" : ""} {tradesExpanded ? "▲" : "▼"}
              </span>
            </button>
            {tradesExpanded && (
              <div className="space-y-3 mt-2">
                {filteredTrades.map((trade: Trade, i: number) => (
                  <TradeCard key={i} trade={trade} />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
      </>}

      {activeTab === "roster" && (
        <RosterTab
          rosters={rosters}
          rosterCosts={roster_costs}
          isBaseball={isBaseball}
          selectedSeason={rosterSeason}
          onSeasonChange={setRosterSeason}
          seasons={filteredRecords.map((sr) => sr.season)}
        />
      )}
    </div>
  );
}

function formatFinishGroups(groups: ReturnType<typeof getFinishGroups>): string {
  if (groups.length === 0) return "N/A";
  return groups
    .map((g) => `${ordinal(g.rank)}s: ${g.count} (${g.years.join(", ")})`)
    .join(", ");
}
