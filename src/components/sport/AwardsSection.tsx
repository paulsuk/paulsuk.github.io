import type { PlayerAward } from "../../api/types";
import Card from "../shared/Card";

interface AwardsSectionProps {
  batter_of_week: PlayerAward | null;
  pitcher_of_week: PlayerAward | null;
  player_of_week: PlayerAward | null;
}

function AwardRow({ label, player }: { label: string; player: PlayerAward }) {
  const topStats = Object.entries(player.stat_line)
    .filter(([, v]) => v !== 0)
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-0.5 text-sm font-medium">{player.name}</div>
        <div className="text-xs text-gray-500">
          {player.manager} &middot; {player.position}
        </div>
        {topStats && <div className="mt-1 text-xs text-gray-400">{topStats}</div>}
      </div>
      <div className="text-right">
        <div className="text-lg font-bold tabular-nums text-blue-600">
          {player.z_total >= 0 ? "+" : ""}{player.z_total.toFixed(1)}
        </div>
        <div className="text-[10px] uppercase text-gray-400">z-score</div>
      </div>
    </div>
  );
}

export default function AwardsSection({ batter_of_week, pitcher_of_week, player_of_week }: AwardsSectionProps) {
  const awards: { label: string; player: PlayerAward }[] = [];

  if (batter_of_week) awards.push({ label: "Batter of the Week", player: batter_of_week });
  if (pitcher_of_week) awards.push({ label: "Pitcher of the Week", player: pitcher_of_week });
  if (player_of_week) awards.push({ label: "Player of the Week", player: player_of_week });

  if (awards.length === 0) return null;

  return (
    <Card title="Awards">
      <div className="space-y-2">
        {awards.map((a) => (
          <AwardRow key={a.label} label={a.label} player={a.player} />
        ))}
      </div>
    </Card>
  );
}
