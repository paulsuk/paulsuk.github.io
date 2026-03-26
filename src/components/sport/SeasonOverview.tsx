import type { RecapResponse, ScoringMode } from "../../api/types";
import { winPct } from "../../utils/records-helpers";
import Card from "../shared/Card";

interface SeasonOverviewProps {
  recap: RecapResponse;
  scoringMode: ScoringMode;
}

export default function SeasonOverview({ recap, scoringMode }: SeasonOverviewProps) {

  return (
    <Card title={`Season Overview — Week ${recap.week}`}>
      <div className="space-y-3">
        {/* Standings snapshot */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Team</th>
                <th className="pb-2 pr-4">Manager</th>
                <th className="pb-2 pr-4">Record</th>
                <th className="pb-2 pr-4">Pct</th>
              </tr>
            </thead>
            <tbody>
              {recap.standings.map((s) => {
                const w = scoringMode === "category" ? s.cat_wins : s.wins;
                const l = scoringMode === "category" ? s.cat_losses : s.losses;
                const t = scoringMode === "category" ? s.cat_ties : s.ties;
                const pct = winPct(w, l, t);
                return (
                  <tr key={s.team_key} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 font-medium text-gray-600">{s.rank}</td>
                    <td className="py-1.5 pr-4 font-medium">{s.team_name}</td>
                    <td className="py-1.5 pr-4 text-gray-500">{s.manager}</td>
                    <td className="py-1.5 pr-4 tabular-nums">
                      {w}-{l}-{t}
                    </td>
                    <td className="py-1.5 pr-4 tabular-nums text-gray-500">
                      {pct}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Card>
  );
}
