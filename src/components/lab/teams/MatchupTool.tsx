import { useState } from "react";
import type { MatchupToolProps, MatchupTableProps } from "../../../api/types";
import { fmtWeekly } from "../../../utils/lab-helpers";

const BATTING_CATS = new Set(["R", "HR", "RBI", "SB", "AVG", "OPS"]);
const PITCHING_CATS = new Set(["W", "QS", "ERA", "WHIP", "K/9", "SV+H"]);
const CAT_ORDER = [
  "R", "HR", "RBI", "SB", "AVG", "OPS",
  "W", "QS", "ERA", "WHIP", "K/9", "SV+H",
];
const RATE_CATS = new Set(["AVG", "ERA", "WHIP", "OPS", "K/9", "FG%", "FT%"]);

function getEdge(
  myRank: number | undefined,
  oppRank: number | undefined
): { label: string; colorClass: string } {
  if (myRank == null || oppRank == null) {
    return { label: "—", colorClass: "text-gray-400" };
  }
  if (myRank <= oppRank - 2) return { label: "▲ Win", colorClass: "text-green-700" };
  if (oppRank <= myRank - 2) return { label: "▼ Lose", colorClass: "text-red-600" };
  return { label: "— Toss-up", colorClass: "text-gray-500" };
}

function rankColorClass(rank: number | undefined, total: number): string {
  if (rank == null) return "text-gray-600";
  if (rank <= 3) return "text-green-700";
  if (rank >= total - 2) return "text-red-600";
  return "text-gray-700";
}

function MatchupTable({ myTeam, opponent, allCats, total }: MatchupTableProps) {
  const battingCats = allCats.filter(
    (c) => BATTING_CATS.has(c) || (!PITCHING_CATS.has(c) && !BATTING_CATS.has(c))
  );
  const pitchingCats = allCats.filter((c) => PITCHING_CATS.has(c));

  const renderRow = (cat: string) => {
    const myRank = myTeam.category_ranks[cat];
    const oppRank = opponent.category_ranks[cat];
    const myWeekly = myTeam.category_weekly?.[cat];
    const oppWeekly = opponent.category_weekly?.[cat];
    const edge = getEdge(myRank, oppRank);
    const isRate = RATE_CATS.has(cat);

    const fmt = (weekly: number | undefined, rank: number | undefined) =>
      `${fmtWeekly(weekly)}${!isRate ? "" : ""}${rank != null ? ` · #${rank}` : ""}`;

    return (
      <tr key={cat} className="border-t border-gray-100">
        <td className="px-3 py-2 font-medium text-gray-700">{cat}</td>
        <td
          className={`px-3 py-2 text-right tabular-nums ${rankColorClass(
            myRank,
            total
          )}`}
        >
          {fmt(myWeekly, myRank)}
        </td>
        <td
          className={`px-3 py-2 text-right tabular-nums ${rankColorClass(
            oppRank,
            total
          )}`}
        >
          {fmt(oppWeekly, oppRank)}
        </td>
        <td className={`px-3 py-2 text-right font-medium ${edge.colorClass}`}>
          {edge.label}
        </td>
      </tr>
    );
  };

  const sectionHeader = (label: string) => (
    <tr>
      <td
        colSpan={4}
        className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider bg-gray-50"
      >
        {label}
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header px-3 py-2 text-left">Cat</th>
            <th className="table-header px-3 py-2 text-right">
              {myTeam.team_name}
            </th>
            <th className="table-header px-3 py-2 text-right">
              {opponent.team_name}
            </th>
            <th className="table-header px-3 py-2 text-right">Edge</th>
          </tr>
        </thead>
        <tbody>
          {sectionHeader("Batting")}
          {battingCats.map(renderRow)}
          {sectionHeader("Pitching")}
          {pitchingCats.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}

export default function MatchupTool({ myTeam, allTeams }: MatchupToolProps) {
  const [opponentId, setOpponentId] = useState<string>("");

  const opponents = allTeams.filter((t) => t.team_id !== myTeam.team_id);
  const opponent = opponents.find((t) => t.team_id === opponentId) ?? null;

  const allCatKeys = Object.keys(myTeam.category_win_probs);
  const cats = [
    ...CAT_ORDER.filter((c) => allCatKeys.includes(c)),
    ...allCatKeys.filter((c) => !CAT_ORDER.includes(c)),
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Matchup vs:
        </h3>
        <select
          value={opponentId}
          onChange={(e) => setOpponentId(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 bg-white"
        >
          <option value="">Pick a team...</option>
          {opponents.map((t) => (
            <option key={t.team_id} value={t.team_id}>
              {t.team_name}
            </option>
          ))}
        </select>
      </div>

      {!opponent ? (
        <p className="text-meta">
          Pick an opponent to see the matchup breakdown.
        </p>
      ) : (
        <MatchupTable
          myTeam={myTeam}
          opponent={opponent}
          allCats={cats}
          total={allTeams.length}
        />
      )}
    </div>
  );
}
