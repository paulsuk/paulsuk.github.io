import type { TeamAnalysisTeam } from "../../../api/types";

interface Props {
  teams: TeamAnalysisTeam[];
  selectedTeamId: string | null;
  onSelect: (teamId: string) => void;
}

function winProbColor(p: number): string {
  if (p >= 0.65) return "bg-green-100 text-green-800";
  if (p >= 0.50) return "bg-blue-50 text-blue-700";
  if (p >= 0.35) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

export default function TeamsOverview({ teams, selectedTeamId, onSelect }: Props) {
  if (!teams.length) return <p className="text-meta">No team data available.</p>;

  const CAT_ORDER = ["R", "HR", "RBI", "SB", "AVG", "OPS", "W", "QS", "ERA", "WHIP", "K/9", "SV+H"];
  const allCats = Object.keys(teams[0].category_win_probs);
  const cats = [
    ...CAT_ORDER.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !CAT_ORDER.includes(c)),
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header px-3 py-2 text-left">#</th>
            <th className="table-header px-3 py-2 text-left">Team</th>
            <th className="table-header px-3 py-2 text-left">Manager</th>
            <th className="table-header px-3 py-2 text-right">G-Val</th>
            <th className="table-header px-3 py-2 text-right">Exp W%</th>
            {cats.map((c) => (
              <th key={c} className="table-header px-2 py-2 text-center">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {teams.map((team, i) => {
            const isSelected = team.team_id === selectedTeamId;
            return (
              <tr
                key={team.team_id}
                onClick={() => onSelect(team.team_id)}
                className={`cursor-pointer hover:bg-gray-50 ${isSelected ? "ring-2 ring-inset ring-blue-400" : ""}`}
              >
                <td className="px-3 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{team.team_name}</td>
                <td className="px-3 py-2 text-gray-500">{team.manager_name ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums stat-value text-blue-700">
                  {team.team_value.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  {(team.expected_wins * 100).toFixed(1)}%
                </td>
                {cats.map((c) => {
                  const p = team.category_win_probs[c] ?? 0;
                  return (
                    <td key={c} className={`px-2 py-2 text-center tabular-nums text-xs ${winProbColor(p)}`}>
                      {(p * 100).toFixed(0)}%
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
