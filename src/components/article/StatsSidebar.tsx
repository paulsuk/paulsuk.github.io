import type { RecapResponse } from "../../api/types";

interface StatsSidebarProps {
  recap: RecapResponse;
  slug: string;
}

export default function StatsSidebar({ recap, slug }: StatsSidebarProps) {
  const useCats = slug === "baseball";

  return (
    <div className="space-y-5">
      {/* Standings */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Standings — Week {recap.week}
        </h4>
        <div className="space-y-1">
          {recap.standings.map((s) => {
            const w = useCats ? s.cat_wins : s.wins;
            const l = useCats ? s.cat_losses : s.losses;
            const t = useCats ? s.cat_ties : s.ties;
            return (
              <div key={s.team_key} className="flex items-center justify-between text-xs">
                <span>
                  <span className="font-medium text-gray-600">{s.rank}.</span>{" "}
                  <span className="text-gray-800">{s.manager}</span>
                </span>
                <span className="tabular-nums text-gray-500">
                  {w}-{l}-{t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matchups */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Matchups
        </h4>
        <div className="space-y-1">
          {recap.matchups.map((m) => (
            <div key={`${m.team_1_manager}-${m.team_2_manager}`} className="text-xs">
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

    </div>
  );
}
