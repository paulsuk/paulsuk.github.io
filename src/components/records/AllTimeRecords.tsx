import type { RecordsResponse } from "../../api/types";
import Card from "../shared/Card";

interface AllTimeRecordsProps {
  records: RecordsResponse;
}

export default function AllTimeRecords({ records }: AllTimeRecordsProps) {
  const { category_records, streaks, matchup_records } = records;

  return (
    <div className="space-y-6">
      {/* Streaks */}
      <Card title="Streaks">
        <div className="space-y-2">
          <RecordRow
            label="Longest win streak"
            value={`${streaks.longest_win_streak.streak} games`}
            holder={streaks.longest_win_streak.manager}
          />
          <RecordRow
            label="Longest undefeated streak"
            value={`${streaks.longest_undefeated_streak.streak} games`}
            holder={streaks.longest_undefeated_streak.manager}
          />
          <RecordRow
            label="Longest losing streak"
            value={`${streaks.longest_loss_streak.streak} games`}
            holder={streaks.longest_loss_streak.manager}
          />
        </div>
      </Card>

      {/* Matchup Records */}
      <Card title="Matchup Records">
        <div className="space-y-2">
          {matchup_records.biggest_blowout && (
            <RecordRow
              label="Biggest blowout"
              value={matchup_records.biggest_blowout.score}
              holder={`${matchup_records.biggest_blowout.winner} over ${matchup_records.biggest_blowout.loser}`}
              detail={`${matchup_records.biggest_blowout.season} Week ${matchup_records.biggest_blowout.week}`}
            />
          )}
          {matchup_records.closest_match && (
            <RecordRow
              label="Closest match"
              value={matchup_records.closest_match.score}
              holder={`${matchup_records.closest_match.winner} over ${matchup_records.closest_match.loser}`}
              detail={`${matchup_records.closest_match.season} Week ${matchup_records.closest_match.week}`}
            />
          )}
        </div>
      </Card>

      {/* Category Records */}
      <Card title="Category Records">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Record</th>
                <th className="pb-2 pr-4">Manager</th>
                <th className="pb-2 pr-4">When</th>
              </tr>
            </thead>
            <tbody>
              {category_records.map((r) => (
                <tr key={r.category} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-medium">{r.category}</td>
                  <td className="py-1.5 pr-4 tabular-nums font-semibold">
                    {formatValue(r.value, r.category)}
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600">{r.manager}</td>
                  <td className="py-1.5 pr-4 text-gray-400">
                    {r.season} Wk {r.week}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RecordRow({ label, value, holder, detail }: {
  label: string;
  value: string;
  holder: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-gray-500">{holder}</div>
        {detail && <div className="text-xs text-gray-400">{detail}</div>}
      </div>
      <div className="text-lg font-bold tabular-nums text-gray-800">{value}</div>
    </div>
  );
}

function formatValue(value: number, category: string): string {
  const rateStats = ["AVG", "OBP", "SLG", "OPS", "ERA", "WHIP", "FG%", "FT%", "3P%"];
  if (rateStats.includes(category)) {
    return value.toFixed(3);
  }
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}
