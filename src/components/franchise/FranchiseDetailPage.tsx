import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFranchiseDetail } from "../../api/hooks";
import type { TransactionCount, Trade, SeasonKeepers } from "../../api/types";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import RosterTab from "./RosterTab";
import FranchiseOverview from "./FranchiseOverview";
import { getMedals, getChampionshipYears } from "../../utils/records-helpers";
import { leagueBySlug } from "../../utils/league-config";
import { useSport } from "../../context/SportContext";
import ToggleGroup from "../shared/ToggleGroup";
import { useDocumentTitle } from "../../utils/use-document-title";
import Breadcrumbs from "../layout/Breadcrumbs";
import { formatRecord, recordFor } from "../../utils/records-helpers";

type ViewScope = "franchise" | "manager";
type DetailTab = "overview" | "roster";

export default function FranchiseDetailPage() {
  const { slug, franchiseId } = useParams<{ slug: string; franchiseId: string }>();
  const { data, loading, error } = useFranchiseDetail(slug!, franchiseId!);
  const leagueLabel = leagueBySlug(slug!)?.label ?? slug!;
  useDocumentTitle(data?.overview.current_team_name);
  // Shared with the history pages via SportContext — one toggle, one state.
  const { scoringMode, setScoringMode } = useSport();
  const [viewScope, setViewScope] = useState<ViewScope>("franchise");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [rosterSeason, setRosterSeason] = useState<number | null>(null);

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

  const { w, l, t } = recordFor(displayStats, scoringMode);
  const record = formatRecord({ w, l, t });

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: leagueLabel, to: `/${slug}` },
          { label: "History", to: `/${slug}/history` },
          { label: overview.current_team_name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight">
            {overview.current_team_name}
            {medals.length > 0 && <span className="ml-2">{medals.join("")}</span>}
          </h1>
          <p className="text-sm text-ink-soft">
            {overview.name} franchise &middot; Managed by {overview.current_manager}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasMultipleOwners && (
            <ToggleGroup value={viewScope} onChange={setViewScope}
              options={[
                { value: "franchise", label: "All-Time" },
                { value: "manager", label: "Current Manager" },
              ]} />
          )}
          <ToggleGroup value={scoringMode} onChange={setScoringMode}
            options={[
              { value: "category", label: "Categories" },
              { value: "matchup", label: "Matchups" },
            ]} />
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

      {activeTab === "overview" && (
        <FranchiseOverview
          overview={overview}
          displayStats={displayStats}
          filteredRecords={filteredRecords}
          filteredCounts={filteredCounts}
          filteredTrades={filteredTrades}
          filteredKeepers={filteredKeepers}
          managerEras={manager_eras}
          h2h={h2h}
          rosters={rosters}
          currentMatchup={current_matchup}
          champYears={champYears}
          record={record}
          w={w}
          l={l}
          t={t}
          scoringMode={scoringMode}
          isManagerView={isManagerView}
          isBaseball={isBaseball}
          slug={slug!}
        />
      )}

      {activeTab === "roster" && (
        <RosterTab
          rosters={rosters}
          rosterCosts={roster_costs}
          isBaseball={isBaseball}
          selectedSeason={rosterSeason}
          onSeasonChange={setRosterSeason}
          seasons={overview.seasons}
          slug={slug!}
        />
      )}
    </div>
  );
}
