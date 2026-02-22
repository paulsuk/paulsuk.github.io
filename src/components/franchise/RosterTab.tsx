import type { RosterPlayer, RosterCostPlayer } from "../../api/types";
import Card from "../shared/Card";

export default function RosterTab({
  rosters,
  rosterCosts,
  isBaseball,
  selectedSeason,
  onSeasonChange,
  seasons,
}: {
  rosters: Record<number, RosterPlayer[]>;
  rosterCosts: Record<number, RosterCostPlayer[]>;
  isBaseball: boolean;
  selectedSeason: number | null;
  onSeasonChange: (s: number | null) => void;
  seasons: number[];
}) {
  const activeSeason = selectedSeason ?? seasons[seasons.length - 1];

  // Use roster_costs for baseball (has draft_cost), fall back to rosters
  const costRoster = isBaseball ? rosterCosts[activeSeason] : undefined;
  const baseRoster = rosters[activeSeason];
  const hasData = costRoster || baseRoster;

  const starters = costRoster
    ? costRoster.filter((p) => p.is_starter)
    : baseRoster?.filter((p) => p.is_starter) ?? [];
  const bench = costRoster
    ? costRoster.filter((p) => !p.is_starter)
    : baseRoster?.filter((p) => !p.is_starter) ?? [];

  return (
    <Card title="End-of-Season Roster">
      {/* Season dropdown */}
      <div className="mb-3">
        <select
          value={activeSeason}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
        >
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {!hasData ? (
        <p className="text-sm text-gray-400">No roster data for {activeSeason}.</p>
      ) : (
        <div className="space-y-3">
          <RosterSection
            label="Starters"
            players={starters}
            showCost={isBaseball && !!costRoster}
          />
          {bench.length > 0 && (
            <RosterSection
              label="Bench"
              players={bench}
              showCost={isBaseball && !!costRoster}
              isBench
            />
          )}
        </div>
      )}
    </Card>
  );
}

function RosterSection({
  label,
  players,
  showCost,
  isBench,
}: {
  label: string;
  players: (RosterCostPlayer | RosterPlayer)[];
  showCost: boolean;
  isBench?: boolean;
}) {
  return (
    <div>
      <div className="section-label">{label}</div>
      <div className="space-y-0.5">
        {players.map((p) => {
          const name = "full_name" in p ? p.full_name : "";
          const pos = "primary_position" in p ? p.primary_position : "";
          const selPos = "selected_position" in p ? p.selected_position : "";
          const cost = "draft_cost" in p ? (p as RosterCostPlayer).draft_cost : null;
          return (
            <div
              key={name}
              className={`flex items-center justify-between text-xs ${
                isBench ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={isBench ? "" : "font-medium"}>{name}</span>
                {pos && <span className="text-gray-400">{pos}</span>}
              </div>
              <div className="flex items-center gap-3">
                {showCost && cost != null && (
                  <span className="text-gray-400 tabular-nums">Cost: {cost}</span>
                )}
                <span className={isBench ? "text-gray-300" : "text-gray-400"}>{selPos}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
