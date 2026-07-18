import { useSearchParams } from "react-router-dom";
import { useSeasons } from "../../api/hooks";

export const NO_SEASONS_MESSAGE = "No synced seasons found for this league.";

/**
 * Season-selection controller shared by the league pages: parses ?season=,
 * loads the synced season list, and derives the selected season (latest by
 * default). setSeason writes ?season= (dropping any other params — a season
 * change resets week selection by design).
 */
export function useSeasonSelection(slug: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonParam = searchParams.get("season");

  const { data: seasons, loading, error } = useSeasons(slug);
  const selectedSeason = seasonParam
    ? Number(seasonParam)
    : seasons && seasons.length > 0 ? seasons[0].season : null;

  const setSeason = (s: number) => setSearchParams({ season: String(s) });

  return { seasons, selectedSeason, setSeason, loading, error };
}
