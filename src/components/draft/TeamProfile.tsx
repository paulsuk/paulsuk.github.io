import { BATTING_CAT_ORDER as BATTING_ORDER, PITCHING_CAT_ORDER as PITCHING_ORDER } from "../../utils/lab-helpers";

interface CategoryInfo {
  name: string;
  total: number;
  rank: number;
  tier: string;
}

interface Props {
  categories: CategoryInfo[];
  numTeams: number;
  strategy?: string;
}

const TIER_COLORS: Record<string, string> = {
  dominant: "bg-win",
  competitive: "bg-tool",
  swing: "bg-ink-faint",
  punt: "bg-loss",
};

const TIER_LABELS: Record<string, string> = {
  dominant: "DOM",
  competitive: "COMP",
  swing: "SWING",
  punt: "PUNT",
};

function CatRow({ cat, maxRank }: { cat: CategoryInfo; maxRank: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs font-bold text-right">{cat.name}</span>
      <div className="flex-1 bg-rule/60 rounded h-5 relative">
        <div
          className={`h-5 rounded ${TIER_COLORS[cat.tier] || "bg-rule"}`}
          style={{ width: `${Math.max(0, ((maxRank - cat.rank + 1) / maxRank) * 100)}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          #{cat.rank}
        </span>
      </div>
      <span
        className={`text-xs font-bold w-12 text-center rounded px-1 py-0.5 text-white ${
          TIER_COLORS[cat.tier] || "bg-ink-faint"
        }`}
      >
        {TIER_LABELS[cat.tier] || "?"}
      </span>
    </div>
  );
}

export function TeamProfile({ categories, numTeams, strategy }: Props) {
  // League size comes from the synced preload — never hardcoded (10-team
  // baseball and 12-team basketball both route through here). Fall back to
  // the worst observed rank if the preload is unavailable.
  const maxRank = numTeams > 0 ? numTeams : Math.max(1, ...categories.map((c) => c.rank));
  const byName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const batting = BATTING_ORDER.map((n) => byName[n]).filter(Boolean) as CategoryInfo[];
  const pitching = PITCHING_ORDER.map((n) => byName[n]).filter(Boolean) as CategoryInfo[];
  // Any categories not in the hardcoded order (e.g. future stat changes)
  const known = new Set([...BATTING_ORDER, ...PITCHING_ORDER]);
  const rest = categories.filter((c) => !known.has(c.name));

  return (
    <div className="p-3">
      {strategy && (
        <p className="text-sm text-ink-soft mb-3 italic">{strategy}</p>
      )}
      <div className="space-y-1.5">
        {batting.map((cat) => <CatRow key={cat.name} cat={cat} maxRank={maxRank} />)}
        {pitching.length > 0 && <div className="border-t my-1" />}
        {pitching.map((cat) => <CatRow key={cat.name} cat={cat} maxRank={maxRank} />)}
        {rest.map((cat) => <CatRow key={cat.name} cat={cat} maxRank={maxRank} />)}
      </div>
    </div>
  );
}
