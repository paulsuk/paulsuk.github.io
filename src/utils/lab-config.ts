// Context-varying lab defaults live here, not inline in components
// (tech-debt rule: config modules for context-varying values).

/** Default player-page view when no query params are present. */
export const LAB_DEFAULT_SEASON = "projections";
export const LAB_DEFAULT_MODEL = "pscore";

/** First daily-era season — weekly per-player series exist from here on. */
export const DAILY_ERA_START = 2026;

/** Players-index browse listing depth (top-N by value). */
export const PLAYERS_INDEX_TOP_N = 50;

/** First real (year-based) season in a lab_ui seasons list — the players-index
 * browse season; null when only projections are served. Real season ids may
 * carry a suffix (e.g. "2026_ytd" for the in-progress season), so match on a
 * leading 4-digit year rather than requiring the whole id to be numeric. */
export function firstNumericSeason(seasons: { id: string }[]): string | null {
  return seasons.find((s) => /^\d{4}/.test(s.id))?.id ?? null;
}
