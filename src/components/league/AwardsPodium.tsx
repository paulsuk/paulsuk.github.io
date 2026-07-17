import type { PlayerAward, RecapResponse } from "../../api/types";

function AwardCard({ title, award, compact }: { title: string; award: PlayerAward; compact: boolean }) {
  const statBits = Object.entries(award.stat_line).map(([k, v]) => `${v} ${k}`);
  return (
    <div className={compact ? "" : "card-editorial"}>
      <p className="eyebrow">{title}</p>
      <p className="mt-1 font-display text-lg font-bold leading-tight">{award.name}</p>
      <p className="text-xs text-ink-soft">
        {award.position} · {award.team_name} ({award.manager})
      </p>
      {!compact && statBits.length > 0 && (
        <p className="agate mt-2">{statBits.join(" · ")}</p>
      )}
      <p className="agate mt-1 text-accent">z {award.z_total >= 0 ? "+" : ""}{award.z_total.toFixed(1)}</p>
    </div>
  );
}

export default function AwardsPodium({ recap, compact = false }: { recap: RecapResponse; compact?: boolean }) {
  const awards: { title: string; award: PlayerAward }[] = [];
  if (recap.batter_of_week) awards.push({ title: "Batter of the Week", award: recap.batter_of_week });
  if (recap.pitcher_of_week) awards.push({ title: "Pitcher of the Week", award: recap.pitcher_of_week });
  if (recap.player_of_week) awards.push({ title: "Player of the Week", award: recap.player_of_week });
  if (awards.length === 0) return null;

  return (
    <section>
      <h2 className="section-rule eyebrow mb-3 pt-1">This week's honors</h2>
      <div className={compact ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
        {awards.map((a) => <AwardCard key={a.title} {...a} compact={compact} />)}
      </div>
    </section>
  );
}
