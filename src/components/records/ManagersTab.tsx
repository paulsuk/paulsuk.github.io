import { useState } from "react";
import type { ManagerSummary, FranchiseStats } from "../../api/types";
import Card from "../shared/Card";

interface ManagersTabProps {
  managers: ManagerSummary[];
  viewMode: "manager" | "team";
  franchiseStats?: FranchiseStats[];
}

export default function ManagersTab({ managers, viewMode, franchiseStats }: ManagersTabProps) {
  if (viewMode === "team" && franchiseStats) {
    return <FranchiseView franchises={franchiseStats} />;
  }

  return <ManagerView managers={managers} />;
}

function ManagerView({ managers }: { managers: ManagerSummary[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

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
                    <span className="ml-2 badge-championship">{m.championships}x champ</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="stat-value">{m.wins}-{m.losses}{m.ties > 0 ? `-${m.ties}` : ""}</div>
                <div className="text-meta">
                  {((m.wins / Math.max(m.wins + m.losses, 1)) * 100).toFixed(0)}%
                </div>
              </div>
            </button>

            {expanded === m.guid && (
              <div className="detail-panel">
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Regular Season" value={`${m.wins}-${m.losses}${m.ties > 0 ? `-${m.ties}` : ""}`} />
                  <Stat label="Playoffs" value={`${m.playoff_wins}-${m.playoff_losses}`} />
                  <Stat label="Championships" value={String(m.championships)} />
                  <Stat label="Seasons" value={m.seasons.join(", ")} />
                  {m.best_finish && <Stat label="Best Finish" value={ordinal(m.best_finish)} />}
                  {m.worst_finish && <Stat label="Worst Finish" value={ordinal(m.worst_finish)} />}
                </div>
                {m.season_records.length > 0 && (
                  <div className="divider">
                    <div className="section-label">Season Breakdown</div>
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

function FranchiseView({ franchises }: { franchises: FranchiseStats[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card title="Franchises">
      <div className="space-y-2">
        {franchises.map((f) => (
          <div key={f.id}>
            <button
              onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              className="flex w-full items-center justify-between item-card-interactive text-left"
            >
              <div>
                <div className="text-sm font-medium">{f.current_team_name}</div>
                <div className="text-label">
                  {f.ownership.length > 1
                    ? `${f.ownership.length} managers — ${f.seasons.length} seasons`
                    : `${f.current_manager} — ${f.seasons.length} season${f.seasons.length !== 1 ? "s" : ""}`}
                </div>
              </div>
              <div className="text-right">
                <div className="stat-value">{f.wins}-{f.losses}{f.ties > 0 ? `-${f.ties}` : ""}</div>
                <div className="text-meta">
                  {((f.wins / Math.max(f.wins + f.losses, 1)) * 100).toFixed(0)}%
                </div>
              </div>
            </button>

            {expanded === f.id && (
              <div className="detail-panel">
                {f.ownership.length > 1 && (
                  <div className="mb-3">
                    <div className="section-label">Ownership History</div>
                    {f.ownership.map((o) => (
                      <div key={o.guid} className="flex justify-between py-0.5">
                        <span className="text-gray-600">{o.manager}</span>
                        <span className="text-gray-400">{o.from}{o.to ? `–${o.to}` : "+"}</span>
                      </div>
                    ))}
                  </div>
                )}
                {f.season_records.length > 0 && (
                  <div className={f.ownership.length > 1 ? "divider" : ""}>
                    <div className="section-label">Season Breakdown</div>
                    {f.season_records.map((sr) => (
                      <div key={sr.season} className="flex justify-between py-0.5">
                        <span className="text-gray-500">
                          {sr.season} — {sr.team_name}
                          {f.ownership.length > 1 && (
                            <span className="text-gray-400"> ({sr.manager})</span>
                          )}
                        </span>
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
