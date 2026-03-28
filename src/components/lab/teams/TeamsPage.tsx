import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTeamAnalysis } from "../../../api/hooks";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import TeamsOverview from "./TeamsOverview";

export default function TeamsPage() {
  const { sport = "mlb" } = useParams<{ sport: string }>();
  const { data, loading, error } = useTeamAnalysis(sport);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorBanner message={error ?? "Failed to load team analysis"} />;

  return (
    <div>
      <p className="text-meta mb-4">
        {data.season} season · {data.teams.length} teams
      </p>
      <TeamsOverview
        teams={data.teams}
        sport={sport}
        selectedTeamId={selectedTeamId}
        onSelect={(id) => setSelectedTeamId((prev) => (prev === id ? null : id))}
      />
    </div>
  );
}
