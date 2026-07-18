import type { ValueBreakdownItem } from "../../../api/types";
import { fmtCompact, signed } from "../../../utils/format";

export default function ValueBreakdown({ items }: { items: ValueBreakdownItem[] }) {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => Math.abs(i.score)));

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-ink-soft mb-2">Value Breakdown</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const pct = max > 0 ? (Math.abs(item.score) / max) * 100 : 0;
          const positive = item.direction === "up";
          return (
            <div key={item.category} className="flex items-center gap-2 text-sm">
              <span className="w-14 text-right text-ink-soft text-xs">{item.category}</span>
              <div className="flex-1 bg-paper rounded h-2 relative">
                <div
                  className={`h-2 rounded ${positive ? "bg-blue-400" : "bg-red-300"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`w-12 text-xs tabular-nums ${positive ? "text-blue-600" : "text-red-500"}`}>
                {signed(item.score)}
              </span>
              {item.raw_stat != null && (
                <span className="w-14 text-xs text-ink-faint tabular-nums">
                  ({fmtCompact(item.raw_stat)})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
