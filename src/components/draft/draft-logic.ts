// Pure draft-session logic — no fetch, no React. Unit-tested.
import type { DraftPreload, DraftPreloadTeam, SavedDraftSession } from "../../api/types";

export const DEFAULT_ROUNDS = 24;

/** Linear (non-snake) draft order: same team sequence every round. */
export function generateDraftOrder(orderedTeams: DraftPreloadTeam[], numRounds: number) {
  const picks = [];
  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < orderedTeams.length; i++) {
      picks.push({
        pick_number: (round - 1) * orderedTeams.length + i + 1,
        team_id: orderedTeams[i].team_key,
        round,
      });
    }
  }
  return picks;
}

/**
 * Team display order: round-1 pick order when a synced draft order covers
 * every team; deterministic team_key sort otherwise (preseason).
 */
export function deriveOrderedTeams(data: DraftPreload): DraftPreloadTeam[] {
  if (data.draft_order.length > 0) {
    const round1 = data.draft_order
      .filter((p) => p.round === 1)
      .sort((a, b) => a.pick_number - b.pick_number);
    const teamMap = Object.fromEntries(data.teams.map((t) => [t.team_key, t]));
    const ordered = round1.map((p) => teamMap[p.team_key]).filter(Boolean) as DraftPreloadTeam[];
    if (ordered.length === data.teams.length) return ordered;
  }
  return [...data.teams].sort((a, b) => a.team_key.localeCompare(b.team_key));
}

/** Tolerant parse of the localStorage payload — malformed JSON reads as absent. */
export function parseSaved(raw: string | null): SavedDraftSession | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as SavedDraftSession;
  } catch {
    return null;
  }
}

/** POST body for /sessions/restore — the saved config replayed with its picks. */
export function restorePayload(saved: SavedDraftSession) {
  return { ...saved.config, picks_made: saved.picks };
}
