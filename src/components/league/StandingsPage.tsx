import { useParams } from "react-router-dom";
import { useAwardsHistory, useRecap, useStandingsHistory, useTeamPScores } from "../../api/hooks";
import type { TeamProfile } from "../../api/types";
import { rankStandings, winPct } from "../../utils/records-helpers";
import { defaultScoringMode } from "../../utils/league-config";
import SeasonHeader from "./SeasonHeader";
import { NO_SEASONS_MESSAGE, useSeasonSelection } from "./useSeasonSelection";
import StandingsRaceChart from "./StandingsRaceChart";
import CategoryProfileMatrix from "./CategoryProfileMatrix";
import AwardWall from "./AwardWall";
import ErrorBanner from "../shared/ErrorBanner";
import Skeleton from "../shared/Skeleton";
import Card from "../shared/Card";
import { logoUrl } from "../../utils/format";
import { recordFor } from "../../utils/records-helpers";

export default function StandingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const scoringMode = defaultScoringMode(slug!);
  const { seasons, selectedSeason, setSeason,
          loading: seasonsLoading, error: seasonsError } = useSeasonSelection(slug!);

  const { data: recap, loading: recapLoading, error: recapError } = useRecap(
    slug!, undefined, selectedSeason ?? undefined
  );
  // Season-scoped: useSeasonSelection resolves selectedSeason to a concrete
  // season number once the synced seasons list loads (or immediately from
  // ?season= in the URL) — it is never left null to mean "current season".
  // So gate these three Phase 2 hooks on `selectedSeason !== null` rather
  // than on seasonsLoading: that lets an explicit ?season= link fetch right
  // away without waiting on the seasons-list request, while still avoiding
  // the unresolved-default double-fetch (once with no ?season=, again once
  // the default latest season resolves).
  const seasonResolvedSlug = selectedSeason !== null ? slug! : null;
  const history = useStandingsHistory(seasonResolvedSlug, selectedSeason ?? undefined);
  const pscores = useTeamPScores(seasonResolvedSlug, selectedSeason ?? undefined);
  const awards = useAwardsHistory(seasonResolvedSlug, selectedSeason ?? undefined);

  if (seasonsLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
    );
  }
  if (seasonsError) return <ErrorBanner message={seasonsError} />;
  if (!seasons || seasons.length === 0) {
    return <ErrorBanner message={NO_SEASONS_MESSAGE} />;
  }

  const profileByTeam = new Map<string, TeamProfile>(
    (recap?.profiles ?? []).map((p) => [p.team_key, p])
  );

  return (
    <div className="space-y-8">
      <SeasonHeader slug={slug!} season={selectedSeason} seasons={seasons}
        onChange={setSeason} suffix={recap ? ` — Week ${recap.week}` : ""} />

      {recapLoading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      )}
      {recapError && <ErrorBanner message={recapError} />}
      {recap && (
        <div className="card-editorial overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="pb-2 pr-4">Rank</th>
                <th className="pb-2 pr-4">Team</th>
                <th className="pb-2 pr-4">Manager</th>
                <th className="pb-2 pr-4">Record</th>
                <th className="pb-2 pr-4">Pct</th>
                <th className="pb-2 pr-4">Streak</th>
                <th className="pb-2">Last 3</th>
              </tr>
            </thead>
            <tbody>
              {rankStandings(recap.standings, scoringMode).map((s) => {
                const { w, l, t } = recordFor(s, scoringMode);
                const profile = profileByTeam.get(s.team_key);
                return (
                  <tr key={s.team_key} className="border-b border-rule">
                    <td className="py-2 pr-4 tabular-nums agate">{s.displayRank}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={logoUrl(slug!, s.team_name, selectedSeason ?? recap.season)}
                          alt=""
                          className="h-6 w-6 flex-shrink-0 rounded-full object-contain"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <span className="font-medium">{s.team_name}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 agate">{s.manager}</td>
                    <td className="py-2 pr-4 tabular-nums">{w}-{l}-{t}</td>
                    <td className="py-2 pr-4 tabular-nums agate">{winPct(w, l, t)}</td>
                    <td className="py-2 pr-4">
                      {profile && profile.streak > 0 && (
                        <span className="badge-win">W{profile.streak}</span>
                      )}
                      {profile && profile.streak < 0 && (
                        <span className="badge-loss">L{Math.abs(profile.streak)}</span>
                      )}
                    </td>
                    <td className="py-2 agate">{profile?.last_3.join("-") ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="mt-8">
        {history.loading && <Skeleton className="h-64 w-full" />}
        {history.data && history.data.entries.length > 0 && (
          <Card title="The race">
            <StandingsRaceChart entries={history.data.entries} />
          </Card>
        )}
      </section>

      <section className="mt-8">
        {pscores.loading && <Skeleton className="h-64 w-full" />}
        {pscores.data && recap?.standings && (
          <Card title="Category profile">
            <CategoryProfileMatrix teams={pscores.data.teams} standings={recap.standings} />
          </Card>
        )}
      </section>

      <section className="mt-8">
        {awards.loading && <Skeleton className="h-64 w-full" />}
        {awards.data && awards.data.weeks.length > 0 && (
          <Card title="Weekly honors">
            <AwardWall weeks={awards.data.weeks} />
          </Card>
        )}
      </section>
    </div>
  );
}
