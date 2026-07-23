import { sparklineSegments } from "../../utils/sparkline";

const W = 64;
const H = 18;

/** Weekly-form sparkline cell — renders nothing without >= 2 drawable points. */
export default function Sparkline({ values }: { values: (number | null)[] }) {
  const segments = sparklineSegments(values, W, H);
  if (!segments.length) return null;
  return (
    <svg width={W} height={H} className="block" aria-hidden="true">
      {segments.map((points, i) => (
        <polyline
          key={i}
          points={points}
          fill="none"
          stroke="var(--color-tool)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
