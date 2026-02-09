import type { RecapResponse } from "../../api/types";

interface StatsSidebarProps {
  recap: RecapResponse;
}

export default function StatsSidebar({ recap }: StatsSidebarProps) {
  return (
    <div className="space-y-5">
      {/* Standings */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Standings — Week {recap.week}
        </h4>
        <div className="space-y-1">
          {recap.standings.map((s) => (
            <div key={s.team_key} className="flex items-center justify-between text-xs">
              <span>
                <span className="font-medium text-gray-600">{s.rank}.</span>{" "}
                <span className="text-gray-800">{s.manager}</span>
              </span>
              <span className="tabular-nums text-gray-500">
                {s.wins}-{s.losses}{s.ties > 0 ? `-${s.ties}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Matchups */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Matchups
        </h4>
        <div className="space-y-1">
          {recap.matchups.map((m, i) => (
            <div key={i} className="text-xs">
              <span className={m.cats_won_1 > m.cats_won_2 ? "font-medium" : "text-gray-500"}>
                {m.team_1_manager}
              </span>
              <span className="mx-1 text-gray-400">
                {m.cats_won_1}-{m.cats_won_2}
              </span>
              <span className={m.cats_won_2 > m.cats_won_1 ? "font-medium" : "text-gray-500"}>
                {m.team_2_manager}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Awards */}
      {(recap.batter_of_week || recap.pitcher_of_week || recap.player_of_week) && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Awards
          </h4>
          <div className="space-y-1 text-xs">
            {recap.batter_of_week && (
              <div>
                <span className="text-gray-500">BOTW:</span>{" "}
                <span className="font-medium">{recap.batter_of_week.name}</span>{" "}
                <span className="text-gray-400">({recap.batter_of_week.manager})</span>
              </div>
            )}
            {recap.pitcher_of_week && (
              <div>
                <span className="text-gray-500">POTW:</span>{" "}
                <span className="font-medium">{recap.pitcher_of_week.name}</span>{" "}
                <span className="text-gray-400">({recap.pitcher_of_week.manager})</span>
              </div>
            )}
            {recap.player_of_week && (
              <div>
                <span className="text-gray-500">POTW:</span>{" "}
                <span className="font-medium">{recap.player_of_week.name}</span>{" "}
                <span className="text-gray-400">({recap.player_of_week.manager})</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
