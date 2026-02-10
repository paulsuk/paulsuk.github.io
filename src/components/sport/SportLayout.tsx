import { NavLink, Outlet, useParams } from "react-router-dom";

const NAV_ITEMS = [
  { to: "", label: "Season", end: true },
  { to: "records", label: "Records & History", end: false },
];

export default function SportLayout() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div>
      <nav className="mb-6 flex gap-1 border-b border-gray-200">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={`/${slug}/${item.to}`}
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
      <Outlet />
    </div>
  );
}
