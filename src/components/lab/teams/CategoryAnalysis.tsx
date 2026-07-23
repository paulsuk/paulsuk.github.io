import type { CategoryAnalysisProps } from "../../../api/types";
import { formatStat } from "../../../utils/format";
import {
  BATTING_CAT_ORDER,
  NBA_CAT_ORDER,
  PITCHING_CAT_ORDER,
  RATE_CATS,
  rankBadgeClass,
} from "../../../utils/lab-helpers";

function fmtStatOrDash(v: number | undefined, key: string): string {
  return v != null ? formatStat(v, key) : "—";
}

/**
 * Per-category projection/rank/win% tables. Grouping is data-derived:
 * batting/pitching side-by-side when pitching categories exist (MLB),
 * a single table otherwise (NBA).
 */
export default function CategoryAnalysis({ team }: CategoryAnalysisProps) {
  const allCats = Object.keys(team.category_win_probs);
  const battingCats = BATTING_CAT_ORDER.filter((c) => allCats.includes(c));
  const pitchingCats = PITCHING_CAT_ORDER.filter((c) => allCats.includes(c));
  const isSplit = pitchingCats.length > 0;
  const singleCats = [
    ...NBA_CAT_ORDER.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !NBA_CAT_ORDER.includes(c) && !battingCats.includes(c)),
  ];
  const total = Object.keys(team.category_ranks).length;

  const renderRow = (cat: string) => {
    const prob = team.category_win_probs[cat] ?? 0;
    const rank = team.category_ranks[cat];
    const weekly = team.category_weekly?.[cat];
    const isRate = RATE_CATS.has(cat);

    return (
      <tr key={cat} className="border-t border-rule">
        <td className="td-dense text-ink-soft">{cat}</td>
        <td className="td-dense text-right cell-num text-ink-soft">
          {isRate ? fmtStatOrDash(weekly, cat) : `${fmtStatOrDash(weekly, cat)}/wk`}
        </td>
        <td className="td-dense text-right">
          {rank != null && (
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${rankBadgeClass(
                rank,
                total
              )}`}
            >
              #{rank}
            </span>
          )}
        </td>
        <td
          className={`td-dense text-right tabular-nums font-medium ${
            prob >= 0.65
              ? "text-win"
              : prob <= 0.35
              ? "text-loss"
              : "text-ink-soft"
          }`}
        >
          {(prob * 100).toFixed(0)}%
        </td>
      </tr>
    );
  };

  const header = (
    <tr className="text-ink-faint text-xs">
      <td className="th-dense">Cat</td>
      <td className="th-dense text-right">Proj/wk</td>
      <td className="th-dense text-right">Rank</td>
      <td className="th-dense text-right">Win%</td>
    </tr>
  );

  const section = (label: string, cats: string[]) => (
    <div className="rounded-lg border border-rule overflow-hidden">
      <div className="bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft uppercase tracking-wider">
        {label}
      </div>
      <table className="table-dense">
        <thead>{header}</thead>
        <tbody>{cats.map(renderRow)}</tbody>
      </table>
    </div>
  );

  if (!isSplit) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{section("Categories", singleCats)}</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {section("Batting", battingCats)}
      {section("Pitching", pitchingCats)}
    </div>
  );
}
