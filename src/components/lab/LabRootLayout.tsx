import { NavLink, Outlet } from "react-router-dom";

const TOP_TABS = [
  { to: "/lab/mlb", label: "MLB" },
  { to: "/lab/nba", label: "NBA" },
  { to: "/lab/research", label: "Research" },
];

export default function LabRootLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Analytics Lab</h1>
        <nav className="flex gap-1 border-b border-gray-200">
          {TOP_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
