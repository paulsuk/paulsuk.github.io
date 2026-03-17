// TODO(Task 10): this component will be deleted — local stub until then
interface LabPlayer { player_id: string | number; name: string; value: number; rank: number; team?: string; [key: string]: unknown; }

// Expected roster spots per position (12-team league defaults)
const MLB_ROSTER_SPOTS: Record<string, number> = {
  SP: 18, RP: 12, C: 12, "1B": 12, "2B": 12, "3B": 12, SS: 12,
  OF: 36, DH: 6,
};

const NBA_ROSTER_SPOTS: Record<string, number> = {
  PG: 12, SG: 12, SF: 12, PF: 12, C: 12,
};

function getPosCol(player: LabPlayer): string | null {
  for (const col of ["Pos", "pos", "position", "Position"]) {
    if (col in player && player[col]) return col;
  }
  return null;
}

function primaryPos(rawPos: string): string {
  return rawPos.split(/[/,]/)[0].trim().toUpperCase();
}

export default function ReplacementPanel({
  players,
  sport,
}: {
  players: LabPlayer[];
  sport: string;
}) {
  const posCol = players.length ? getPosCol(players[0]) : null;

  if (!posCol) {
    // No position data — show value-based cutoffs instead
    const cutoffs = [50, 100, 150, 200, 250];
    return (
      <div>
        <p className="mb-4 text-label">
          No position column in this dataset. Showing overall replacement thresholds.
        </p>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header px-3 py-2">Rank cutoff</th>
                <th className="table-header px-3 py-2">Replacement player</th>
                <th className="table-header px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cutoffs.map((n) => {
                const p = players[n - 1];
                if (!p) return null;
                return (
                  <tr key={n}>
                    <td className="px-3 py-2 text-gray-500 tabular-nums">#{n}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                    <td className="px-3 py-2 stat-value text-blue-700">
                      {p.value.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const rosterSpots = sport === "nba" ? NBA_ROSTER_SPOTS : MLB_ROSTER_SPOTS;

  // Group players by primary position
  const byPos: Record<string, LabPlayer[]> = {};
  for (const p of players) {
    const pos = primaryPos(String(p[posCol] ?? ""));
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(p);
  }

  const posOrder = Object.keys(rosterSpots).filter((pos) => byPos[pos]?.length);

  return (
    <div>
      <p className="mb-4 text-label">
        Replacement level = the (N+1)th player at each position, where N = expected
        roster spots in a 12-team league.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header px-3 py-2">Position</th>
              <th className="table-header px-3 py-2">Replacement player</th>
              <th className="table-header px-3 py-2">Overall rank</th>
              <th className="table-header px-3 py-2">Repl. value</th>
              <th className="table-header px-3 py-2">Best available</th>
              <th className="table-header px-3 py-2">VAR (vs #1)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posOrder.map((pos) => {
              const group = byPos[pos];
              const spots = rosterSpots[pos] ?? 12;
              const replIdx = spots; // 0-indexed: spot N = index N
              const repl = group[replIdx] ?? group[group.length - 1];
              const best = group[0];
              const var_ = best ? best.value - (repl?.value ?? 0) : null;

              return (
                <tr key={pos}>
                  <td className="px-3 py-2 font-semibold text-gray-700">{pos}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {repl?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-400 tabular-nums">
                    {repl?.rank ?? "—"}
                  </td>
                  <td className="px-3 py-2 stat-value text-gray-600">
                    {repl ? repl.value.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {best?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 stat-value text-blue-700">
                    {var_ !== null ? var_.toFixed(2) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
