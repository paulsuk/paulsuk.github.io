import type { TeamProfile } from "../../api/types";
import Card from "../shared/Card";

interface RankingsSectionProps {
  profiles: TeamProfile[];
}

function RankChange({ rank, prevRank }: { rank: number; prevRank: number }) {
  const delta = prevRank - rank;
  if (delta > 0) return <span className="text-xs text-green-600">+{delta}</span>;
  if (delta < 0) return <span className="text-xs text-red-600">{delta}</span>;
  return <span className="text-xs text-gray-300">—</span>;
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak > 0) {
    return <span className="badge-win">W{streak}</span>;
  }
  if (streak < 0) {
    return <span className="badge-loss">L{Math.abs(streak)}</span>;
  }
  return null;
}

export default function RankingsSection({ profiles }: RankingsSectionProps) {
  return (
    <Card title="Power Rankings">
      <div className="space-y-2">
        {profiles.map((p) => (
          <div key={p.team_key ?? p.team_name} className="item-card">
            <div className="flex items-center gap-2">
              <span className="w-6 text-center text-sm font-bold text-gray-700">{p.rank}</span>
              <RankChange rank={p.rank} prevRank={p.prev_rank} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{p.team_name}</div>
                <div className="text-label">{p.manager}</div>
              </div>
              <div className="text-right text-xs">
                <div className="tabular-nums">
                  {p.wins}-{p.losses}{p.ties > 0 ? `-${p.ties}` : ""}
                </div>
                <div className="mt-0.5 text-gray-400">{p.last_3.join("-")}</div>
              </div>
              <StreakBadge streak={p.streak} />
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {p.cat_strengths.length > 0 && (
                <span>
                  <span className="text-green-600">Strengths:</span> {p.cat_strengths.join(", ")}
                </span>
              )}
              {p.cat_weaknesses.length > 0 && (
                <span>
                  <span className="text-red-600">Weaknesses:</span> {p.cat_weaknesses.join(", ")}
                </span>
              )}
            </div>

            {p.mvp_name && (
              <div className="mt-1 text-xs text-gray-400">
                MVP: {p.mvp_name} (z={p.mvp_z >= 0 ? "+" : ""}{p.mvp_z.toFixed(1)})
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
