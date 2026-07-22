import { useState } from "react";
import type { ScoringMode, StandingsHistoryEntry } from "../../api/types";
import { LABEL_W, buildRaceLayout, xForWeekIndex } from "./race-chart-layout";

// Categorical series palette (dataviz-validated on the light surface): 8 hues,
// assigned by a stable per-team slot; teams 9+ reuse hues 1–4 as dashed lines.
// Identity is color + the end-of-line label + hover (composite encoding).
const SERIES = [
  "var(--color-series-1)", "var(--color-series-2)", "var(--color-series-3)", "var(--color-series-4)",
  "var(--color-series-5)", "var(--color-series-6)", "var(--color-series-7)", "var(--color-series-8)",
];

interface StandingsRaceChartProps {
  entries: StandingsHistoryEntry[];
  scoringMode: ScoringMode;
}

export default function StandingsRaceChart({ entries, scoringMode }: StandingsRaceChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const layout = buildRaceLayout(entries, scoringMode);
  if (layout.series.length === 0) return null;

  // Stable team_key -> palette slot (sorted by key so each team's color is fixed,
  // independent of its current rank and stable across hover).
  const slotByKey = new Map(
    layout.series.map((s) => s.team_key).sort().map((k, i) => [k, i] as const)
  );

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        role="group"
        aria-label="Games above or below .500 by week"
        className="block"
      >
        {layout.weeks.map((w, i) => (
          <text
            key={w}
            x={xForWeekIndex(i)}
            y={12}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-ink-faint)"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {w}
          </text>
        ))}
        {layout.ticks.map((tk) => (
          <g key={tk.value}>
            <line
              x1={xForWeekIndex(0)}
              x2={xForWeekIndex(layout.weeks.length - 1)}
              y1={tk.y}
              y2={tk.y}
              stroke={tk.value === 0 ? "var(--color-ink-faint)" : "var(--color-rule)"}
              strokeWidth={tk.value === 0 ? 1 : 0.5}
              strokeDasharray={tk.value === 0 ? undefined : "2 3"}
            />
            <text
              x={8}
              y={tk.y + 3}
              fontSize="10"
              fill="var(--color-ink-faint)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {tk.label}
            </text>
          </g>
        ))}
        {layout.series.map((s) => {
          const isActive = active === s.team_key;
          const dimmed = active !== null && !isActive;
          const last = s.points[s.points.length - 1];
          const points = s.points.map((p) => `${p.x},${p.y}`).join(" ");
          const slot = slotByKey.get(s.team_key) ?? 0;
          const color = SERIES[slot % SERIES.length];
          const dashed = slot >= SERIES.length;
          return (
            <g
              key={s.team_key}
              onMouseEnter={() => setActive(s.team_key)}
              onMouseLeave={() => setActive((prev) => (prev === s.team_key ? null : prev))}
              onFocus={() => setActive(s.team_key)}
              onBlur={() => setActive((prev) => (prev === s.team_key ? null : prev))}
              tabIndex={0}
              aria-label={`${s.team_name}, ${last.value > 0 ? "+" : ""}${last.value} games vs .500 after week ${last.week}`}
              // No custom focus ring: the accent highlight (stroke + label color
              // flip) IS the focus indicator here, same as the hover state.
              // Don't "fix" this by adding a focus outline back.
              className="cursor-default focus:outline-none"
            >
              {/* Wider, invisible stroke so the hover/focus hit target isn't
                  limited to the visible 1.5px line (dataviz: hit target
                  bigger than the mark). */}
              <polyline
                points={points}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="stroke"
              />
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeDasharray={dashed ? "5 3" : undefined}
                strokeOpacity={dimmed ? 0.2 : 1}
                strokeWidth={isActive ? 2.75 : 1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
              />
              <circle
                cx={last.x}
                cy={last.y}
                r={isActive ? 3 : 2.2}
                fill={color}
                opacity={dimmed ? 0.2 : 1}
                pointerEvents="none"
              />
              <text
                x={layout.width - LABEL_W + 10}
                y={last.y + 3}
                fontSize="11"
                fontWeight={isActive ? 600 : 400}
                fill={isActive ? "var(--color-ink)" : "var(--color-ink-soft)"}
                opacity={dimmed ? 0.4 : 1}
              >
                {s.team_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
