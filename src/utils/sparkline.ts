/** SVG polyline point-strings for a tiny inline sparkline. One string per
 * contiguous run of non-null values (gaps split the line); runs shorter than
 * 2 points are dropped (nothing to draw). y is scaled to the series' own
 * min/max; a flat series draws mid-height. */
export function sparklineSegments(
  values: (number | null)[],
  width = 64,
  height = 18,
  pad = 2,
): string[] {
  const present = values.filter((v): v is number => v != null);
  if (present.length < 2) return [];
  const min = Math.min(...present);
  const span = Math.max(...present) - min;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const y = (v: number) =>
    pad + (height - pad * 2) * (1 - (span === 0 ? 0.5 : (v - min) / span));

  const segments: string[] = [];
  let run: string[] = [];
  values.forEach((v, i) => {
    if (v == null) {
      if (run.length >= 2) segments.push(run.join(" "));
      run = [];
      return;
    }
    run.push(`${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`);
  });
  if (run.length >= 2) segments.push(run.join(" "));
  return segments;
}
