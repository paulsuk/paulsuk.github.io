import type { SeasonRecord, FranchiseSeasonRecord } from "../../api/types";
import { finishBadge, winPct, formatSeason } from "../../utils/records-helpers";

interface SeasonRowProps {
  season: SeasonRecord | FranchiseSeasonRecord;
  showManager?: boolean;
  scoringMode?: "category" | "matchup";
  slug?: string;
}

export default function SeasonRow({ season: sr, showManager, scoringMode = "matchup", slug }: SeasonRowProps) {
  const manager = "manager" in sr ? (sr as FranchiseSeasonRecord).manager : null;
  const w = scoringMode === "category" ? sr.cat_wins : sr.wins;
  const l = scoringMode === "category" ? sr.cat_losses : sr.losses;
  const t = scoringMode === "category" ? sr.cat_ties : sr.ties;

  const pct = winPct(w, l, t);

  return (
    <div className="flex items-center justify-between py-0.5 gap-2">
      <span className="text-ink-soft min-w-0 truncate">
        <span className="text-ink-faint">{slug ? formatSeason(sr.season, slug) : sr.season}</span> — {sr.team_name}
        {showManager && manager && (
          <span className="text-ink-faint"> ({manager})</span>
        )}
      </span>
      <span className="font-medium tabular-nums text-ink-soft flex items-center gap-1.5 flex-shrink-0">
        {w}-{l}-{t}
        <span className="text-ink-faint font-normal text-xs">({pct})</span>
        {sr.playoff_seed != null && sr.playoff_seed > 0 && (
          <span className="text-ink-faint text-xs">
            seed {sr.playoff_seed}
          </span>
        )}
        {sr.finish != null && sr.finish > 0 && (
          <span className="text-xs">
            {finishBadge(sr.finish)}
          </span>
        )}
      </span>
    </div>
  );
}
