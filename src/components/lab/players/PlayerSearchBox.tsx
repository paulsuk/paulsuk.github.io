import { useEffect, useRef, useState } from "react";
import { usePlayerSearch } from "../../../api/hooks";
import type { PlayerChip } from "../../../api/types";
import { useDebouncedValue } from "../../../utils/use-debounced-value";

interface Props {
  sportCode: string;
  onSelect: (uid: string) => void;
  placeholder?: string;
}

function ChipHeadshot({ chip }: { chip: PlayerChip }) {
  const [src, setSrc] = useState(chip.headshot.primary ?? undefined);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="h-5 w-5 shrink-0 rounded-full bg-rule object-cover"
      onError={() =>
        setSrc(
          chip.headshot.fallback && src !== chip.headshot.fallback
            ? chip.headshot.fallback
            : undefined,
        )
      }
    />
  );
}

/** Server-backed player search (min 2 chars, debounced) — the lab's shared
 * search surface (players index + player detail). */
export default function PlayerSearchBox({
  sportCode,
  onSelect,
  placeholder = "Find a player...",
}: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(q, 250);
  const { data: results, loading } = usePlayerSearch(sportCode, debounced);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const active = debounced.trim().length >= 2;
  const showEmpty = open && active && !loading && results.length === 0;

  return (
    <div ref={boxRef} className="relative">
      <input
        type="search"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-56 rounded-sm border border-rule bg-raised px-3 py-1.5 text-sm"
      />
      {open && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-sm border border-rule bg-raised shadow-lg">
          {results.map((chip) => (
            <button
              key={chip.uid}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-tool-soft"
              onClick={() => {
                onSelect(chip.uid);
                setQ("");
                setOpen(false);
              }}
            >
              <ChipHeadshot chip={chip} />
              <span className="font-medium text-ink">{chip.name}</span>
              <span className="ml-auto text-xs text-ink-faint">
                {[chip.team, chip.primary_position].filter(Boolean).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      )}
      {showEmpty && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-sm border border-rule bg-raised px-3 py-2 text-xs text-ink-faint shadow-lg">
          No matches — either a typo, or they're still grinding in the minors.
        </div>
      )}
    </div>
  );
}
