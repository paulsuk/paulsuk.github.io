import { NavLink, Outlet } from "react-router-dom";
import PasswordGate from "../layout/PasswordGate";

const LAB_TABS = [
  { to: "/lab/baseball", label: "BASEBALL-LAB" },
  { to: "/lab/basketball", label: "BASKETBALL-LAB" },
  { to: "/lab/research", label: "RESEARCH" },
];

export default function LabRootLayout() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <PasswordGate>
        <nav className="tab-bar">
          {LAB_TABS.map((tab) => (
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
      </PasswordGate>
    </main>
  );
}
