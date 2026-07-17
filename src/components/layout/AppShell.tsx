import { Outlet } from "react-router-dom";
import Masthead from "./Masthead";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Masthead />
      <Outlet />
    </div>
  );
}
