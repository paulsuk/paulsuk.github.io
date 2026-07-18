import { Link } from "react-router-dom";
import { LEAGUES } from "../../utils/league-config";
import { useDocumentTitle } from "../../utils/use-document-title";

const LEAGUE_ICONS: Record<string, string> = {
  baseball: "⚾",
  basketball: "🏀",
};

export default function HomePage() {
  useDocumentTitle();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow mb-8">{today}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        {LEAGUES.map((l) => (
          <Link
            key={l.slug}
            to={`/${l.slug}`}
            className="card-editorial group flex flex-col items-center gap-3 py-10 no-underline transition-colors hover:border-ink"
          >
            <span className="text-6xl" aria-hidden>{LEAGUE_ICONS[l.slug]}</span>
            <span className="font-display text-2xl font-black text-ink group-hover:text-accent">
              {l.label}
            </span>
            <span className="text-xs italic text-ink-faint">{l.tagline}</span>
          </Link>
        ))}
      </div>

      <a
        href="/super-chinese-checkers/"
        className="card-editorial group mt-6 flex items-center justify-between no-underline transition-colors hover:border-ink"
      >
        <div className="flex items-center gap-4">
          <span className="font-display text-4xl leading-none text-accent" aria-hidden>&#10038;</span>
          <div>
            <p className="font-display text-xl font-black text-ink group-hover:text-accent">
              Super Chinese Checkers
            </p>
            <p className="text-xs italic text-ink-faint">
              The board is a star. The rules are negotiable.
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-ink-soft">Play &rarr;</span>
      </a>

      <div className="mt-10 border-t border-rule pt-4 text-xs text-ink-faint">
        <Link to="/lab" className="text-ink-soft no-underline hover:text-accent">The Lab</Link>
        <span> &mdash; members only</span>
      </div>
    </main>
  );
}
