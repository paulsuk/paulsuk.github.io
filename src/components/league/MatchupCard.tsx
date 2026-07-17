import type { MatchupSummary } from "../../api/types";

function TeamLine({ name, manager, cats, won }: { name: string; manager: string; cats: number; won: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="min-w-0">
        <span className={`truncate text-sm ${won ? "font-semibold text-ink" : "text-ink-soft"}`}>{name}</span>
        <span className="ml-2 text-xs text-ink-faint">{manager}</span>
      </div>
      <span className={`font-display text-xl font-bold tabular-nums ${won ? "text-ink" : "text-ink-faint"}`}>
        {cats}
      </span>
    </div>
  );
}

export default function MatchupCard({ matchup: m }: { matchup: MatchupSummary }) {
  const w1 = m.cats_won_1 > m.cats_won_2;
  const w2 = m.cats_won_2 > m.cats_won_1;
  return (
    <div className="card-editorial">
      {(m.is_playoffs || m.is_consolation) && (
        <p className="eyebrow mb-2">{m.is_consolation ? "Consolation" : "Playoffs"}</p>
      )}
      <TeamLine name={m.team_1_name} manager={m.team_1_manager} cats={m.cats_won_1} won={w1} />
      <TeamLine name={m.team_2_name} manager={m.team_2_manager} cats={m.cats_won_2} won={w2} />
      <div className="mt-3 flex flex-wrap gap-1 border-t border-rule pt-2">
        {m.categories.map((c) => (
          <span
            key={c.display_name}
            title={`${c.display_name}: ${c.team_1_value ?? "—"} vs ${c.team_2_value ?? "—"}`}
            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
              c.winner === 1 ? "bg-ink text-paper" : c.winner === 2 ? "bg-accent/10 text-accent" : "bg-paper text-ink-faint"
            }`}
          >
            {c.display_name}
          </span>
        ))}
      </div>
    </div>
  );
}
