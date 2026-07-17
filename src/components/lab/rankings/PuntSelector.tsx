// web/src/components/lab/rankings/PuntSelector.tsx
interface Props {
  categories: string[];
  punted: string[];
  onChange: (punted: string[]) => void;
}

export default function PuntSelector({ categories, punted, onChange }: Props) {
  if (!categories.length) return null;

  function toggle(cat: string) {
    onChange(
      punted.includes(cat)
        ? punted.filter((c) => c !== cat)
        : [...punted, cat]
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-label text-xs">Punt:</span>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => toggle(cat)}
          className={`px-2 py-0.5 text-xs rounded border transition-colors ${
            punted.includes(cat)
              ? "bg-red-100 border-red-300 text-red-700 line-through"
              : "bg-paper border-rule text-ink-soft hover:bg-paper"
          }`}
        >
          {cat}
        </button>
      ))}
      {punted.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs text-ink-faint hover:text-ink-soft ml-1"
        >
          clear
        </button>
      )}
    </div>
  );
}
