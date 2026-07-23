import { formatStat } from "../../../../utils/format";
import StatTileGrid from "../../../shared/StatTileGrid";

const NBA_COLS = ["PTS", "REB", "AST", "ST", "BLK", "FG%", "FT%", "3PTM", "GP"];

export default function NBAStatsPanel({ stats }: { stats: Record<string, number | null> }) {
  const tiles = NBA_COLS.filter((c) => c in stats).map((c) => ({
    label: c,
    value: stats[c] != null ? formatStat(stats[c] as number, c) : "—",
  }));

  return (
    <StatTileGrid title="Per Game Stats" gridClassName="grid grid-cols-4 sm:grid-cols-5 gap-2" tiles={tiles} />
  );
}
