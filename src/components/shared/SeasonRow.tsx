import type { SeasonRecord, FranchiseSeasonRecord } from "../../api/types";
import { finishBadge } from "../../utils/records-helpers";

interface SeasonRowProps {
  season: SeasonRecord | FranchiseSeasonRecord;
  showManager?: boolean;
  scoringMode?: "category" | "matchup";
}

export default function SeasonRow({ season: sr, showManager, scoringMode = "matchup" }: SeasonRowProps) {
  const manager = "manager" in sr ? (sr as FranchiseSeasonRecord).manager : null;
  const w = scoringMode === "category" ? sr.cat_wins : sr.wins;
  const l = scoringMode === "category" ? sr.cat_losses : sr.losses;
  const t = scoringMode === "category" ? sr.cat_ties : sr.ties;

  return (
    <div className="flex items-center justify-between py-0.5 gap-2">
      <span className="text-gray-500 min-w-0 truncate">
        {sr.season} — {sr.team_name}
        {showManager && manager && (
          <span className="text-gray-400"> ({manager})</span>
        )}
      </span>
      <span className="font-medium tabular-nums text-gray-700 flex items-center gap-1.5 flex-shrink-0">
        {w}-{l}{t > 0 ? `-${t}` : ""}
        {sr.playoff_seed != null && (
          <span className="text-gray-400 text-xs">
            seed {sr.playoff_seed}
          </span>
        )}
        {sr.finish != null && (
          <span className="text-xs">
            {finishBadge(sr.finish)}
          </span>
        )}
      </span>
    </div>
  );
}
