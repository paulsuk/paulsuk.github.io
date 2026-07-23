import { useParams, Link } from "react-router-dom";
import { useTeamAnalysis } from "../../../api/hooks";
import { useLabSport } from "../../../utils/use-lab-sport";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import { BATTING_CAT_ORDER, NBA_CAT_ORDER, PITCHING_CAT_ORDER } from "../../../utils/lab-helpers";
import RosterTable from "./RosterTable";
import CategoryAnalysis from "./CategoryAnalysis";
import MatchupTool from "./MatchupTool";

export default function TeamDetailPage() {
  const { slug } = useLabSport();
  const { sportCode } = useLabSport();
  const { teamId } = useParams<{ teamId: string }>();
  const { data, loading, error } = useTeamAnalysis(sportCode);

  if (loading) return <LoadingSpinner />;
  if (error || !data)
    return <ErrorBanner message={error ?? "Failed to load team analysis"} />;

  const team =
    data.teams.find((t) => t.team_id === decodeURIComponent(teamId!)) ?? null;
  if (!team) return <ErrorBanner message="Team not found" />;

  // Roster sections are data-derived: MLB rosters carry batter/pitcher player
  // types; anything else renders as a single roster with the NBA column set.
  const batters = team.roster.filter((p) => p.player_type === "batter");
  const pitchers = team.roster.filter((p) => p.player_type === "pitcher");
  const isSplitRoster = batters.length > 0 || pitchers.length > 0;

  return (
    <div>
      {/* Back link */}
      <Link
        to={`/lab/${slug}/teams`}
        className="text-sm lab-link mb-4 inline-block"
      >
        ← Back to teams
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ink">{team.team_name}</h2>
        {team.manager_name && (
          <p className="text-sm text-ink-soft">{team.manager_name}</p>
        )}
        <p className="text-sm text-ink-soft mt-1">
          {data.season} season ·{" "}
          <span className="font-semibold text-tool">
            P-Score {team.team_value.toFixed(1)}
          </span>{" "}
          ·{" "}
          <span className="font-semibold">
            Exp W% {(team.expected_wins * 100).toFixed(1)}%
          </span>
        </p>
      </div>

      {isSplitRoster ? (
        <>
          <section className="mb-8">
            <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
              Batters ({batters.length})
            </h3>
            <RosterTable players={batters} statCols={BATTING_CAT_ORDER} />
          </section>

          <section className="mb-8">
            <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
              Pitchers ({pitchers.length})
            </h3>
            <RosterTable players={pitchers} statCols={PITCHING_CAT_ORDER} />
          </section>
        </>
      ) : (
        <section className="mb-8">
          <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
            Roster ({team.roster.length})
          </h3>
          <RosterTable players={team.roster} statCols={NBA_CAT_ORDER} />
        </section>
      )}

      {/* Category analysis */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Category Analysis
        </h3>
        <CategoryAnalysis team={team} />
      </section>

      {/* Matchup tool */}
      <section>
        <MatchupTool myTeam={team} allTeams={data.teams} />
      </section>
    </div>
  );
}
