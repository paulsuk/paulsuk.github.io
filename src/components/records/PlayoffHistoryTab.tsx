import { Link } from "react-router-dom";
import { usePlayoffHistory } from "../../api/hooks";
import type { PlayoffElimination, PlayoffMatchupRecordEntry } from "../../api/types";
import ErrorBanner from "../shared/ErrorBanner";
import Skeleton from "../shared/Skeleton";
import StatTileGrid from "../shared/StatTileGrid";

interface PlayoffHistoryTabProps {
  slug: string;
  active: boolean;
}

function recordTile(label: string, rec: PlayoffMatchupRecordEntry | null | undefined) {
  return { label, value: rec ? `${rec.score} (${rec.season} wk ${rec.week})` : "—" };
}

export default function PlayoffHistoryTab({ slug, active }: PlayoffHistoryTabProps) {
  const { data, loading, error } = usePlayoffHistory(slug, active);
  if (!active) return null;
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;
  if (data.resumes.length === 0) {
    return <p className="text-sm text-ink-faint">No playoff history available.</p>;
  }

  const bySeason = new Map<number, PlayoffElimination[]>();
  for (const e of data.eliminations) {
    const list = bySeason.get(e.season) ?? [];
    list.push(e);
    bySeason.set(e.season, list);
  }
  const seasons = [...bySeason.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="eyebrow section-rule">Playoff résumés</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-header text-left">Franchise</th>
              <th className="table-header text-right">Apps</th>
              <th className="table-header text-right">W-L</th>
              <th className="table-header text-right">Finals</th>
              <th className="table-header text-left">Titles</th>
            </tr>
          </thead>
          <tbody>
            {data.resumes.map((r) => (
              <tr key={r.franchise_id} className="border-b border-rule">
                <td className="py-1.5">
                  <Link to={`/${slug}/history/franchise/${r.franchise_id}`} className="hover:text-accent">
                    {r.name}
                  </Link>
                  {r.is_reigning_champ && <span className="badge-championship ml-2">Reigning</span>}
                </td>
                <td className="py-1.5 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{r.appearances}</td>
                <td className="py-1.5 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {r.playoff_wins}-{r.playoff_losses}
                </td>
                <td className="py-1.5 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{r.finals_appearances}</td>
                <td className="py-1.5">
                  {r.championship_seasons.map((s) => (
                    <span key={s} className="badge-championship mr-1">{s}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <StatTileGrid
        title="Playoff records"
        gridClassName="grid gap-4 sm:grid-cols-3"
        tiles={[
          recordTile("Biggest blowout", data.records.biggest_playoff_blowout),
          recordTile("Closest matchup", data.records.closest_playoff_matchup),
          recordTile("Last finals", data.records.finals),
        ]}
      />

      <section>
        <h3 className="eyebrow section-rule">Eliminations</h3>
        <div className="space-y-4">
          {seasons.map((season) => (
            <div key={season}>
              <div className="text-meta mb-1">{season}</div>
              {bySeason.get(season)!.map((e, i) => (
                <div key={i} className="text-sm text-ink-soft">
                  Wk {e.week} · {e.round} — {e.winner_name ?? "?"} def. {e.loser_name ?? "?"}
                  {e.score ? ` (${e.score})` : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
