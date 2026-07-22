import { useState } from "react";
import { Link } from "react-router-dom";
import type { PlayerCard as PlayerCardData } from "../../api/types";
import { formatStat } from "../../utils/format";

export default function PlayerCard({
  player,
  labHref = null,
}: {
  player: PlayerCardData;
  labHref?: string | null;
}) {
  const [src, setSrc] = useState(player.headshot.primary ?? undefined);
  const positions = player.eligible_positions.length
    ? player.eligible_positions.join(" · ")
    : player.primary_position ?? "";
  const statBits = player.stat_line
    ? Object.entries(player.stat_line).map(([k, v]) => `${formatStat(v, k)} ${k}`)
    : [];

  return (
    <div className="card-editorial">
      <div className="flex items-center gap-4">
        {src && (
          <img
            src={src}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full bg-rule object-cover"
            onError={() => {
              if (player.headshot.fallback && src !== player.headshot.fallback) {
                setSrc(player.headshot.fallback);
              } else {
                setSrc(undefined);
              }
            }}
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold leading-tight">{player.name}</h1>
          <p className="text-sm text-ink-soft">
            {player.team ?? "Free agent"}
            {positions && <span className="text-ink-faint"> · {positions}</span>}
          </p>
        </div>
      </div>

      {statBits.length > 0 && (
        <div className="mt-4 border-t border-rule pt-3">
          <p className="eyebrow mb-1">{player.stat_season} season</p>
          <p className="agate">{statBits.join(" · ")}</p>
        </div>
      )}

      {labHref && (
        <Link to={labHref} className="mt-4 inline-block text-xs text-ink-faint hover:text-accent">
          View in lab →
        </Link>
      )}
    </div>
  );
}
