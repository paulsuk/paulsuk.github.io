import { NavLink, Outlet, useParams } from "react-router-dom";

export default function LabSportLayout() {
  const { sport = "mlb" } = useParams<{ sport: string }>();

  const toolTabs = [
    { to: `/lab/${sport}/rankings`, label: "Rankings" },
    { to: `/lab/${sport}/teams`, label: "Teams" },
    ...(sport === "mlb" ? [{ to: `/lab/${sport}/draft`, label: "Draft" }] : []),
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
