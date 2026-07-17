export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-ink-faint">{label}</div>
      <div className="font-medium text-ink-soft">{value}</div>
    </div>
  );
}
