import type { StatTileGridProps } from "../../api/types";

/** Titled label/value tile grid shared by the player stat panels. */
export default function StatTileGrid({ title, gridClassName, tiles, children }: StatTileGridProps) {
  if (!tiles.length) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">{title}</h3>
      <div className={gridClassName}>
        {tiles.map((t) => (
          <div key={t.label} className="bg-paper rounded p-2 text-center">
            <div className="text-xs text-ink-faint mb-0.5">{t.label}</div>
            <div className="text-sm font-medium tabular-nums">{t.value}</div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
