import type { RosterPlayer } from "../../api/types";

interface SeasonRosterProps {
  players: RosterPlayer[];
}

function KeeperBadge({ round }: { round?: number | null }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700">
      K{round != null ? round : ""}
    </span>
  );
}

export default function SeasonRoster({ players }: SeasonRosterProps) {
  const starters = players.filter((p) => p.is_starter);
  const bench = players.filter((p) => !p.is_starter);

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div>
        <div className="section-label">Starters</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          {starters.map((p) => (
            <div key={p.full_name} className="flex justify-between">
              <span className="text-gray-700">
                {p.full_name}
                {p.is_keeper && <KeeperBadge round={p.keeper_round} />}
              </span>
              <span className="text-gray-400">{p.selected_position}</span>
            </div>
          ))}
        </div>
      </div>
      {bench.length > 0 && (
        <div>
          <div className="section-label">Bench</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {bench.map((p) => (
              <div key={p.full_name} className="flex justify-between">
                <span className="text-gray-400">
                  {p.full_name}
                  {p.is_keeper && <KeeperBadge round={p.keeper_round} />}
                </span>
                <span className="text-gray-300">{p.selected_position}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
