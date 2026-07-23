import type { DraftPick } from "../../api/types";

interface Props {
  grid: DraftPick[];
  teams: string[];
  playerNames: Record<number, string>;
  teamNames?: Record<string, string>;
  numRounds: number;
}

// Categorical identity rides the series palette as soft tints. Column position +
// the team header carry primary identity (composite encoding), so recycling past
// 8 teams is safe — the dataviz all-pairs check caps distinct hues well below 10,
// so extending the palette can't validate; recycle instead (spec §1).
const TEAM_COLORS = [
  "bg-series-1/15", "bg-series-2/15", "bg-series-3/15", "bg-series-4/15",
  "bg-series-5/15", "bg-series-6/15", "bg-series-7/15", "bg-series-8/15",
];

export function DraftGrid({ grid, teams, playerNames, teamNames = {}, numRounds }: Props) {
  const rounds: DraftPick[][] = [];
  for (let r = 1; r <= numRounds; r++) {
    rounds.push(grid.filter((p) => p.round === r));
  }

  return (
    <div>
      <table className="w-full table-fixed text-xs border-collapse">
        <thead className="sticky top-0 bg-raised z-10">
          <tr>
            <th className="p-1 border text-left w-6">Rd</th>
            {teams.map((teamId) => (
              <th key={teamId} className="p-1 border text-center overflow-hidden">
                <span className="block truncate">{teamNames[teamId] || teamId.split(".").pop() || teamId}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((roundPicks, ri) => (
            <tr key={ri}>
              <td className="p-1 border font-bold text-center">{ri + 1}</td>
              {roundPicks.map((pick) => {
                const teamIdx = teams.indexOf(pick.team_id);
                const colorClass = TEAM_COLORS[teamIdx % TEAM_COLORS.length];
                const name = pick.player_id ? (pick.player_name || playerNames[pick.player_id] || `#${pick.player_id}`) : "";

                return (
                  <td
                    key={pick.pick_number}
                    title={name}
                    className={`p-1 border ${colorClass} ${
                      pick.is_current ? "ring-2 ring-tool font-bold" : ""
                    } ${pick.is_keeper ? "opacity-60 italic" : ""}`}
                  >
                    <span className="block truncate text-center">{name || (pick.is_current ? "..." : "")}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
