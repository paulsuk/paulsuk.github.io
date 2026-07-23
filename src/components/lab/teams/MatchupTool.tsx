import { useState } from "react";
import type { MatchupToolProps, MatchupTableProps } from "../../../api/types";
import { formatStat } from "../../../utils/format";
import { PITCHING_CATS, CAT_ORDER } from "../../../utils/lab-helpers";

function getEdge(
  myRank: number | undefined,
  oppRank: number | undefined
): { label: string; colorClass: string } {
  if (myRank == null || oppRank == null) {
    return { label: "—", colorClass: "text-ink-faint" };
  }
  if (myRank <= oppRank - 2) return { label: "▲ Win", colorClass: "text-win" };
  if (oppRank <= myRank - 2) return { label: "▼ Lose", colorClass: "text-loss" };
  return { label: "— Toss-up", colorClass: "text-ink-soft" };
}

function rankColorClass(rank: number | undefined, total: number): string {
  if (rank == null) return "text-ink-soft";
  if (rank <= 3) return "text-win";
  if (rank >= total - 2) return "text-loss";
  return "text-ink-soft";
}

function MatchupTable({ myTeam, opponent, allCats, total }: MatchupTableProps) {
  // Data-derived grouping: pitching section only when pitching cats exist
  // (MLB); everything else (NBA) renders as one ungrouped list.
  const battingCats = allCats.filter((c) => !PITCHING_CATS.has(c));
  const pitchingCats = allCats.filter((c) => PITCHING_CATS.has(c));
  const isSplit = pitchingCats.length > 0;

  const renderRow = (cat: string) => {
    const myRank = myTeam.category_ranks[cat];
    const oppRank = opponent.category_ranks[cat];
    const myWeekly = myTeam.category_weekly?.[cat];
    const oppWeekly = opponent.category_weekly?.[cat];
    const edge = getEdge(myRank, oppRank);

    const fmt = (weekly: number | undefined, rank: number | undefined) =>
      `${weekly != null ? formatStat(weekly, cat) : "—"}${rank != null ? ` · #${rank}` : ""}`;

    return (
      <tr key={cat} className="border-t border-rule">
        <td className="td-dense font-medium text-ink-soft">{cat}</td>
        <td
          className={`td-dense text-right cell-num ${rankColorClass(
            myRank,
            total
          )}`}
        >
          {fmt(myWeekly, myRank)}
        </td>
        <td
          className={`td-dense text-right cell-num ${rankColorClass(
            oppRank,
            total
          )}`}
        >
          {fmt(oppWeekly, oppRank)}
        </td>
        <td className={`td-dense text-right font-medium ${edge.colorClass}`}>
          {edge.label}
        </td>
      </tr>
    );
  };

  const sectionHeader = (label: string) => (
    <tr>
      <td
        colSpan={4}
        className="px-3 py-1 text-xs text-ink-faint uppercase tracking-wider bg-paper"
      >
        {label}
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="table-dense">
        <thead className="bg-paper">
          <tr>
            <th className="table-header th-dense text-left">Cat</th>
            <th className="table-header th-dense text-right">
              {myTeam.team_name}
            </th>
            <th className="table-header th-dense text-right">
              {opponent.team_name}
            </th>
            <th className="table-header th-dense text-right">Edge</th>
          </tr>
        </thead>
        <tbody>
          {isSplit && sectionHeader("Batting")}
          {battingCats.map(renderRow)}
          {isSplit && sectionHeader("Pitching")}
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
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide">
          Matchup vs:
        </h3>
        <select
          value={opponentId}
          onChange={(e) => setOpponentId(e.target.value)}
          className="border border-rule rounded px-2 py-1 text-sm text-ink-soft bg-raised"
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
