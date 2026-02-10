import type { RecordsResponse } from "../../api/types";
import Card from "../shared/Card";

interface AllTimeRecordsProps {
  records: RecordsResponse;
  currentManagerNames: Set<string> | null;
  viewMode: "manager" | "team";
}

export default function AllTimeRecords({ records, currentManagerNames, viewMode }: AllTimeRecordsProps) {
  const { category_records, streaks, matchup_records } = records;
  const byTeam = viewMode === "team";

  const filteredCategoryRecords = currentManagerNames
    ? category_records.filter((r) => currentManagerNames.has(r.manager))
    : category_records;

  const isCurrent = (name: string) => !currentManagerNames || currentManagerNames.has(name);

  const streakEntries = [
    { label: "Longest win streak", data: streaks.longest_win_streak },
    { label: "Longest undefeated streak", data: streaks.longest_undefeated_streak },
    { label: "Longest losing streak", data: streaks.longest_loss_streak },
  ].filter((s) => isCurrent(s.data.manager));

  const blowout = matchup_records.biggest_blowout;
  const closest = matchup_records.closest_match;
  const showBlowout = blowout && isCurrent(blowout.winner) && isCurrent(blowout.loser);
  const showClosest = closest && isCurrent(closest.winner) && isCurrent(closest.loser);

  return (
    <div className="space-y-6">
      {/* Streaks */}
      <Card title="Streaks">
        <div className="space-y-2">
          {streakEntries.length > 0 ? (
            streakEntries.map((s) => (
              <RecordRow
                key={s.label}
                label={s.label}
                value={`${s.data.streak} games`}
                holder={byTeam ? s.data.team_name : s.data.manager}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400">No streak records for current managers.</p>
          )}
        </div>
      </Card>

      {/* Matchup Records */}
      <Card title="Matchup Records">
        <div className="space-y-2">
          {showBlowout && (
            <RecordRow
              label="Biggest blowout"
              value={blowout.score}
              holder={byTeam
                ? `${blowout.winner_team} over ${blowout.loser_team}`
                : `${blowout.winner} over ${blowout.loser}`}
              detail={`${blowout.season} Week ${blowout.week}`}
            />
          )}
          {showClosest && (
            <RecordRow
              label="Closest match"
              value={closest.score}
              holder={byTeam
                ? `${closest.winner_team} over ${closest.loser_team}`
                : `${closest.winner} over ${closest.loser}`}
              detail={`${closest.season} Week ${closest.week}`}
            />
          )}
          {!showBlowout && !showClosest && (
            <p className="text-sm text-gray-400">No matchup records for current managers.</p>
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
                <th className="pb-2 pr-4">{byTeam ? "Team" : "Manager"}</th>
                <th className="pb-2 pr-4">When</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategoryRecords.map((r) => (
                <tr key={r.category} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-medium">{r.category}</td>
                  <td className="py-1.5 pr-4 tabular-nums font-semibold">
                    {formatValue(r.value, r.category)}
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600">
                    {byTeam ? r.team_name : r.manager}
                  </td>
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
