import type { StandingEntry, TeamPScoreEntry } from "../../api/types";
import { buildCategoryMatrix, heatAlpha } from "./category-profile-helpers";

interface CategoryProfileMatrixProps {
  teams: TeamPScoreEntry[];
  standings: StandingEntry[];
}

// Heat-ramp tuning (dataviz skill, sequential-fill rules): the cell fill is a
// single-hue sequential ramp (accent, best -> strongest), so the categorical
// validator doesn't apply here (it FAILs a good sequential ramp by design) —
// the binding check is WCAG text contrast (4.5:1 normal text) for the in-cell
// rank numeral. These numerals are too small to qualify for the 3:1
// large-text exemption, so 4.5:1 is the real target, not a relaxed one.
//
// The fill is `--color-accent` (#9e2b25) alpha-blended over the card surface
// (--color-raised, #ffffff) rather than a CSS var, because CSS custom
// properties can't be alpha-blended in an inline style without color-mix() —
// sanctioned hardcode, keep this comment if the accent hex ever moves.
//
// BG_FLOOR/BG_CEIL map heatAlpha (1 = best rank, 0 = worst) to the actual
// rgba() alpha painted on screen (composited over --color-raised, #ffffff).
//
// No single white/ink switch point can guarantee 4.5:1 for BOTH colors: ink
// and white have equal contrast at composited alpha ~0.7335 (both ~4.19:1,
// computed via the dataviz skill's validate_palette.js `contrast()` export
// for accent #9e2b25 over #ffffff) — that's below 4.5:1 for either color, an
// unavoidable dead band around the crossover, not a bug to "fix" by nudging
// the threshold. So instead of switching color at the crossover, the ramp
// SKIPS the dead band entirely:
//   INK_MAX_ALPHA   = largest composited alpha where ink is still >=4.5:1
//   WHITE_MIN_ALPHA = smallest composited alpha where white is >=4.5:1
// Any raw bgAlpha landing strictly between them snaps down to
// INK_MAX_ALPHA (ink stays legible; rank->intensity ordering stays
// monotonic, just compressed across the skipped band). Text switches to
// white only once bgAlpha reaches WHITE_MIN_ALPHA, so white is *never*
// painted below a guaranteed-legible contrast.
//
// (A prior version thresholded the switch on the raw 0-1 heat scale (alpha >
// 0.45) while capping the painted alpha at 0.60: white text was used for the
// top ~60% of ranks while the background never got past ~30% opacity,
// producing white-on-pastel contrast as low as 1.76:1 — fixed by reaching
// full accent strength at the best rank (BG_CEIL = 1) and, in this revision,
// snapping around the crossover dead band rather than switching inside it.)
const BG_FLOOR = 0.12;
const BG_CEIL = 1.0;
const INK_MAX_ALPHA = 0.695; // contrast(ink, blend) ~= 4.56:1
const WHITE_MIN_ALPHA = 0.775; // contrast(white, blend) ~= 4.59:1

export default function CategoryProfileMatrix({ teams, standings }: CategoryProfileMatrixProps) {
  const matrix = buildCategoryMatrix(teams, standings);
  if (matrix.rows.length === 0) return null;
  const n = matrix.rows.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 2 }}>
        <thead>
          <tr>
            <th className="table-header text-left">Team</th>
            {matrix.categories.map((c) => (
              <th key={c} className="table-header text-center">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.team_key}>
              <td className="whitespace-nowrap pr-2 text-ink-soft">{row.team_name}</td>
              {row.entry.categories.map((c) => {
                const heat = heatAlpha(c.rank, n);
                let bgAlpha = BG_FLOOR + (BG_CEIL - BG_FLOOR) * heat;
                if (bgAlpha > INK_MAX_ALPHA && bgAlpha < WHITE_MIN_ALPHA) {
                  bgAlpha = INK_MAX_ALPHA;
                }
                const useWhiteText = bgAlpha >= WHITE_MIN_ALPHA;
                return (
                  <td
                    key={c.category}
                    className="text-center"
                    title={`${c.score_per_week >= 0 ? "+" : ""}${c.score_per_week.toFixed(2)} P/wk`}
                    style={{
                      backgroundColor: `rgba(158, 43, 37, ${bgAlpha.toFixed(3)})`,
                      color: useWhiteText ? "var(--color-raised)" : "var(--color-ink)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {c.rank}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
