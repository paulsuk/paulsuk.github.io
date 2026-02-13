import type { SeasonRecord, FranchiseSeasonRecord, FranchiseOwnership } from "../../api/types";
import type { ScoringMode } from "./RecordsPage";
import { getMedals, getChampionshipYears, getFinishGroups, ordinal } from "../../utils/records-helpers";
import Stat from "../shared/Stat";
import SeasonRow from "../shared/SeasonRow";

interface EntityCardProps {
  id: string;
  name: string;
  subtitle: string;
  wins: number;
  losses: number;
  ties: number;
  seasonRecords: (SeasonRecord | FranchiseSeasonRecord)[];
  scoringMode: ScoringMode;
  playoffWins?: number;
  playoffLosses?: number;
  bestFinish?: number | null;
  worstFinish?: number | null;
  ownership?: FranchiseOwnership[];
  showManagerInSeasons?: boolean;
  seasons?: number[];
  expanded: boolean;
  onToggle: () => void;
}

export default function EntityCard({
  id,
  name,
  subtitle,
  wins,
  losses,
  ties,
  seasonRecords,
  scoringMode,
  playoffWins,
  playoffLosses,
  bestFinish,
  worstFinish,
  ownership,
  showManagerInSeasons,
  seasons,
  expanded,
  onToggle,
}: EntityCardProps) {
  const medals = getMedals(seasonRecords);
  const champYears = getChampionshipYears(seasonRecords);
  const regSeasonFinishes = getFinishGroups(seasonRecords, "playoff_seed").filter((g) => g.rank <= 3);
  const record = `${wins}-${losses}${ties > 0 ? `-${ties}` : ""}`;
  const winPct = ((wins / Math.max(wins + losses, 1)) * 100).toFixed(0);

  return (
    <div key={id}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between item-card-interactive text-left"
      >
        <div>
          <div className="text-sm font-medium">
            {name}
            {medals.length > 0 && <span className="ml-1.5">{medals.join("")}</span>}
          </div>
          <div className="text-label">
            {subtitle}
            {champYears.length > 0 && (
              <span className="ml-2 badge-championship">
                {champYears.length}x champ ({champYears.join(", ")})
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="stat-value">{record}</div>
          <div className="text-meta">{winPct}%</div>
        </div>
      </button>

      {expanded && (
        <div className="detail-panel">
          <div className="grid grid-cols-2 gap-2">
            {playoffWins != null ? (
              <>
                <Stat label="Regular Season" value={record} />
                <Stat label="Playoffs" value={`${playoffWins}-${playoffLosses}`} />
              </>
            ) : (
              <Stat label="Overall Record" value={record} />
            )}
            <Stat
              label="Championships"
              value={champYears.length > 0 ? `${champYears.length} (${champYears.join(", ")})` : "0"}
            />
            <Stat
              label="Reg Season Finishes"
              value={formatFinishGroups(regSeasonFinishes)}
            />
            {seasons && <Stat label="Seasons" value={seasons.join(", ")} />}
            {bestFinish != null && <Stat label="Best Finish" value={ordinal(bestFinish)} />}
            {worstFinish != null && <Stat label="Worst Finish" value={ordinal(worstFinish)} />}
          </div>

          {ownership && ownership.length > 1 && (
            <div className="divider">
              <div className="section-label">Ownership History</div>
              {ownership.map((o) => (
                <div key={o.guid} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{o.manager}</span>
                  <span className="text-gray-400">{o.from}{o.to ? `\u2013${o.to}` : "+"}</span>
                </div>
              ))}
            </div>
          )}

          {seasonRecords.length > 0 && (
            <div className="divider">
              <div className="section-label">Season Breakdown</div>
              {seasonRecords.map((sr) => (
                <SeasonRow key={sr.season} season={sr} showManager={showManagerInSeasons} scoringMode={scoringMode} />
              ))}
            </div>
          )}
        </div>
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
