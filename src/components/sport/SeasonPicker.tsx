import type { Season } from "../../api/types";

interface SeasonPickerProps {
  seasons: Season[];
  selected: number | null;
  onChange: (season: number) => void;
}

export default function SeasonPicker({ seasons, selected, onChange }: SeasonPickerProps) {
  if (seasons.length === 0) return null;

  return (
    <select
      value={selected ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {seasons.map((s) => (
        <option key={s.season} value={s.season}>
          {s.season} {s.is_finished ? "" : "(in progress)"}
        </option>
      ))}
    </select>
  );
}
