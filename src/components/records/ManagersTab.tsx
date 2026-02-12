import { useState } from "react";
import type { ManagerSummary } from "../../api/types";
import Card from "../shared/Card";

interface ManagersTabProps {
  managers: ManagerSummary[];
  viewMode: "manager" | "team";
}

export default function ManagersTab({ managers, viewMode }: ManagersTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (viewMode === "team") {
    return <TeamView managers={managers} />;
  }

  return (
    <Card title="Managers">
      <div className="space-y-2">
        {managers.map((m) => (
          <div key={m.guid}>
            <button
              onClick={() => setExpanded(expanded === m.guid ? null : m.guid)}
              className="flex w-full items-center justify-between item-card-interactive text-left"
            >
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-label">
                  {m.seasons.length} season{m.seasons.length !== 1 ? "s" : ""}
                  {m.championships > 0 && (
                    <span className="ml-2 badge-championship">
                      {m.championships}x champ
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {m.wins}-{m.losses}{m.ties > 0 ? `-${m.ties}` : ""}
                </div>
                <div className="text-meta">
                  {((m.wins / Math.max(m.wins + m.losses, 1)) * 100).toFixed(0)}%
                </div>
              </div>
            </button>

            {expanded === m.guid && (
              <div className="ml-4 mt-1 rounded-lg border border-gray-100 bg-white p-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Regular Season" value={`${m.wins}-${m.losses}${m.ties > 0 ? `-${m.ties}` : ""}`} />
                  <Stat label="Playoffs" value={`${m.playoff_wins}-${m.playoff_losses}`} />
                  <Stat label="Championships" value={String(m.championships)} />
                  <Stat label="Seasons" value={m.seasons.join(", ")} />
                  {m.best_finish && <Stat label="Best Finish" value={ordinal(m.best_finish)} />}
                  {m.worst_finish && <Stat label="Worst Finish" value={ordinal(m.worst_finish)} />}
                </div>
                {m.season_records.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-2">
                    <div className="mb-1 text-gray-400">Season Breakdown</div>
                    {m.season_records.map((sr) => (
                      <div key={sr.season} className="flex justify-between py-0.5">
                        <span className="text-gray-500">{sr.season} — {sr.team_name}</span>
                        <span className="font-medium tabular-nums text-gray-700">
                          {sr.wins}-{sr.losses}{sr.ties > 0 ? `-${sr.ties}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamView({ managers }: { managers: ManagerSummary[] }) {
  // Flatten all season_records across all managers, sorted by season desc then wins desc
  const teams = managers.flatMap((m) =>
    m.season_records.map((sr) => ({
      ...sr,
      manager: m.name,
      guid: m.guid,
    }))
  );
  teams.sort((a, b) => b.season - a.season || (b.wins - b.losses) - (a.wins - a.losses));

  // Group by season
  const bySeason: Record<number, typeof teams> = {};
  for (const t of teams) {
    if (!bySeason[t.season]) bySeason[t.season] = [];
    bySeason[t.season].push(t);
  }

  return (
    <div className="space-y-4">
      {Object.entries(bySeason)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([season, seasonTeams]) => (
          <Card key={season} title={`${season} Season`}>
            <div className="space-y-1">
              {seasonTeams.map((t, i) => (
                <div
                  key={`${t.guid}-${t.season}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-2.5"
                >
                  <div>
                    <span className="mr-2 text-xs font-medium text-gray-400">#{i + 1}</span>
                    <span className="text-sm font-medium">{t.team_name}</span>
                    <span className="ml-2 text-label">({t.manager})</span>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {t.wins}-{t.losses}{t.ties > 0 ? `-${t.ties}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400">{label}</div>
      <div className="font-medium text-gray-700">{value}</div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
