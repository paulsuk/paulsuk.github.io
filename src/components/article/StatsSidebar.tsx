import type { RecapResponse } from "../../api/types";
import { defaultScoringMode } from "../../utils/league-config";
import { rankStandings, recordFor } from "../../utils/records-helpers";

interface StatsSidebarProps {
  recap: RecapResponse;
  slug: string;
}

export default function StatsSidebar({ recap, slug }: StatsSidebarProps) {
  const scoringMode = defaultScoringMode(slug);

  return (
    <div className="space-y-5">
      {/* Standings */}
      <div>
        <h4 className="eyebrow section-rule mb-2 pt-1">
          Standings — Week {recap.week}
        </h4>
        <div className="space-y-1">
          {rankStandings(recap.standings, scoringMode).map((s) => {
            const { w, l, t } = recordFor(s, scoringMode);
            return (
              <div key={s.team_key} className="flex items-center justify-between text-xs">
                <span>
                  <span className="font-medium text-ink-soft">{s.displayRank}.</span>{" "}
                  <span className="text-ink">{s.team_name}</span>
                </span>
                <span className="tabular-nums text-ink-soft">
                  {w}-{l}-{t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matchups */}
      <div>
        <div className="space-y-1">
          {recap.matchups.map((m, i) => (
            <div key={`${m.team_1_name}-${m.team_2_name}-${i}`} className="text-xs">
              <span className={m.cats_won_1 > m.cats_won_2 ? "font-medium" : "text-ink-soft"}>
                {m.team_1_name}
              </span>
              <span className="mx-1 text-ink-faint">
                {m.cats_won_1}-{m.cats_won_2}
              </span>
              <span className={m.cats_won_2 > m.cats_won_1 ? "font-medium" : "text-ink-soft"}>
                {m.team_2_name}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
