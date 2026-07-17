import { NavLink, Outlet } from "react-router-dom";
import PasswordGate from "../layout/PasswordGate";

// TODO(task-10): flip to /lab/baseball|basketball
const LAB_TABS = [
  { to: "/lab/mlb", label: "BASEBALL-LAB" },
  { to: "/lab/nba", label: "BASKETBALL-LAB" },
  { to: "/lab/research", label: "RESEARCH" },
];

export default function LabRootLayout() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <PasswordGate>
        <nav className="mb-4 flex items-center gap-2">
          {LAB_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                isActive
                  ? "rounded-sm bg-ink px-2.5 py-0.5 font-mono text-sm font-bold text-paper no-underline"
                  : "px-1 font-mono text-sm text-ink-soft no-underline hover:text-ink"
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </PasswordGate>
    </main>
  );
}
