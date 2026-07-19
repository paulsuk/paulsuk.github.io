import { useState } from "react";
import type { StandingsHistoryEntry } from "../../api/types";
import { LABEL_W, buildRaceLayout, xForWeekIndex, yForRank } from "./race-chart-layout";

interface StandingsRaceChartProps {
  entries: StandingsHistoryEntry[];
}

export default function StandingsRaceChart({ entries }: StandingsRaceChartProps) {
  const [active, setActive] = useState<string | null>(null);
  const layout = buildRaceLayout(entries);
  if (layout.series.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        role="group"
        aria-label="Standings rank by week"
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
        {Array.from({ length: layout.teamCount }, (_, r) => (
          <g key={r}>
            <line
              x1={xForWeekIndex(0)}
              x2={xForWeekIndex(layout.weeks.length - 1)}
              y1={yForRank(r + 1)}
              y2={yForRank(r + 1)}
              stroke="var(--color-rule)"
              strokeWidth="0.5"
            />
            <text
              x={10}
              y={yForRank(r + 1) + 3}
              fontSize="10"
              fill="var(--color-ink-faint)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {r + 1}
            </text>
          </g>
        ))}
        {layout.series.map((s) => {
          const isActive = active === s.team_key;
          const dimmed = active !== null && !isActive;
          const last = s.points[s.points.length - 1];
          const points = s.points.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g
              key={s.team_key}
              onMouseEnter={() => setActive(s.team_key)}
              onMouseLeave={() => setActive((prev) => (prev === s.team_key ? null : prev))}
              onFocus={() => setActive(s.team_key)}
              onBlur={() => setActive((prev) => (prev === s.team_key ? null : prev))}
              tabIndex={0}
              aria-label={`${s.team_name}, rank ${s.final.rank} after week ${s.final.week}`}
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
                stroke={isActive ? "var(--color-accent)" : "var(--color-ink-faint)"}
                strokeOpacity={dimmed ? 0.25 : 1}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
              />
              <text
                x={layout.width - LABEL_W + 10}
                y={last.y + 3}
                fontSize="11"
                fill={isActive ? "var(--color-accent)" : "var(--color-ink-soft)"}
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
