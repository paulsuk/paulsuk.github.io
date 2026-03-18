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
    <div className="overflow-auto max-h-[60vh]">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="p-1 border text-left w-8">Rd</th>
            {teams.map((teamId) => (
              <th key={teamId} className="p-1 border text-center min-w-[90px]">
                {teamNames[teamId] || teamId.split(".").pop() || teamId}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((roundPicks, ri) => (
            <tr key={ri}>
              <td className="p-1 border font-bold">{ri + 1}</td>
              {roundPicks.map((pick) => {
                const teamIdx = teams.indexOf(pick.team_id);
                const colorClass = TEAM_COLORS[teamIdx % TEAM_COLORS.length];
                const name = pick.player_id ? playerNames[pick.player_id] || `#${pick.player_id}` : "";

                return (
                  <td
                    key={pick.pick_number}
                    className={`p-1 border text-center ${colorClass} ${
                      pick.is_current ? "ring-2 ring-blue-500 font-bold" : ""
                    } ${pick.is_keeper ? "opacity-60 italic" : ""}`}
                  >
                    {name || (pick.is_current ? "..." : "")}
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
