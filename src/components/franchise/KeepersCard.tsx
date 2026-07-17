import type { SeasonKeepers, KeeperEntry } from "../../api/types";
import { formatSeason } from "../../utils/records-helpers";
import Card from "../shared/Card";

export default function KeepersCard({
  keepers,
  isBaseball,
  selectedSeason,
  onSeasonChange,
  slug,
}: {
  keepers: SeasonKeepers[];
  isBaseball: boolean;
  selectedSeason: number | null;
  onSeasonChange: (s: number | null) => void;
  slug: string;
}) {
  const seasons = keepers.map((sk) => sk.season);
  const activeSeason = selectedSeason ?? seasons[seasons.length - 1];
  const activeKeepers = keepers.find((sk) => sk.season === activeSeason)?.keepers ?? [];

  return (
    <Card title="Keepers">
      {/* Year toggle */}
      <div className="flex flex-wrap gap-1 mb-3">
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => onSeasonChange(s)}
            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
              s === activeSeason
                ? "bg-ink text-paper"
                : "bg-paper text-ink-soft hover:bg-rule"
            }`}
          >
            {formatSeason(s, slug)}
          </button>
        ))}
      </div>

      {/* Keeper rows */}
      <div className="space-y-1.5">
        {activeKeepers.map((k: KeeperEntry) => (
          <div key={k.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink-soft">{k.name}</span>
              {k.position && (
                <span className="badge-position">{k.position}</span>
              )}
              {k.tenure != null && k.tenure > 1 && (
                <span className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium bg-accent/10 text-accent">
                  {k.tenure}yr
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              {isBaseball && k.round_cost != null && (
                <span>Cost: {k.round_cost}</span>
              )}
              {k.kept_from_season != null && (
                <span>since {formatSeason(k.kept_from_season, slug)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
