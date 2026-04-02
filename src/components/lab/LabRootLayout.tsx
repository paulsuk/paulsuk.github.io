import { useEffect } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import type { AppShellContext } from "../layout/AppShell";

const SPORT_TABS = [
  { to: "/lab/mlb", label: "MLB-LAB" },
  { to: "/lab/nba", label: "NBA-LAB" },
  { to: "/lab/research", label: "Research" },
];

function LabSportTabs() {
  return (
    <div className="flex items-center gap-1">
      {SPORT_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            isActive
              ? "bg-blue-50 text-blue-800 rounded px-2.5 py-0.5 font-bold font-mono text-sm"
              : "text-slate-500 font-mono text-sm hover:text-slate-800"
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function LabRootLayout() {
  const { setHeaderSlot, clearHeaderSlot, setMainClass } =
    useOutletContext<AppShellContext>();

  useEffect(() => {
    setHeaderSlot(<LabSportTabs />);
    setMainClass("");
    return () => {
      clearHeaderSlot();
      setMainClass("mx-auto max-w-4xl px-4 py-6");
    };
  }, [setHeaderSlot, clearHeaderSlot, setMainClass]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Outlet />
    </div>
  );
}
