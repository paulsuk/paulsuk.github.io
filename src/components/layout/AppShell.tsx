import { useState } from "react";
import { Link, Outlet } from "react-router-dom";

const SITE_PASSWORD = "perge";
const AUTH_KEY = "fa_authenticated";

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authenticated) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === SITE_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthenticated(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-72 text-center">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Paul Suk</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Press on?"
          autoFocus
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {error && <p className="mt-2 text-sm text-red-600">Incorrect password</p>}
        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default function AppShell() {
  return (
    <PasswordGate>
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
    </PasswordGate>
  );
}
