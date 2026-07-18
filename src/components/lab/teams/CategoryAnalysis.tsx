import type { CategoryAnalysisProps } from "../../../api/types";
import {
  BATTING_CAT_ORDER,
  NBA_CAT_ORDER,
  PITCHING_CAT_ORDER,
  RATE_CATS,
  fmtWeekly,
  rankBadgeClass,
} from "../../../utils/lab-helpers";

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
        <td className="py-1.5 px-3 text-ink-soft">{cat}</td>
        <td className="py-1.5 px-3 text-right tabular-nums text-ink-soft">
          {isRate ? fmtWeekly(weekly) : `${fmtWeekly(weekly)}/wk`}
        </td>
        <td className="py-1.5 px-3 text-right">
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
          className={`py-1.5 px-3 text-right tabular-nums font-medium ${
            prob >= 0.65
              ? "text-green-700"
              : prob <= 0.35
              ? "text-red-600"
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
      <td className="px-3 py-1">Cat</td>
      <td className="px-3 py-1 text-right">Proj/wk</td>
      <td className="px-3 py-1 text-right">Rank</td>
      <td className="px-3 py-1 text-right">Win%</td>
    </tr>
  );

  const section = (label: string, cats: string[]) => (
    <div className="rounded-lg border border-rule overflow-hidden">
      <div className="bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft uppercase tracking-wider">
        {label}
      </div>
      <table className="w-full text-sm">
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
