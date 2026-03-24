import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTeamAnalysis } from "../../../api/hooks";
import type { TeamAnalysisTeam } from "../../../api/types";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";

export default function TeamsPage() {
  const { sport = "mlb" } = useParams<{ sport: string }>();
  const { data, loading, error } = useTeamAnalysis(sport);
  const [selectedTeamId] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorBanner message={error ?? "Failed to load team analysis"} />;

  const selectedTeam: TeamAnalysisTeam | null =
    data.teams.find((t) => t.team_id === selectedTeamId) ?? null;

  return (
    <div>
      <p className="text-meta mb-4">{data.season} season · {data.teams.length} teams</p>
      <p className="text-label">Overview table coming soon</p>
      {selectedTeamId && (
        <p className="text-meta mt-2">Selected: {selectedTeam?.team_name}</p>
      )}
    </div>
  );
}
