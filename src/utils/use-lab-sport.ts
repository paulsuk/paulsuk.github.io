import { useParams } from "react-router-dom";
import { leagueBySlug } from "./league-config";

/** Lab routes are /lab/:slug (baseball|basketball); API paths need mlb|nba. */
export function useLabSport(): { slug: string; sportCode: "mlb" | "nba" } {
  const { slug } = useParams<{ slug: string }>();
  const league = leagueBySlug(slug ?? "") ?? leagueBySlug("baseball")!;
  return { slug: league.slug, sportCode: league.sportCode };
}
