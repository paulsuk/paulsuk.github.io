import { formatStat } from "../../../../utils/format";
import StatTileGrid from "../../../shared/StatTileGrid";
const BATTER_COLS = ["HR", "R", "RBI", "SB", "AVG", "OBP", "SLG", "OPS", "BB%", "K%", "WAR"];
const PITCHER_COLS = ["W", "SV", "ERA", "WHIP", "K", "IP", "K%", "BB%", "FIP", "WAR"];

export default function MLBStatsPanel({ stats, isPitcher }: { stats: Record<string, number | null>; isPitcher: boolean }) {
  const tiles = (isPitcher ? PITCHER_COLS : BATTER_COLS)
    .filter((c) => c in stats)
    .map((c) => ({ label: c, value: stats[c] != null ? formatStat(stats[c] as number, c) : "—" }));

  return (
    <StatTileGrid
      title={isPitcher ? "Pitching Stats" : "Batting Stats"}
      gridClassName="grid grid-cols-4 sm:grid-cols-6 gap-2"
      tiles={tiles}
    />
  );
}
