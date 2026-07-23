import { formatStat } from "../../../../utils/format";
import StatTileGrid from "../../../shared/StatTileGrid";
const BATTER_STATCAST: [string, string][] = [
  ["xBA", "xBA"], ["xwOBA", "xwOBA"], ["xSLG", "xSLG"],
  ["barrel_rate", "Barrel%"], ["hard_hit_rate", "Hard Hit%"],
  ["launch_speed", "Exit Velo"], ["launch_angle", "Launch Angle"],
];
const PITCHER_STATCAST: [string, string][] = [
  ["estimated_ba_using_speedangle", "xBA Against"], ["release_spin_rate", "Spin Rate"],
  ["release_extension", "Extension"], ["hard_hit_rate", "Hard Hit% Against"],
];

export default function StatcastPanel({
  stats,
  isPitcher = false,
}: {
  stats: Record<string, number | null>;
  isPitcher?: boolean;
}) {
  const tiles = (isPitcher ? PITCHER_STATCAST : BATTER_STATCAST)
    .filter(([key]) => key in stats)
    .map(([key, label]) => ({
      label,
      value: stats[key] != null ? formatStat(stats[key] as number, label) : "—",
    }));

  return (
    <StatTileGrid title="Statcast" gridClassName="grid grid-cols-3 sm:grid-cols-4 gap-2" tiles={tiles} />
  );
}
