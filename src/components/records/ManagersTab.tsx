import { useState } from "react";
import { useParams } from "react-router-dom";
import type { ManagerSummary, FranchiseStats } from "../../api/types";
import type { ScoringMode } from "./RecordsPage";
import Card from "../shared/Card";
import EntityCard from "./EntityCard";

interface ManagersTabProps {
  managers: ManagerSummary[];
  viewMode: "manager" | "franchise";
  franchiseStats?: FranchiseStats[];
  scoringMode: ScoringMode;
}

export default function ManagersTab({ managers, viewMode, franchiseStats, scoringMode }: ManagersTabProps) {
  const { slug } = useParams<{ slug: string }>();
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  const useCats = scoringMode === "category";

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
              wins={useCats ? f.cat_wins : f.wins}
              losses={useCats ? f.cat_losses : f.losses}
              ties={useCats ? f.cat_ties : f.ties}
              seasonRecords={f.season_records}
              scoringMode={scoringMode}
              ownership={f.ownership}
              showManagerInSeasons
              seasons={f.seasons}
              slug={slug}
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
            wins={useCats ? m.cat_wins : m.wins}
            losses={useCats ? m.cat_losses : m.losses}
            ties={useCats ? m.cat_ties : m.ties}
            seasonRecords={m.season_records}
            scoringMode={scoringMode}
            playoffWins={m.playoff_wins}
            playoffLosses={m.playoff_losses}
            bestFinish={m.best_finish}
            worstFinish={m.worst_finish}
            seasons={m.seasons}
            expanded={expanded === m.guid}
            onToggle={() => toggle(m.guid)}
          />
        ))}
      </div>
    </Card>
  );
}
