import type { RecapResponse } from "../../api/types";
import type { ScoringMode } from "../records/RecordsPage";
import Card from "../shared/Card";

interface SeasonOverviewProps {
  recap: RecapResponse;
  scoringMode: ScoringMode;
}

export default function SeasonOverview({ recap, scoringMode }: SeasonOverviewProps) {
  const leader = recap.standings[0];
  const topProfile = recap.profiles[0];

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
              </tr>
            </thead>
            <tbody>
              {recap.standings.map((s) => {
                const w = scoringMode === "category" ? s.cat_wins : s.wins;
                const l = scoringMode === "category" ? s.cat_losses : s.losses;
                const t = scoringMode === "category" ? s.cat_ties : s.ties;
                return (
                  <tr key={s.team_key} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 font-medium text-gray-600">{s.rank}</td>
                    <td className="py-1.5 pr-4 font-medium">{s.team_name}</td>
                    <td className="py-1.5 pr-4 text-gray-500">{s.manager}</td>
                    <td className="py-1.5 pr-4 tabular-nums">
                      {w}-{l}{t > 0 ? `-${t}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick highlights */}
        {leader && topProfile && (
          <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-600">
            <span>
              <span className="font-medium text-gray-900">#{topProfile.rank}</span>{" "}
              {topProfile.team_name} ({topProfile.manager})
              {topProfile.streak > 0 && (
                <span className="ml-1 text-green-600">W{topProfile.streak}</span>
              )}
              {topProfile.streak < 0 && (
                <span className="ml-1 text-red-600">L{Math.abs(topProfile.streak)}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
