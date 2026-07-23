import { Navigate, NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { legacyLabPath, leagueBySportCode } from "../../utils/league-config";
import { useLabSport } from "../../utils/use-lab-sport";

export default function LabSportLayout() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  // Called unconditionally (not after the guard below) so hook order stays
  // stable across the legacy -> resolved-slug redirect: react-router reuses
  // this component instance (same route position, no key change), so a
  // hook skipped only on the legacy render would violate Rules of Hooks.
  const { slug, sportCode } = useLabSport();

  // Legacy /lab/mlb|nba deep links land here (route ranking beats the splat redirects):
  // rewrite to the league slug, preserving the sub-path and query string.
  const legacy = leagueBySportCode(rawSlug ?? "");
  if (legacy) {
    return (
      <Navigate
        to={`${legacyLabPath(location.pathname, legacy.slug)}${location.search}`}
        replace
      />
    );
  }

  const toolTabs = [
    { to: `/lab/${slug}/rankings`, label: "Rankings" },
    { to: `/lab/${slug}/teams`, label: "Teams" },
    ...(sportCode === "mlb" ? [{ to: `/lab/${slug}/draft`, label: "Draft" }] : []),
  ];

  return (
    <div>
      <nav className="tab-bar">
        {toolTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `tab-btn font-mono no-underline ${isActive ? "tab-btn-active-tool" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
