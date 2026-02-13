import type { PlayoffRound, PlayoffMatchup } from "../../api/types";
import Card from "../shared/Card";

interface PlayoffBracketProps {
  rounds: PlayoffRound[];
  totalRounds: number;
}

export default function PlayoffBracket({ rounds, totalRounds }: PlayoffBracketProps) {
  if (rounds.length === 0) return null;

  return (
    <Card title="Playoff Bracket">
      <div className="space-y-6">
        {rounds.map((round, i) => {
          const roundLabel = getRoundLabel(i, totalRounds);
          return (
            <div key={round.week}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {roundLabel} — Week {round.week}
              </h4>
              <div className="space-y-2">
                {round.matchups.map((m, j) => (
                  <MatchupCard key={j} matchup={m} />
                ))}
              </div>
              {round.consolation.length > 0 && (
                <div className="mt-3">
                  <h5 className="mb-1 text-xs text-gray-400">Consolation</h5>
                  <div className="space-y-2">
                    {round.consolation.map((m, j) => (
                      <MatchupCard key={j} matchup={m} muted />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MatchupCard({ matchup: m, muted = false }: { matchup: PlayoffMatchup; muted?: boolean }) {
  const t1Won = m.winner === m.team_1_name;
  const t2Won = m.winner === m.team_2_name;

  return (
    <div className={`rounded border ${muted ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white"} text-sm`}>
      <TeamRow
        name={m.team_1_name}
        manager={m.team_1_manager}
        seed={m.team_1_seed}
        score={m.cats_won_1}
        isWinner={t1Won}
        muted={muted}
      />
      <div className="border-t border-gray-100" />
      <TeamRow
        name={m.team_2_name}
        manager={m.team_2_manager}
        seed={m.team_2_seed}
        score={m.cats_won_2}
        isWinner={t2Won}
        muted={muted}
      />
    </div>
  );
}

function TeamRow({
  name,
  manager,
  seed,
  score,
  isWinner,
  muted,
}: {
  name: string;
  manager: string;
  seed: number | null;
  score: number;
  isWinner: boolean;
  muted: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 ${isWinner && !muted ? "font-semibold" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        {seed != null && (
          <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">{seed}</span>
        )}
        <span className={`truncate ${isWinner ? "text-gray-900" : "text-gray-500"}`}>
          {name}
        </span>
        <span className="text-xs text-gray-400 truncate hidden sm:inline">({manager})</span>
      </div>
      <span className={`tabular-nums flex-shrink-0 ${isWinner ? "text-gray-900" : "text-gray-400"}`}>
        {score}
      </span>
    </div>
  );
}

function getRoundLabel(roundIndex: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundIndex;
  if (roundsFromEnd === 1) return "Finals";
  if (roundsFromEnd === 2) return "Semifinals";
  if (roundsFromEnd === 3) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}
