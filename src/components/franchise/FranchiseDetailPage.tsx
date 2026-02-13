import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFranchiseDetail } from "../../api/hooks";
import type { FranchiseSeasonRecord, FranchiseH2HEntry, Trade } from "../../api/types";
import type { ScoringMode } from "../records/RecordsPage";
import Card from "../shared/Card";
import Stat from "../shared/Stat";
import SeasonRow from "../shared/SeasonRow";
import SeasonRoster from "./SeasonRoster";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import { ordinal, getMedals, getChampionshipYears } from "../../utils/records-helpers";

export default function FranchiseDetailPage() {
  const { slug, franchiseId } = useParams<{ slug: string; franchiseId: string }>();
  const { data, loading, error } = useFranchiseDetail(slug!, franchiseId!);
  const [scoringMode, setScoringMode] = useState<ScoringMode>(
    slug === "baseball" ? "category" : "matchup"
  );
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return <ErrorBanner message="Franchise not found." />;

  const { overview, stats, season_records, manager_eras, h2h, rosters, transactions } = data;
  const medals = getMedals(season_records);
  const champYears = getChampionshipYears(season_records);

  const w = scoringMode === "category" ? stats.cat_wins : stats.wins;
  const l = scoringMode === "category" ? stats.cat_losses : stats.losses;
  const t = scoringMode === "category" ? stats.cat_ties : stats.ties;
  const record = `${w}-${l}${t > 0 ? `-${t}` : ""}`;

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
            {overview.name}
            {medals.length > 0 && <span className="ml-2">{medals.join("")}</span>}
          </h1>
          <p className="text-sm text-gray-500">
            Managed by {overview.current_manager} &middot; {overview.current_team_name}
          </p>
        </div>
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

      {/* Stats overview */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Overall Record" value={record} />
          <Stat
            label="Championships"
            value={champYears.length > 0 ? `${champYears.length} (${champYears.join(", ")})` : "0"}
          />
          <Stat label="Best Finish" value={stats.best_finish ? ordinal(stats.best_finish) : "N/A"} />
          <Stat label="Worst Finish" value={stats.worst_finish ? ordinal(stats.worst_finish) : "N/A"} />
          <Stat label="Seasons" value={overview.seasons.join(", ")} />
          <Stat
            label="Win %"
            value={`${((w / Math.max(w + l, 1)) * 100).toFixed(0)}%`}
          />
        </div>
      </Card>

      {/* Ownership Timeline */}
      <Card title="Ownership History">
        {overview.ownership.length === 1 ? (
          <p className="text-sm text-gray-600">
            {overview.ownership[0].manager} &middot; Est. {overview.ownership[0].from} &mdash; present
          </p>
        ) : (
          <div className="space-y-1">
            {overview.ownership.map((o) => (
              <div key={o.guid} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{o.manager}</span>
                <span className="text-gray-400">
                  {o.from}{o.to ? `\u2013${o.to}` : "+"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Manager Eras (only for multi-owner franchises) */}
      {manager_eras.length > 1 && (
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
                        {era.from}{era.to ? `\u2013${era.to}` : "+"} &middot; {era.seasons.length} season{era.seasons.length !== 1 ? "s" : ""}
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
          {season_records.map((sr: FranchiseSeasonRecord) => (
            <div key={sr.season}>
              <button
                onClick={() => setExpandedSeason(expandedSeason === sr.season ? null : sr.season)}
                className="w-full text-left"
              >
                <SeasonRow season={sr} showManager={manager_eras.length > 1} scoringMode={scoringMode} />
              </button>
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
                  const total = entry.wins + entry.losses;
                  const pct = total > 0 ? ((entry.wins / total) * 100).toFixed(0) : "—";
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
                      <td className="py-1.5 tabular-nums">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
              {transactions.counts.map((c) => (
                <tr key={c.season} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-medium text-gray-600">{c.season}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{c.adds}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{c.drops}</td>
                  <td className="py-1.5 tabular-nums font-medium">{c.adds + c.drops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trade History */}
        {transactions.trades.length > 0 && (
          <div className="divider">
            <div className="section-label">Trade History</div>
            <div className="space-y-3">
              {transactions.trades.map((trade: Trade, i: number) => (
                <TradeCard key={i} trade={trade} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function TradeCard({ trade }: { trade: Trade }) {
  // Group players by direction
  const byDest = new Map<string, string[]>();
  for (const p of trade.players) {
    const key = `${p.source_team} \u2192 ${p.dest_team}`;
    const list = byDest.get(key) ?? [];
    list.push(p.name);
    byDest.set(key, list);
  }

  return (
    <div className="item-card">
      <div className="text-label mb-1">
        {trade.season} &middot; Week {trade.week ?? "?"}
      </div>
      {Array.from(byDest.entries()).map(([direction, players]) => (
        <div key={direction} className="text-sm">
          <span className="text-gray-400">{direction}:</span>{" "}
          <span className="font-medium text-gray-700">{players.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}
