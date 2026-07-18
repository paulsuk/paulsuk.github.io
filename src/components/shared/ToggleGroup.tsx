import type { ToggleGroupProps } from "../../api/types";

/** Editorial two-plus-button toggle (`.toggle-group` / `.toggle-btn` primitives). */
export default function ToggleGroup<T extends string>({ value, options, onChange }: ToggleGroupProps<T>) {
  const last = options.length - 1;
  return (
    <div className="toggle-group">
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`toggle-btn ${
            value === o.value ? "toggle-btn-active" : "text-ink-soft hover:text-ink"
          }${i === 0 ? " rounded-l-md" : ""}${i === last ? " rounded-r-md" : ""}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
