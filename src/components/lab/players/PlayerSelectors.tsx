import type { LabUiConfig } from "../../../api/types";

interface Props {
  config: LabUiConfig;
  season: string;
  model: string;
  onSeasonChange: (s: string) => void;
  onModelChange: (m: string) => void;
}

export default function PlayerSelectors({
  config, season, model, onSeasonChange, onModelChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
      >
        {config.seasons.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
      >
        {config.models.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  );
}
