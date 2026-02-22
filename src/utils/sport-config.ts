import type { ScoringMode } from "../api/types";

/** Default scoring mode: baseball = categories, everything else = matchups. */
export function defaultScoringMode(slug: string): ScoringMode {
  return slug === "baseball" ? "category" : "matchup";
}
