import { Link } from "react-router-dom";
import { LEAGUES } from "../../utils/league-config";
import { useDocumentTitle } from "../../utils/use-document-title";
import LeagueHeroCard from "./LeagueHeroCard";

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
          <LeagueHeroCard key={l.slug} league={l} />
        ))}
      </div>

      <div className="mt-10 border-t border-rule pt-4 text-xs text-ink-faint">
        <a
          href="https://paulsuk.github.io/super-chinese-checkers/"
          className="text-ink-soft no-underline hover:text-accent"
        >
          Super Chinese Checkers
        </a>
        <span> &middot; </span>
        <Link to="/lab" className="text-ink-soft no-underline hover:text-accent">The Lab</Link>
        <span> &mdash; members only</span>
      </div>
    </main>
  );
}
