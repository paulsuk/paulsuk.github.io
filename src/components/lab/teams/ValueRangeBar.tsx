import type { ValueRangeBarProps } from "../../../api/types";

/** P-Score 90% confidence-interval range bar (wide interval = red). */
export default function ValueRangeBar({ value, low, high }: ValueRangeBarProps) {
  const width = high - low;
  const isWide = width > 4;
  const pct = Math.min(1, Math.max(0, (value - low) / (width || 1))) * 100;
  const trackColor = isWide ? "bg-red-200" : "bg-blue-200";
  const dotColor = isWide ? "bg-red-500" : "bg-blue-600";

  return (
    <div className="mt-1">
      <div className="relative h-1 rounded-full bg-rule" style={{ width: 80 }}>
        <div className={`absolute inset-0 rounded-full ${trackColor}`} />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${dotColor}`}
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>
      <div className="flex justify-between text-ink-faint mt-0.5" style={{ width: 80, fontSize: 9 }}>
        <span>{low.toFixed(1)}</span>
        <span>{high.toFixed(1)}</span>
      </div>
    </div>
  );
}
