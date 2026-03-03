import { Link, useParams } from "react-router-dom";
import type { TeamProfile } from "../../api/types";
import { API_URL } from "../../api/client";
import { winPct } from "../../utils/records-helpers";
import Card from "../shared/Card";

interface RankingsSectionProps {
  profiles: TeamProfile[];
  season: number;
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

function logoUrl(slug: string, teamName: string, season: number): string {
  const nameSlug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${API_URL}/api/${slug}/assets/logo-${nameSlug}-${season}`;
}

export default function RankingsSection({ profiles, season }: RankingsSectionProps) {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Card title="Power Rankings">
      <div className="space-y-2">
        {profiles.map((p) => {
          const pct = winPct(p.wins, p.losses, p.ties);
          return (
            <div key={p.team_key ?? p.team_name} className="item-card">
              <div className="flex items-center gap-2">
                <span className="w-6 text-center text-sm font-bold text-gray-700">{p.rank}</span>
                <RankChange rank={p.rank} prevRank={p.prev_rank} />
                <img
                  src={logoUrl(slug!, p.team_name, season)}
                  alt=""
                  className="h-6 w-6 flex-shrink-0 rounded-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="min-w-0 flex-1">
                  {p.franchise_id ? (
                    <Link to={`/${slug}/franchise/${p.franchise_id}`} className="text-sm font-medium hover:text-gray-500">
                      {p.team_name}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium">{p.team_name}</div>
                  )}
                  <div className="text-label">{p.manager}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="tabular-nums">
                    {p.wins}-{p.losses}-{p.ties}
                    <span className="ml-1 text-gray-400">({pct})</span>
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

              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-gray-400">
                {p.mvp_name && (
                  <span>
                    Week MVP: {p.mvp_name} ({p.mvp_z >= 0 ? "+" : ""}{p.mvp_z.toFixed(1)})
                  </span>
                )}
                {p.season_mvp_name && (
                  <span>
                    Season MVP: {p.season_mvp_name} ({p.season_mvp_z >= 0 ? "+" : ""}{p.season_mvp_z.toFixed(1)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
