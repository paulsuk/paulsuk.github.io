import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTeamAnalysis } from "../../../api/hooks";
import { useLabSport } from "../../../utils/use-lab-sport";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import type {
  RosterTableProps,
  CategoryAnalysisProps,
  ValueRangeBarProps,
} from "../../../api/types";
import { fmtWeekly, BATTING_CAT_ORDER, PITCHING_CAT_ORDER, RATE_CATS } from "../../../utils/lab-helpers";
import MatchupTool from "./MatchupTool";

// ── Stat formatting ──────────────────────────────────────────────────────────

function fmtStat(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 10) return v.toFixed(0);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

// ── P-Score confidence interval range bar ────────────────────────────────────

function ValueRangeBar({ value, low, high }: ValueRangeBarProps) {
  const width = high - low;
  const isWide = width > 4;
  const pct = Math.min(1, Math.max(0, (value - low) / (width || 1))) * 100;
  const trackColor = isWide ? "bg-red-200" : "bg-blue-200";
  const dotColor = isWide ? "bg-red-500" : "bg-blue-600";

  return (
    <div className="mt-1">
      <div className="relative h-1 rounded-full bg-rule" style={{ width: 80 }}>
        <div className={`absolute inset-0 rounded-full ${trackColor}`} />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${dotColor}`}
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <div className="flex justify-between text-ink-faint mt-0.5" style={{ width: 80, fontSize: 9 }}>
        <span>{low.toFixed(1)}</span>
        <span>{high.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ── Rank badge colors ────────────────────────────────────────────────────────

function rankBadgeClass(rank: number, total: number): string {
  if (rank <= 2) return "bg-green-100 text-green-800";
  if (rank <= 5) return "bg-slate-100 text-slate-600";
  if (rank <= total - 2) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// ── Roster table with expandable rows ───────────────────────────────────────

function RosterTable({ players, statCols }: RosterTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!players.length) {
    return <p className="text-meta">No players.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="bg-paper">
          <tr>
            <th className="table-header px-3 py-2 text-left">Name</th>
            <th className="table-header px-3 py-2 text-left">Pos</th>
            <th className="table-header px-3 py-2 text-right text-blue-600">
              P-Score
            </th>
            {statCols.map((c) => (
              <th key={c} className="table-header px-2 py-2 text-right">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule/60">
          {players.map((player) => {
            const isExpanded = expandedId === player.player_id;
            const scoreEntries = Object.entries(player.category_scores).sort(
              ([, a], [, b]) => b - a
            );
            return (
              <React.Fragment key={player.player_id}>
                <tr
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === player.player_id ? null : player.player_id
                    )
                  }
                  className="cursor-pointer hover:bg-paper"
                >
                  <td className="px-3 py-2 font-medium text-ink">
                    {player.name}
                  </td>
                  <td className="px-3 py-2 text-ink-soft">
                    {player.positions ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-blue-700 font-semibold">
                    {player.value != null ? player.value.toFixed(2) : "—"}
                  </td>
                  {statCols.map((c) => (
                    <td
                      key={c}
                      className="px-2 py-2 text-right tabular-nums text-ink-soft"
                    >
                      {fmtStat(player.stats[c])}
                    </td>
                  ))}
                </tr>
                {isExpanded && (
                  <tr key={`${player.player_id}-expand`}>
                    <td
                      colSpan={3 + statCols.length}
                      className="px-4 py-2 bg-paper text-xs text-ink-soft border-b border-rule"
                    >
                      <div className="flex items-start gap-6 flex-wrap">
                        {player.value_low != null && player.value_high != null && player.value != null && (
                          <div>
                            <div className="text-ink-faint mb-1">90% range</div>
                            <ValueRangeBar
                              value={player.value}
                              low={player.value_low}
                              high={player.value_high}
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {scoreEntries.length > 0 ? (
                            scoreEntries.map(([cat, score]) => (
                              <span
                                key={cat}
                                className={score >= 0 ? "text-green-700" : "text-red-600"}
                              >
                                {cat} {score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
                              </span>
                            ))
                          ) : (
                            <span className="text-ink-faint">No score data</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Category analysis table ──────────────────────────────────────────────────

function CategoryAnalysis({ team }: CategoryAnalysisProps) {
  const allCats = Object.keys(team.category_win_probs);
  const battingCats = BATTING_CAT_ORDER.filter((c) => allCats.includes(c));
  const pitchingCats = PITCHING_CAT_ORDER.filter((c) => allCats.includes(c));
  const total = Object.keys(team.category_ranks).length;

  const renderRow = (cat: string) => {
    const prob = team.category_win_probs[cat] ?? 0;
    const rank = team.category_ranks[cat];
    const weekly = team.category_weekly?.[cat];
    const isRate = RATE_CATS.has(cat);

    return (
      <tr key={cat} className="border-t border-rule">
        <td className="py-1.5 px-3 text-ink-soft">{cat}</td>
        <td className="py-1.5 px-3 text-right tabular-nums text-ink-soft">
          {isRate ? fmtWeekly(weekly) : `${fmtWeekly(weekly)}/wk`}
        </td>
        <td className="py-1.5 px-3 text-right">
          {rank != null && (
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${rankBadgeClass(
                rank,
                total
              )}`}
            >
              #{rank}
            </span>
          )}
        </td>
        <td
          className={`py-1.5 px-3 text-right tabular-nums font-medium ${
            prob >= 0.65
              ? "text-green-700"
              : prob <= 0.35
              ? "text-red-600"
              : "text-ink-soft"
          }`}
        >
          {(prob * 100).toFixed(0)}%
        </td>
      </tr>
    );
  };

  const header = (
    <tr className="text-ink-faint text-xs">
      <td className="px-3 py-1">Cat</td>
      <td className="px-3 py-1 text-right">Proj/wk</td>
      <td className="px-3 py-1 text-right">Rank</td>
      <td className="px-3 py-1 text-right">Win%</td>
    </tr>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-lg border border-rule overflow-hidden">
        <div className="bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft uppercase tracking-wider">
          Batting
        </div>
        <table className="w-full text-sm">
          <thead>{header}</thead>
          <tbody>{battingCats.map(renderRow)}</tbody>
        </table>
      </div>
      <div className="rounded-lg border border-rule overflow-hidden">
        <div className="bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft uppercase tracking-wider">
          Pitching
        </div>
        <table className="w-full text-sm">
          <thead>{header}</thead>
          <tbody>{pitchingCats.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

const BATTER_STAT_COLS = ["R", "HR", "RBI", "SB", "AVG", "OPS"];
const PITCHER_STAT_COLS = ["W", "QS", "ERA", "WHIP", "K/9", "SV+H"];

export default function TeamDetailPage() {
  const { slug, sportCode } = useLabSport();
  const { teamId } = useParams<{ teamId: string }>();
  const { data, loading, error } = useTeamAnalysis(sportCode);

  if (loading) return <LoadingSpinner />;
  if (error || !data)
    return <ErrorBanner message={error ?? "Failed to load team analysis"} />;

  const team =
    data.teams.find((t) => t.team_id === decodeURIComponent(teamId!)) ?? null;
  if (!team) return <ErrorBanner message="Team not found" />;

  const batters = team.roster.filter((p) => p.player_type === "batter");
  const pitchers = team.roster.filter((p) => p.player_type === "pitcher");

  return (
    <div>
      {/* Back link */}
      <Link
        to={`/lab/${slug}/teams`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
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
          <span className="font-semibold text-blue-700">
            P-Score {team.team_value.toFixed(1)}
          </span>{" "}
          ·{" "}
          <span className="font-semibold">
            Exp W% {(team.expected_wins * 100).toFixed(1)}%
          </span>
        </p>
      </div>

      {/* Batters */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Batters ({batters.length})
        </h3>
        <RosterTable players={batters} statCols={BATTER_STAT_COLS} />
      </section>

      {/* Pitchers */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Pitchers ({pitchers.length})
        </h3>
        <RosterTable players={pitchers} statCols={PITCHER_STAT_COLS} />
      </section>

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
