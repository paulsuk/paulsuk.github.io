import { fmtCompact } from "../../../../utils/format";
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
  const cols = (isPitcher ? PITCHER_STATCAST : BATTER_STATCAST).filter(([key]) => key in stats);
  if (!cols.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">Statcast</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cols.map(([key, label]) => (
          <div key={key} className="bg-paper rounded p-2 text-center">
            <div className="text-xs text-ink-faint mb-0.5">{label}</div>
            <div className="text-sm font-medium tabular-nums">
              {stats[key] != null ? fmtCompact(stats[key] as number) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
