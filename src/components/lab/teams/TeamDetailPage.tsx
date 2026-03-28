import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTeamAnalysis } from "../../../api/hooks";
import LoadingSpinner from "../../shared/LoadingSpinner";
import ErrorBanner from "../../shared/ErrorBanner";
import type {
  RosterTableProps,
  CategoryAnalysisProps,
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
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-sm whitespace-nowrap">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header px-3 py-2 text-left">Name</th>
            <th className="table-header px-3 py-2 text-left">Pos</th>
            <th className="table-header px-3 py-2 text-right text-blue-600">
              G-Val
            </th>
            {statCols.map((c) => (
              <th key={c} className="table-header px-2 py-2 text-right">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
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
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {player.name}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {player.positions ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-blue-700 font-semibold">
                    {player.value != null ? player.value.toFixed(2) : "—"}
                  </td>
                  {statCols.map((c) => (
                    <td
                      key={c}
                      className="px-2 py-2 text-right tabular-nums text-gray-600"
                    >
                      {fmtStat(player.stats[c])}
                    </td>
                  ))}
                </tr>
                {isExpanded && (
                  <tr key={`${player.player_id}-expand`}>
                    <td
                      colSpan={3 + statCols.length}
                      className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-100"
                    >
                      {scoreEntries.length > 0 ? (
                        scoreEntries.map(([cat, score]) => (
                          <span
                            key={cat}
                            className={`mr-3 ${
                              score >= 0 ? "text-green-700" : "text-red-600"
                            }`}
                          >
                            {cat} {score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No score data</span>
                      )}
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
      <tr key={cat} className="border-t border-gray-100">
        <td className="py-1.5 px-3 text-gray-700">{cat}</td>
        <td className="py-1.5 px-3 text-right tabular-nums text-gray-600">
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
              : "text-gray-500"
          }`}
        >
          {(prob * 100).toFixed(0)}%
        </td>
      </tr>
    );
  };

  const header = (
    <tr className="text-gray-400 text-xs">
      <td className="px-3 py-1">Cat</td>
      <td className="px-3 py-1 text-right">Proj/wk</td>
      <td className="px-3 py-1 text-right">Rank</td>
      <td className="px-3 py-1 text-right">Win%</td>
    </tr>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Batting
        </div>
        <table className="w-full text-sm">
          <thead>{header}</thead>
          <tbody>{battingCats.map(renderRow)}</tbody>
        </table>
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
  const { sport = "mlb", teamId } = useParams<{
    sport: string;
    teamId: string;
  }>();
  const { data, loading, error } = useTeamAnalysis(sport);

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
        to={`/lab/${sport}/teams`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to teams
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{team.team_name}</h2>
        {team.manager_name && (
          <p className="text-sm text-gray-500">{team.manager_name}</p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          {data.season} season ·{" "}
          <span className="font-semibold text-blue-700">
            G-Val {team.team_value.toFixed(1)}
          </span>{" "}
          ·{" "}
          <span className="font-semibold">
            Exp W% {(team.expected_wins * 100).toFixed(1)}%
          </span>
        </p>
      </div>

      {/* Batters */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Batters ({batters.length})
        </h3>
        <RosterTable players={batters} statCols={BATTER_STAT_COLS} />
      </section>

      {/* Pitchers */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Pitchers ({pitchers.length})
        </h3>
        <RosterTable players={pitchers} statCols={PITCHER_STAT_COLS} />
      </section>

      {/* Category analysis */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
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
