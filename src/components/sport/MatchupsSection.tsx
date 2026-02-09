import { useState } from "react";
import type { MatchupSummary } from "../../api/types";
import Card from "../shared/Card";

interface MatchupsSectionProps {
  matchups: MatchupSummary[];
  week: number;
}

function MatchupCard({ matchup }: { matchup: MatchupSummary }) {
  const [expanded, setExpanded] = useState(false);

  const tag = matchup.is_playoffs
    ? "PLAYOFF"
    : matchup.is_consolation
      ? "CONSOLATION"
      : null;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className={matchup.cats_won_1 > matchup.cats_won_2 ? "font-semibold" : "text-gray-600"}>
            {matchup.team_1_manager}
          </span>
          <span className="rounded bg-white px-2 py-0.5 font-mono text-xs tabular-nums shadow-sm">
            {matchup.cats_won_1}-{matchup.cats_won_2}{matchup.cats_tied > 0 ? `-${matchup.cats_tied}` : ""}
          </span>
          <span className={matchup.cats_won_2 > matchup.cats_won_1 ? "font-semibold" : "text-gray-600"}>
            {matchup.team_2_manager}
          </span>
          {tag && (
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
              {tag}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="pb-1 text-left font-medium">{matchup.team_1_manager}</th>
                <th className="pb-1 font-medium">Stat</th>
                <th className="pb-1 text-right font-medium">{matchup.team_2_manager}</th>
              </tr>
            </thead>
            <tbody>
              {matchup.categories.map((c) => (
                <tr key={c.display_name} className="border-t border-gray-100">
                  <td className={`py-1 tabular-nums ${c.winner === 1 ? "font-semibold text-green-700" : "text-gray-500"}`}>
                    {c.team_1_value ?? "—"}
                  </td>
                  <td className="py-1 text-center text-gray-400">{c.display_name}</td>
                  <td className={`py-1 text-right tabular-nums ${c.winner === 2 ? "font-semibold text-green-700" : "text-gray-500"}`}>
                    {c.team_2_value ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MatchupsSection({ matchups, week }: MatchupsSectionProps) {
  return (
    <Card title={`Matchups — Week ${week}`}>
      <div className="space-y-2">
        {matchups.map((m, i) => (
          <MatchupCard key={i} matchup={m} />
        ))}
      </div>
    </Card>
  );
}
