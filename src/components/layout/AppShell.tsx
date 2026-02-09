import { Link, Outlet } from "react-router-dom";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-gray-900 no-underline hover:text-gray-600">
            Paul Suk
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
