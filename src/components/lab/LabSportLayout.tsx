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
      <nav className="flex gap-1 border-b border-gray-200 mb-6">
        {toolTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`
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
