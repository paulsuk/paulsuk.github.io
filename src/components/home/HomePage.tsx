import { Link } from "react-router-dom";
import { LEAGUES } from "../../utils/league-config";
import { useDocumentTitle } from "../../utils/use-document-title";

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
          <Link key={l.slug} to={`/${l.slug}`}
            className="card-editorial group block no-underline transition-colors hover:border-ink">
            <p className="eyebrow">{l.label}</p>
            <p className="mt-2 font-display text-2xl font-black leading-snug text-ink group-hover:text-accent">
              {l.tagline}
            </p>
            <p className="mt-4 text-sm font-medium text-ink-soft">Read the coverage →</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 border-t border-rule pt-4 text-xs text-ink-faint">
        <span>Also on this site: </span>
        <a href="/super-chinese-checkers/" className="text-ink-soft hover:text-accent">Super Chinese Checkers</a>
        <span> · </span>
        <Link to="/lab" className="text-ink-soft no-underline hover:text-accent">The Lab</Link>
      </div>
    </main>
  );
}
