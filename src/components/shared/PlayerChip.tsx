import { useState } from "react";
import { Link } from "react-router-dom";
import type { PlayerChip as PlayerChipData } from "../../api/types";
import { useSport } from "../../context/SportContext";

export default function PlayerChip({ player }: { player: PlayerChipData }) {
  const { slug } = useSport();
  const [src, setSrc] = useState(player.headshot.primary ?? undefined);

  return (
    <Link
      to={`/${slug}/players/${encodeURIComponent(player.uid)}`}
      className="inline-flex items-center gap-1.5 align-middle no-underline hover:text-accent"
    >
      {src && (
        <img
          src={src}
          alt=""
          className="h-5 w-5 shrink-0 rounded-full bg-rule object-cover"
          onError={() => {
            if (player.headshot.fallback && src !== player.headshot.fallback) {
              setSrc(player.headshot.fallback);
            } else {
              setSrc(undefined);
            }
          }}
        />
      )}
      <span className="font-semibold text-ink">{player.name}</span>
    </Link>
  );
}
