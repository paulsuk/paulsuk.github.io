// web/src/components/lab/rankings/RankingsControls.tsx
import PuntSelector from "./PuntSelector";
import type { LabUiConfig } from "../../../api/types";

const MLB_POSITIONS = ["All", "C", "1B", "2B", "SS", "3B", "OF", "SP", "RP"];
const NBA_POSITIONS = ["All", "PG", "SG", "SF", "PF", "C"];

export interface RankingsFilter {
  season: string;
  model: string;
  start: string;
  end: string;
  position: string;
  team: string;
  availableOnly: boolean;
  punted: string[];
  search: string;
}

interface Props {
  sport: string;
  config: LabUiConfig;
  filter: RankingsFilter;
  teams: string[];
  onChange: (patch: Partial<RankingsFilter>) => void;
}

export default function RankingsControls({
  sport,
  config,
  filter,
  teams,
  onChange,
}: Props) {
  const positions = sport === "mlb" ? MLB_POSITIONS : NBA_POSITIONS;
  const selectedSeason = config.seasons.find((s) => s.id === filter.season);
  const dateEnabled = selectedSeason?.date_range_enabled ?? false;

  return (
    <div className="space-y-2 mb-4">
      {/* Row 1: season, date, model, punt */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filter.season}
          onChange={(e) => onChange({ season: e.target.value, start: "", end: "" })}
          className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
        >
          {config.seasons.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filter.start}
          disabled={!dateEnabled}
          onChange={(e) => onChange({ start: e.target.value })}
          className="rounded border border-gray-200 px-2 py-1.5 text-sm disabled:opacity-40"
        />
        <span className="text-gray-400 text-sm">–</span>
        <input
          type="date"
          value={filter.end}
          disabled={!dateEnabled}
          onChange={(e) => onChange({ end: e.target.value })}
          className="rounded border border-gray-200 px-2 py-1.5 text-sm disabled:opacity-40"
        />

        <select
          value={filter.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
        >
          {config.models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <PuntSelector
          categories={config.scoring_categories}
          punted={filter.punted}
          onChange={(punted) => onChange({ punted })}
        />
      </div>

      {/* Row 2: position, team, available, search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => onChange({ position: pos })}
              className={`px-2 py-0.5 text-xs rounded ${
                filter.position === pos
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        <select
          value={filter.team}
          onChange={(e) => onChange({ team: e.target.value })}
          className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm"
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filter.availableOnly}
            onChange={(e) => onChange({ availableOnly: e.target.checked })}
            className="rounded"
          />
          Available only
        </label>

        <input
          type="search"
          placeholder="Search player..."
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="rounded border border-gray-200 px-3 py-1.5 text-sm w-44 shadow-sm"
        />
      </div>
    </div>
  );
}
