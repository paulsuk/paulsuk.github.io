interface CategoryInfo {
  name: string;
  total: number;
  rank: number;
  tier: string;
}

interface Props {
  categories: CategoryInfo[];
  strategy?: string;
}

const BATTING_ORDER = ["R", "HR", "RBI", "SB", "AVG", "OPS"];
const PITCHING_ORDER = ["W", "QS", "ERA", "WHIP", "K/9", "SV+H"];

const TIER_COLORS: Record<string, string> = {
  dominant: "bg-green-500",
  competitive: "bg-blue-400",
  swing: "bg-yellow-400",
  punt: "bg-red-400",
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
      <div className="flex-1 bg-gray-100 rounded h-5 relative">
        <div
          className={`h-5 rounded ${TIER_COLORS[cat.tier] || "bg-gray-300"}`}
          style={{ width: `${((maxRank - cat.rank + 1) / maxRank) * 100}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          #{cat.rank}
        </span>
      </div>
      <span
        className={`text-xs font-bold w-12 text-center rounded px-1 py-0.5 text-white ${
          TIER_COLORS[cat.tier] || "bg-gray-400"
        }`}
      >
        {TIER_LABELS[cat.tier] || "?"}
      </span>
    </div>
  );
}

export function TeamProfile({ categories, strategy }: Props) {
  const maxRank = 10;
  const byName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const batting = BATTING_ORDER.map((n) => byName[n]).filter(Boolean) as CategoryInfo[];
  const pitching = PITCHING_ORDER.map((n) => byName[n]).filter(Boolean) as CategoryInfo[];
  // Any categories not in the hardcoded order (e.g. future stat changes)
  const known = new Set([...BATTING_ORDER, ...PITCHING_ORDER]);
  const rest = categories.filter((c) => !known.has(c.name));

  return (
    <div className="p-3">
      {strategy && (
        <p className="text-sm text-gray-600 mb-3 italic">{strategy}</p>
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
