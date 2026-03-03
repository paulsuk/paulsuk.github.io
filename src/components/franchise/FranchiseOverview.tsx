import { useState } from "react";
import { Link } from "react-router-dom";
import type {
  FranchiseDetailResponse,
  FranchiseSeasonRecord,
  FranchiseH2HEntry,
  Trade,
  TransactionCount,
  SeasonKeepers,
  ManagerEra,
  CurrentMatchup,
  ScoringMode,
  RosterPlayer,
} from "../../api/types";
import Card from "../shared/Card";
import Stat from "../shared/Stat";
import SeasonRow from "../shared/SeasonRow";
import SeasonRoster from "./SeasonRoster";
import KeepersCard from "./KeepersCard";
import TradeCard from "./TradeCard";
import { ordinal, getFinishGroups, winPct, formatSeason } from "../../utils/records-helpers";

interface FranchiseOverviewProps {
  overview: FranchiseDetailResponse["overview"];
  displayStats: FranchiseDetailResponse["stats"];
  filteredRecords: FranchiseSeasonRecord[];
  filteredCounts: TransactionCount[];
  filteredTrades: Trade[];
  filteredKeepers: SeasonKeepers[];
  managerEras: ManagerEra[];
  h2h: FranchiseH2HEntry[];
  rosters: Record<number, RosterPlayer[]>;
  currentMatchup: CurrentMatchup | null;
  champYears: number[];
  record: string;
  w: number;
  l: number;
  t: number;
  scoringMode: ScoringMode;
  isManagerView: boolean;
  isBaseball: boolean;
  slug: string;
}

export default function FranchiseOverview({
  overview,
  displayStats,
  filteredRecords,
  filteredCounts,
  filteredTrades,
  filteredKeepers,
  managerEras,
  h2h,
  rosters,
  currentMatchup,
  champYears,
  record,
  w,
  l,
  t,
  scoringMode,
  isManagerView,
  isBaseball,
  slug,
}: FranchiseOverviewProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [tradesExpanded, setTradesExpanded] = useState(false);
  const [keeperSeason, setKeeperSeason] = useState<number | null>(null);

  return (
    <>
      {/* Stats overview */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Overall Record" value={record} />
          <Stat
            label="Championships"
            value={champYears.length > 0 ? `${champYears.length} (${champYears.map((y) => formatSeason(y, slug)).join(", ")})` : "0"}
          />
          <Stat label="Best Finish" value={displayStats.best_finish ? ordinal(displayStats.best_finish) : "N/A"} />
          <Stat
            label="Playoff Finishes"
            value={formatFinishGroups(getFinishGroups(filteredRecords, "finish").filter((g) => g.rank <= 3), slug)}
          />
          <Stat label="Seasons" value={filteredRecords.map((sr) => formatSeason(sr.season, slug)).join(", ")} />
          <Stat label="Win %" value={winPct(w, l, t)} />
        </div>
      </Card>

      {/* Ownership Timeline */}
      <Card title="Ownership History">
        {overview.ownership.length === 1 ? (
          <p className="text-sm text-gray-600">
            {overview.ownership[0].manager} &middot; Est. <span className="text-gray-400">{formatSeason(overview.ownership[0].from, slug)}</span> &mdash; present
          </p>
        ) : (
          <div className="space-y-1">
            {overview.ownership.map((o) => (
              <div key={o.guid} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{o.manager}</span>
                <span className="text-gray-400 tabular-nums">
                  {formatSeason(o.from, slug)}{o.to ? `\u2013${formatSeason(o.to, slug)}` : "+"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Manager Eras (only for multi-owner franchises, hidden in manager view) */}
      {managerEras.length > 1 && !isManagerView && (
        <Card title="Manager Eras">
          <div className="space-y-3">
            {managerEras.map((era) => {
              const ew = scoringMode === "category" ? era.cat_wins : era.wins;
              const el = scoringMode === "category" ? era.cat_losses : era.losses;
              const et = scoringMode === "category" ? era.cat_ties : era.ties;
              return (
                <div key={era.guid} className="item-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{era.name}</div>
                      <div className="text-label">
                        <span className="text-gray-400">{formatSeason(era.from, slug)}{era.to ? `\u2013${formatSeason(era.to, slug)}` : "+"}</span> &middot; {era.seasons.length} season{era.seasons.length !== 1 ? "s" : ""}
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
                <SeasonRow season={sr} showManager={managerEras.length > 1} scoringMode={scoringMode} slug={slug} />
              </button>
              {currentMatchup && currentMatchup.season === sr.season && (
                <div className="pl-4 py-1 text-sm text-gray-500">
                  This Week (Wk {currentMatchup.week}): vs {currentMatchup.opponent_team_name} &mdash;{" "}
                  <span className="font-medium tabular-nums text-gray-700">
                    {currentMatchup.cats_won}-{currentMatchup.cats_lost}
                    {currentMatchup.cats_tied > 0 ? `-${currentMatchup.cats_tied}` : ""}
                  </span>
                  {currentMatchup.is_playoffs && (
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
          slug={slug}
        />
      )}

      {/* Transaction Activity */}
      <Card title="Transaction Activity">
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
                  <td className="py-1.5 pr-4 font-medium text-gray-400">{formatSeason(c.season, slug)}</td>
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
                {filteredTrades.map((trade: Trade) => (
                  <TradeCard key={trade.timestamp} trade={trade} />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

function formatFinishGroups(groups: ReturnType<typeof getFinishGroups>, slug: string): string {
  if (groups.length === 0) return "N/A";
  return groups
    .map((g) => `${ordinal(g.rank)}s: ${g.count} (${g.years.map((y) => formatSeason(y, slug)).join(", ")})`)
    .join(", ");
}
