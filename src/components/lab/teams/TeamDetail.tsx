import type { TeamAnalysisTeam } from "../../../api/types";

interface Props {
  team: TeamAnalysisTeam;
  onClose: () => void;
}

const TIER_COLORS: Record<string, string> = {
  dominant:    "bg-green-400",
  competitive: "bg-blue-400",
  swing:       "bg-yellow-400",
  punt:        "bg-red-400",
};

const ROSTER_COLS = ["HR", "R", "RBI", "SB", "AVG", "OPS", "W", "QS", "ERA", "WHIP", "K/9", "SV+H"];

function fmtStat(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v > 10) return v.toFixed(0);
  if (v > 1) return v.toFixed(2);
  return v.toFixed(3);
}

export default function TeamDetail({ team, onClose }: Props) {
  const cats = Object.keys(team.category_win_probs);

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{team.team_name}</h2>
          {team.manager_name && (
            <p className="text-sm text-gray-500">{team.manager_name}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            G-Val: <span className="font-semibold text-blue-700">{team.team_value.toFixed(1)}</span>
            {" · "}
            Exp W%: <span className="font-semibold">{(team.expected_wins * 100).toFixed(1)}%</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none px-1"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Category bars */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Category Win Probability
        </h3>
        <div className="space-y-1">
          {cats.map((cat) => {
            const prob = team.category_win_probs[cat] ?? 0;
            const tier = team.category_tiers[cat] ?? "swing";
            const rank = team.category_ranks[cat];
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 text-right shrink-0">{cat}</span>
                <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                  <div
                    className={`h-full rounded ${TIER_COLORS[tier] ?? "bg-gray-400"}`}
                    style={{ width: `${(prob * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-gray-600 w-8">
                  {(prob * 100).toFixed(0)}%
                </span>
                {rank != null && (
                  <span className="text-xs text-gray-400 w-10">#{rank}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster table */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Roster ({team.roster.length} players)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left py-1 pr-2">Name</th>
                <th className="text-left py-1 pr-2">Pos</th>
                <th className="text-right py-1 pr-2 text-blue-600">G-Val</th>
                {ROSTER_COLS.map((c) => (
                  <th key={c} className="text-right py-1 px-1">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {team.roster.map((player) => (
                <tr key={player.player_id} className="hover:bg-gray-50/50">
                  <td className="py-1 pr-2 font-medium text-gray-800">{player.name}</td>
                  <td className="py-1 pr-2 text-gray-500">{player.positions ?? "—"}</td>
                  <td className="py-1 pr-2 text-right tabular-nums text-blue-700 font-semibold">
                    {player.value != null ? player.value.toFixed(2) : "—"}
                  </td>
                  {ROSTER_COLS.map((c) => (
                    <td key={c} className="py-1 px-1 text-right tabular-nums text-gray-600">
                      {fmtStat(player.stats[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
