import type { ScoringMode } from "../api/types";

export interface LeagueConfig {
  slug: "baseball" | "basketball";
  label: string;
  sportCode: "mlb" | "nba";
  scoringMode: ScoringMode;
  tagline: string;
}

export const LEAGUES: LeagueConfig[] = [
  {
    slug: "baseball",
    label: "Baseball",
    sportCode: "mlb",
    scoringMode: "category",
    tagline: "Twelve managers, ten categories, one pennant.",
  },
  {
    slug: "basketball",
    label: "Basketball",
    sportCode: "nba",
    scoringMode: "matchup",
    tagline: "Head-to-head hoops, October through the Finals.",
  },
];

export function leagueBySlug(slug: string): LeagueConfig | null {
  return LEAGUES.find((l) => l.slug === slug) ?? null;
}

export function leagueBySportCode(code: string): LeagueConfig | null {
  return LEAGUES.find((l) => l.sportCode === code) ?? null;
}

/** Default scoring mode; unknown slugs fall back to matchup (old behavior). */
export function defaultScoringMode(slug: string): ScoringMode {
  return leagueBySlug(slug)?.scoringMode ?? "matchup";
}
