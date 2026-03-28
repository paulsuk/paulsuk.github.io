export function fmtWeekly(v: number | undefined): string {
  if (v == null) return "—";
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
}
