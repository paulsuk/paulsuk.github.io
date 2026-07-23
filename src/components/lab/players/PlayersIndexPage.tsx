import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLabUiConfig, usePlayers, usePlayerSeries, useRankings } from "../../../api/hooks";
import type { PlayerRef } from "../../../api/types";
import { useLabSport } from "../../../utils/use-lab-sport";
import {
  firstNumericSeason,
  LAB_DEFAULT_SEASON,
  PLAYERS_INDEX_TOP_N,
} from "../../../utils/lab-config";
import {
  MLB_POSITION_FILTERS,
  NBA_POSITION_FILTERS,
} from "../../../utils/lab-helpers";
import PlayerSearchBox from "./PlayerSearchBox";
import Sparkline from "../Sparkline";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";

/** Search-first player directory: server-backed search over everyone, plus a
 * browse listing derived from the rankings payload (no new backend surface). */
export default function PlayersIndexPage() {
  const { slug, sportCode } = useLabSport();
  const navigate = useNavigate();
  const [position, setPosition] = useState("All");

  const { data: config, loading: configLoading, error: configError } =
    useLabUiConfig(sportCode);
  const browseSeason = config
    ? (firstNumericSeason(config.seasons) ?? LAB_DEFAULT_SEASON)
    : null;
  const model =
    config?.models.find((m) => m.default)?.id ?? config?.models[0]?.id ?? "";

  const { data: rankings, loading, error } = useRankings(
    browseSeason && model ? sportCode : null,
    {
      season: browseSeason ?? "",
      model,
      position: position !== "All" ? position : undefined,
    },
  );

  const top = useMemo(
    () => (rankings?.players ?? []).slice(0, PLAYERS_INDEX_TOP_N),
    [rankings],
  );
  const refs = useMemo<PlayerRef[]>(
    () =>
      top
        .filter((p) => p.player_uid)
        .map((p) => ({ type: "uid" as const, value: p.player_uid! })),
    [top],
  );
  const { data: chips } = usePlayers(sportCode, refs);
  const { data: seriesData } = usePlayerSeries(
    browseSeason && model ? sportCode : null,
    browseSeason ?? "",
  );

  const filters = sportCode === "nba" ? NBA_POSITION_FILTERS : MLB_POSITION_FILTERS;

  function openPlayer(p: { player_uid: string | null; player_id: number }) {
    navigate(
      `/lab/${slug}/players/${encodeURIComponent(p.player_uid ?? String(p.player_id))}`,
    );
  }

  if (configLoading) return <LoadingSpinner />;
  if (configError || !config)
    return <ErrorBanner message={configError ?? "Failed to load config"} />;

  return (
    <div className="max-w-4xl mx-auto">
      <p className="eyebrow mb-3">Players</p>
      <div className="mb-6">
        <PlayerSearchBox
          sportCode={sportCode}
          onSelect={(uid) =>
            navigate(`/lab/${slug}/players/${encodeURIComponent(uid)}`)
          }
          placeholder="Search every player..."
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {filters.map((pos) => (
          <button
            key={pos}
            onClick={() => setPosition(pos)}
            className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
              position === pos
                ? "bg-ink text-paper"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}
      {rankings && (
        <div className="overflow-x-auto rounded-lg border border-rule">
          <table className="table-dense">
            <thead className="bg-paper">
              <tr>
                <th className="table-header th-dense">#</th>
                <th className="table-header th-dense text-left">Player</th>
                <th className="table-header th-dense">Team</th>
                <th className="table-header th-dense">Pos</th>
                <th className="table-header th-dense bg-tool-soft text-tool">Value</th>
                {seriesData?.series && (
                  <th className="table-header th-dense">Form</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {top.map((p) => {
                const chip = p.player_uid ? chips[p.player_uid] : undefined;
                const headshot = chip?.headshot.primary;
                return (
                  <tr key={p.player_id} className="bg-raised">
                    <td className="td-dense cell-num text-ink-faint">{p.rank}</td>
                    <td className="td-dense">
                      <button
                        onClick={() => openPlayer(p)}
                        className="flex items-center gap-1.5 font-medium text-ink hover:text-tool hover:underline"
                      >
                        {headshot && (
                          <img
                            src={headshot}
                            alt=""
                            className="h-5 w-5 shrink-0 rounded-full bg-rule object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        {p.name}
                      </button>
                    </td>
                    <td className="td-dense text-ink-soft">{p.team ?? "—"}</td>
                    <td className="td-dense text-xs text-ink-soft">
                      {p.positions ?? "—"}
                    </td>
                    <td className="td-dense score-cell font-semibold">
                      {p.value.toFixed(2)}
                    </td>
                    {seriesData?.series && (
                      <td className="td-dense">
                        {p.player_uid && seriesData.series[p.player_uid] ? (
                          <Sparkline values={seriesData.series[p.player_uid]} />
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-meta mt-2">
        Top {PLAYERS_INDEX_TOP_N} by value
        {browseSeason ? ` — ${browseSeason}` : ""}. Search finds everyone.
      </p>
    </div>
  );
}
