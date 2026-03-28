import React from "react";
import { Link } from "react-router-dom";
import type { TeamAnalysisTeam } from "../../../api/types";

interface Props {
  teams: TeamAnalysisTeam[];
  sport: string;
  selectedTeamId: string | null;
  onSelect: (teamId: string) => void;
}

function winProbColor(p: number): string {
  if (p >= 0.65) return "bg-green-100 text-green-800";
  if (p >= 0.50) return "bg-blue-50 text-blue-700";
  if (p >= 0.35) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

function rankBadgeClass(rank: number, total: number): string {
  if (rank <= 2) return "bg-green-100 text-green-800";
  if (rank <= 5) return "bg-slate-100 text-slate-600";
  if (rank <= total - 2) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function InlineTeamPanel({
  team,
  sport,
  totalTeams,
}: {
  team: TeamAnalysisTeam;
  sport: string;
  totalTeams: number;
}) {
  const rankEntries = Object.entries(team.category_ranks).sort(
    ([, a], [, b]) => a - b
  );
  const strengths = rankEntries.slice(0, 3);
  const weaknesses = rankEntries.slice(-2);
  const topPlayer = team.roster[0] ?? null;

  return (
    <div className="flex gap-6 text-sm py-1">
      {/* Left: team summary */}
      <div className="min-w-[160px]">
        <div className="font-semibold text-gray-900">{team.team_name}</div>
        <div className="text-gray-500 text-xs">{team.manager_name ?? "—"}</div>
        <div className="mt-1 text-xs">
          <span className="text-blue-700 font-semibold">
            G-Val {team.team_value.toFixed(1)}
          </span>
          {" · "}
          <span className="text-gray-600">
            {(team.expected_wins * 100).toFixed(1)}% W%
          </span>
        </div>
      </div>

      {/* Middle: strengths / weaknesses */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 mb-1">Strengths</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {strengths.map(([cat, rank]) => (
            <span
              key={cat}
              className={`px-2 py-0.5 rounded text-xs font-medium ${rankBadgeClass(
                rank,
                totalTeams
              )}`}
            >
              {cat} #{rank}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-400 mb-1">Weaknesses</div>
        <div className="flex flex-wrap gap-1">
          {weaknesses.map(([cat, rank]) => (
            <span
              key={cat}
              className={`px-2 py-0.5 rounded text-xs font-medium ${rankBadgeClass(
                rank,
                totalTeams
              )}`}
            >
              {cat} #{rank}
            </span>
          ))}
        </div>
      </div>

      {/* Right: top player + detail link */}
      <div className="min-w-[140px] text-right shrink-0">
        {topPlayer && (
          <div className="text-xs text-gray-600 mb-1">
            <div className="font-medium text-gray-800">{topPlayer.name}</div>
            <div className="text-blue-700">
              G-Val {topPlayer.value != null ? topPlayer.value.toFixed(2) : "—"}
            </div>
          </div>
        )}
        <Link
          to={`/lab/${sport}/teams/${encodeURIComponent(team.team_id)}`}
          className="text-xs text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Full analysis →
        </Link>
      </div>
    </div>
  );
}

const CAT_ORDER = [
  "R", "HR", "RBI", "SB", "AVG", "OPS",
  "W", "QS", "ERA", "WHIP", "K/9", "SV+H",
];

export default function TeamsOverview({
  teams,
  sport,
  selectedTeamId,
  onSelect,
}: Props) {
  if (!teams.length) return <p className="text-meta">No team data available.</p>;

  const allCats = Object.keys(teams[0].category_win_probs);
  const cats = [
    ...CAT_ORDER.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !CAT_ORDER.includes(c)),
  ];
  const totalCols = 5 + cats.length;

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
              <th key={c} className="table-header px-2 py-2 text-center">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {teams.map((team, i) => {
            const isSelected = team.team_id === selectedTeamId;
            return (
              <React.Fragment key={team.team_id}>
                <tr
                  onClick={() => onSelect(team.team_id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-gray-400 tabular-nums">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {team.team_name}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {team.manager_name ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums stat-value text-blue-700">
                    {team.team_value.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {(team.expected_wins * 100).toFixed(1)}%
                  </td>
                  {cats.map((c) => {
                    const p = team.category_win_probs[c] ?? 0;
                    return (
                      <td
                        key={c}
                        className={`px-2 py-2 text-center tabular-nums text-xs ${winProbColor(
                          p
                        )}`}
                      >
                        {(p * 100).toFixed(0)}%
                      </td>
                    );
                  })}
                </tr>
                {isSelected && (
                  <tr>
                    <td
                      colSpan={totalCols}
                      className="px-4 py-3 bg-blue-50 border-b border-blue-100"
                    >
                      <InlineTeamPanel
                        team={team}
                        sport={sport}
                        totalTeams={teams.length}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
