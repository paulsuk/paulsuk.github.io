import type { SetupScreenProps } from "../../api/types";

/** Pre-draft setup: league summary, team picker, start button. */
export function SetupScreen({
  preload,
  preloadLoading,
  preloadError,
  sessionError,
  orderedTeams,
  myTeamKey,
  onSelectTeam,
  onStart,
  starting,
}: SetupScreenProps) {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Draft Board</h1>

      {sessionError && <div className="bg-loss/10 text-loss p-3 rounded mb-4 text-sm">{sessionError}</div>}
      {preloadLoading && <p className="text-ink-soft text-sm">Loading league data...</p>}
      {preloadError && (
        <div className="bg-loss/10 text-loss p-3 rounded mb-4 text-sm">
          <p className="font-medium">Could not load league data</p>
          <p>{preloadError}</p>
          <p className="mt-1 text-xs">Ensure 2026 is synced: <code>python main.py sync baseball</code></p>
        </div>
      )}

      {preload && (
        <div className="space-y-6">
          <p className="text-sm text-ink-soft">
            {preload.season} · {preload.num_teams} teams · {preload.num_rounds} rounds
            {preload.keepers.length > 0 && ` · ${preload.keepers.length} keepers`}
          </p>

          <div>
            <label className="block text-sm font-semibold mb-2">Select your team</label>
            <div className="space-y-1">
              {orderedTeams.map((t, idx) => (
                <div
                  key={t.team_key}
                  onClick={() => onSelectTeam(t.team_key)}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    myTeamKey === t.team_key
                      ? "border-tool bg-tool-soft"
                      : "border-rule hover:border-ink-faint"
                  }`}
                >
                  <span className="text-ink-faint text-sm w-5 text-right shrink-0">{idx + 1}</span>
                  <span className="flex-1 text-sm font-medium">{t.name}</span>
                  {t.manager_name && (
                    <span className="text-xs text-ink-soft">{t.manager_name}</span>
                  )}
                  {myTeamKey === t.team_key && (
                    <span className="text-xs text-tool font-semibold">me</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            disabled={starting || !myTeamKey}
            className="w-full py-3 bg-ink text-paper rounded hover:bg-ink/90 disabled:opacity-50 font-medium"
          >
            {starting ? "Starting..." : "Start Draft"}
          </button>
        </div>
      )}
    </div>
  );
}
