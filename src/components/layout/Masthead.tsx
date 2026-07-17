import { Link, NavLink } from "react-router-dom";
import { LEAGUES } from "../../utils/league-config";

export default function Masthead() {
  return (
    <header className="border-b-2 border-ink bg-raised">
      <div className="mx-auto max-w-5xl px-4 pb-0 pt-5">
        <div className="flex items-end justify-between">
          <Link to="/" className="no-underline">
            <span className="font-display text-3xl font-black tracking-tight text-ink">
              Paul Suk
            </span>
            <span className="ml-3 hidden text-xs italic text-ink-faint sm:inline">
              Fantasy sports, taken slightly too seriously.
            </span>
          </Link>
        </div>
        <nav className="mt-3 flex gap-6">
          {LEAGUES.map((l) => (
            <NavLink
              key={l.slug}
              to={`/${l.slug}`}
              className={({ isActive }) =>
                `-mb-0.5 border-b-[3px] pb-2 text-sm font-semibold uppercase tracking-[0.08em] no-underline transition-colors ${
                  isActive ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/lab"
            className={({ isActive }) =>
              `-mb-0.5 ml-auto border-b-[3px] pb-2 font-mono text-sm font-semibold no-underline transition-colors ${
                isActive ? "border-accent text-ink" : "border-transparent text-ink-faint hover:text-ink"
              }`
            }
          >
            The Lab
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
