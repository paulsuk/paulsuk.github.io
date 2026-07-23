import { useState } from "react";
import { useTeamAnalysis } from "../../../api/hooks";
import { useLabSport } from "../../../utils/use-lab-sport";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import TeamsOverview from "./TeamsOverview";

export default function TeamsPage() {
  const { slug, sportCode } = useLabSport();
  const { data, loading, error } = useTeamAnalysis(sportCode);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorBanner message={error ?? "Failed to load team analysis"} />;

  return (
    <div>
      <p className="eyebrow mb-3">Teams</p>
      <p className="text-meta mb-4">
        {data.season} season · {data.teams.length} teams
      </p>
      <TeamsOverview
        teams={data.teams}
        slug={slug}
        selectedTeamId={selectedTeamId}
        onSelect={(id) => setSelectedTeamId((prev) => (prev === id ? null : id))}
      />
    </div>
  );
}
