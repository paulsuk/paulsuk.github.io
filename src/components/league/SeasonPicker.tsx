import type { Season } from "../../api/types";
import { formatSeason } from "../../utils/records-helpers";

interface SeasonPickerProps {
  seasons: Season[];
  selected: number | null;
  onChange: (season: number) => void;
  slug: string;
}

export default function SeasonPicker({ seasons, selected, onChange, slug }: SeasonPickerProps) {
  if (seasons.length === 0) return null;

  return (
    <select
      value={selected ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="Select season"
      className="rounded-sm border border-rule bg-raised px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    >
      {seasons.map((s) => (
        <option key={s.season} value={s.season}>
          {formatSeason(s.season, slug)} {s.is_finished ? "" : "(in progress)"}
        </option>
      ))}
    </select>
  );
}
