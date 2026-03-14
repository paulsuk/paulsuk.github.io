import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/lab", label: "Rankings", end: true },
  { to: "/lab/research", label: "Research", end: false },
  { to: "/lab/draft", label: "Draft", end: false },
];

export default function LabLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Analytics Lab</h1>
        <nav className="flex gap-1 border-b border-gray-200">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
