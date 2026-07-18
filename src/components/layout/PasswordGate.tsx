import { useState } from "react";

const PASSWORD = "power overwhelming";
// Shared with the draft board's auth check — single definition of the key.
export const LAB_AUTH_KEY = "fa_auth_lab";
const STORAGE_KEY = LAB_AUTH_KEY;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (authenticated) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (normalize(input) === normalize(PASSWORD)) {
      localStorage.setItem(STORAGE_KEY, "true");
      setAuthenticated(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form onSubmit={handleSubmit} className="w-72 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">The Lab</h1>
        <p className="mb-6 text-sm italic text-ink-faint">Members only.</p>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Password"
          aria-label="Lab password"
          autoFocus
          className="w-full rounded-sm border border-rule bg-raised px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {error && <p className="mt-2 text-sm text-loss">Incorrect password</p>}
        <button type="submit" className="mt-3 w-full rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent-deep">
          Enter
        </button>
      </form>
    </div>
  );
}
