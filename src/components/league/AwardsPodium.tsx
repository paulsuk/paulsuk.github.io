import type { PlayerAward, PlayerRef, RecapResponse } from "../../api/types";
import { signed } from "../../utils/format";
import { usePlayers } from "../../api/hooks";
import { useSport } from "../../context/SportContext";
import { leagueBySlug } from "../../utils/league-config";
import PlayerChip from "../shared/PlayerChip";

function AwardCard({
  title,
  award,
  compact,
  chipMap,
}: {
  title: string;
  award: PlayerAward;
  compact: boolean;
  chipMap: Record<string, import("../../api/types").PlayerChip>;
}) {
  const statBits = Object.entries(award.stat_line).map(([k, v]) => `${v} ${k}`);
  const chip = chipMap[award.player_key];
  return (
    <div className={compact ? "" : "card-editorial"}>
      <p className="eyebrow">{title}</p>
      <p className="mt-1 font-display text-lg font-bold leading-tight">
        {chip ? <PlayerChip player={chip} /> : award.name}
      </p>
      <p className="text-xs text-ink-soft">
        {award.position} · {award.team_name} ({award.manager})
      </p>
      {!compact && statBits.length > 0 && <p className="agate mt-2">{statBits.join(" · ")}</p>}
      <p className="agate mt-1 text-accent">z {signed(award.z_total, 1)}</p>
    </div>
  );
}

export default function AwardsPodium({ recap, compact = false }: { recap: RecapResponse; compact?: boolean }) {
  const { slug } = useSport();
  const sport = leagueBySlug(slug)?.sportCode ?? "mlb";

  const awards: { title: string; award: PlayerAward }[] = [];
  if (recap.batter_of_week) awards.push({ title: "Batter of the Week", award: recap.batter_of_week });
  if (recap.pitcher_of_week) awards.push({ title: "Pitcher of the Week", award: recap.pitcher_of_week });
  if (recap.player_of_week) awards.push({ title: "Player of the Week", award: recap.player_of_week });

  const refs: PlayerRef[] = awards
    .map((a) => a.award.player_key)
    .filter(Boolean)
    .map((k) => ({ type: "yahoo", value: k }));
  const { data: chipMap } = usePlayers(sport, refs);

  if (awards.length === 0) return null;

  return (
    <section>
      <h2 className="section-rule eyebrow mb-3 pt-1">This week's honors</h2>
      <div className={compact ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
        {awards.map((a) => (
          <AwardCard key={a.title} {...a} compact={compact} chipMap={chipMap} />
        ))}
      </div>
    </section>
  );
}
