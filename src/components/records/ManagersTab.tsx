import { useState } from "react";
import type { ManagerSummary } from "../../api/types";
import Card from "../shared/Card";

interface ManagersTabProps {
  managers: ManagerSummary[];
}

export default function ManagersTab({ managers }: ManagersTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card title="Managers">
      <div className="space-y-2">
        {managers.map((m) => (
          <div key={m.guid}>
            <button
              onClick={() => setExpanded(expanded === m.guid ? null : m.guid)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100"
            >
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-gray-500">
                  {m.seasons.length} season{m.seasons.length !== 1 ? "s" : ""}
                  {m.championships > 0 && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      {m.championships}x champ
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {m.wins}-{m.losses}{m.ties > 0 ? `-${m.ties}` : ""}
                </div>
                <div className="text-xs text-gray-400">
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
