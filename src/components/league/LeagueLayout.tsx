import { NavLink, Outlet, useParams } from "react-router-dom";
import { SportProvider } from "../../context/SportContext";
import { leagueBySlug } from "../../utils/league-config";
import { useDocumentTitle } from "../../utils/use-document-title";
import ErrorBanner from "../shared/ErrorBanner";

const SECTIONS = [
  { to: "", label: "This Week", end: true },
  { to: "matchups", label: "Matchups", end: false },
  { to: "standings", label: "Standings", end: false },
  { to: "articles", label: "Articles", end: false },
  { to: "history", label: "History", end: false },
];

export default function LeagueLayout() {
  const { slug } = useParams<{ slug: string }>();
  const league = leagueBySlug(slug ?? "");
  useDocumentTitle(league?.label);

  if (!league) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ErrorBanner message={`No league at "/${slug}".`} />
      </main>
    );
  }

  return (
    <SportProvider slug={league.slug}>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-1 flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-black tracking-tight">{league.label}</h1>
          <p className="hidden text-xs italic text-ink-faint sm:block">{league.tagline}</p>
        </div>
        <nav className="mb-6 flex gap-5 border-b-2 border-ink">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.label}
              to={s.to ? `/${league.slug}/${s.to}` : `/${league.slug}`}
              end={s.end}
              className={({ isActive }) =>
                `-mb-0.5 border-b-2 pb-2 text-sm font-medium no-underline transition-colors ${
                  isActive ? "border-accent font-semibold text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </main>
    </SportProvider>
  );
}
