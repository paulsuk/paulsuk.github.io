import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const SITE_AUTH: Record<string, { password: string; prompt: string }> = {
  baseball: { password: "blue jays", prompt: 'Let me root, root, root, for the ____ ____!' },
  basketball: { password: "perge", prompt: "Press on?" },
  lab: { password: "power overwhelming", prompt: "" },
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function PasswordGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const segment = location.pathname.split("/").filter(Boolean)[0] ?? "";
  const auth = SITE_AUTH[segment];
  const storageKey = auth ? `fa_auth_${segment}` : "";

  const [authenticated, setAuthenticated] = useState(
    () => !storageKey || localStorage.getItem(storageKey) === "true"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  // Re-check auth when navigating between sports
  useEffect(() => {
    if (!storageKey) {
      setAuthenticated(true);
    } else {
      setAuthenticated(localStorage.getItem(storageKey) === "true");
    }
    setInput("");
    setError(false);
  }, [storageKey]);

  if (authenticated) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (normalize(input) === normalize(auth.password)) {
      localStorage.setItem(storageKey, "true");
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
          placeholder={auth.prompt || "Password"}
          aria-label="Site password"
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
