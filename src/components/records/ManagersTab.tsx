import { useState } from "react";
import type { ManagerSummary, FranchiseStats } from "../../api/types";
import { useSport } from "../../context/SportContext";
import Card from "../shared/Card";
import EntityCard from "./EntityCard";
import { recordFor } from "../../utils/records-helpers";

interface ManagersTabProps {
  managers: ManagerSummary[];
  viewMode: "manager" | "franchise";
  franchiseStats?: FranchiseStats[];
}

export default function ManagersTab({ managers, viewMode, franchiseStats }: ManagersTabProps) {
  const { scoringMode } = useSport();
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  if (viewMode === "franchise" && franchiseStats) {
    return (
      <Card title="Franchises">
        <div className="space-y-2">
          {franchiseStats.map((f) => (
            <EntityCard
              key={f.id}
              id={f.id}
              name={f.current_team_name}
              subtitle={
                f.ownership.length > 1
                  ? `${f.ownership.length} managers \u2014 ${f.seasons.length} seasons`
                  : `${f.current_manager} \u2014 ${f.seasons.length} season${f.seasons.length !== 1 ? "s" : ""}`
              }
              wins={recordFor(f, scoringMode).w}
              losses={recordFor(f, scoringMode).l}
              ties={recordFor(f, scoringMode).t}
              seasonRecords={f.season_records}
              ownership={f.ownership}
              showManagerInSeasons
              seasons={f.seasons}
              expanded={expanded === f.id}
              onToggle={() => toggle(f.id)}
            />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Managers">
      <div className="space-y-2">
        {managers.map((m) => (
          <EntityCard
            key={m.guid}
            id={m.guid}
            name={m.name}
            subtitle={`${m.seasons.length} season${m.seasons.length !== 1 ? "s" : ""}`}
            wins={recordFor(m, scoringMode).w}
            losses={recordFor(m, scoringMode).l}
            ties={recordFor(m, scoringMode).t}
            seasonRecords={m.season_records}
            playoffWins={m.playoff_wins}
            playoffLosses={m.playoff_losses}
            bestFinish={m.best_finish}
            worstFinish={m.worst_finish}
            seasons={m.seasons}
            franchiseId={m.franchise_id ?? undefined}
            expanded={expanded === m.guid}
            onToggle={() => toggle(m.guid)}
          />
        ))}
      </div>
    </Card>
  );
}
