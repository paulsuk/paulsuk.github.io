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

export function TeamProfile({ categories, strategy }: Props) {
  const maxRank = 10;

  return (
    <div className="p-3">
      {strategy && (
        <p className="text-sm text-gray-600 mb-3 italic">{strategy}</p>
      )}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
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
        ))}
      </div>
    </div>
  );
}
