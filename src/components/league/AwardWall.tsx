import type { AwardWeek, PlayerAward } from "../../api/types";
import { signed } from "../../utils/format";

interface AwardWallProps {
  weeks: AwardWeek[];
}

function AwardLine({ label, award }: { label: string; award: PlayerAward }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="min-w-0">
        <span className="text-meta mr-2">{label}</span>
        <span className="font-medium text-ink">{award.name}</span>
        <span className="ml-1 text-ink-faint">&#183; {award.team_name}</span>
      </div>
      <span className="shrink-0 text-accent" style={{ fontVariantNumeric: "tabular-nums" }}>
        z {signed(award.z_total, 1)}
      </span>
    </div>
  );
}

export default function AwardWall({ weeks }: AwardWallProps) {
  if (weeks.length === 0) return null;
  const newestFirst = [...weeks].reverse();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {newestFirst.map((w) => (
        <div key={w.week} className="item-card space-y-1">
          <div className="eyebrow">Week {w.week}</div>
          {w.batter && <AwardLine label="Batter" award={w.batter} />}
          {w.pitcher && <AwardLine label="Pitcher" award={w.pitcher} />}
          {w.player && <AwardLine label="Player" award={w.player} />}
        </div>
      ))}
    </div>
  );
}
