import { Link } from "react-router-dom";

interface Crumb { label: string; to?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>›</span>}
          {c.to ? (
            <Link to={c.to} className="text-ink-soft no-underline hover:text-accent">{c.label}</Link>
          ) : (
            <span className="text-ink-faint">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
