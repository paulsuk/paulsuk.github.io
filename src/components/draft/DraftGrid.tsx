import type { DraftPick } from "../../api/types";

interface Props {
  grid: DraftPick[];
  teams: string[];
  playerNames: Record<number, string>;
  teamNames?: Record<string, string>;
  numRounds: number;
}

const TEAM_COLORS = [
  "bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-red-100", "bg-purple-100",
  "bg-pink-100", "bg-indigo-100", "bg-teal-100", "bg-orange-100", "bg-cyan-100",
];

export function DraftGrid({ grid, teams, playerNames, teamNames = {}, numRounds }: Props) {
  const rounds: DraftPick[][] = [];
  for (let r = 1; r <= numRounds; r++) {
    rounds.push(grid.filter((p) => p.round === r));
  }

  return (
    <div>
      <table className="w-full table-fixed text-xs border-collapse">
        <thead className="sticky top-0 bg-white z-10">
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
                      pick.is_current ? "ring-2 ring-blue-500 font-bold" : ""
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
