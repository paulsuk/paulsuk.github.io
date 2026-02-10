export interface Franchise {
  sport: string;
  name: string;
  slug: string;
  is_default: boolean;
  seasons: Record<number, string>;
  latest_season: number;
}

export interface Season {
  league_key: string;
  season: number;
  name: string;
  is_finished: boolean;
}

export interface MatchupCategory {
  display_name: string;
  team_1_value: number | null;
  team_2_value: number | null;
  winner: 1 | 2 | null;
}

export interface MatchupSummary {
  team_1_name: string;
  team_1_manager: string;
  team_2_name: string;
  team_2_manager: string;
  cats_won_1: number;
  cats_won_2: number;
  cats_tied: number;
  winner_name: string;
  is_playoffs: boolean;
  is_consolation: boolean;
  categories: MatchupCategory[];
}

export interface PlayerAward {
  player_key: string;
  name: string;
  team_key: string;
  team_name: string;
  manager: string;
  position: string;
  z_total: number;
  stat_line: Record<string, number>;
  z_scores: Record<string, number>;
}

export interface StandingEntry {
  team_key: string;
  team_name: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  rank: number;
}

export interface TeamProfile {
  team_key: string;
  team_name: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  rank: number;
  prev_rank: number;
  streak: number;
  last_3: string[];
  cat_strengths: string[];
  cat_weaknesses: string[];
  mvp_name: string;
  mvp_z: number;
  opponent_name: string;
  h2h_record: string;
}

export interface RecapResponse {
  league_key: string;
  league_name: string;
  season: number;
  week: number;
  week_start: string;
  week_end: string;
  matchups: MatchupSummary[];
  batter_of_week: PlayerAward | null;
  pitcher_of_week: PlayerAward | null;
  player_of_week: PlayerAward | null;
  standings: StandingEntry[];
  profiles: TeamProfile[];
}

export interface ManagerSummary {
  guid: string;
  name: string;
  seasons: number[];
  wins: number;
  losses: number;
  ties: number;
  playoff_wins: number;
  playoff_losses: number;
  championships: number;
  best_finish: number | null;
  worst_finish: number | null;
}

export interface H2HRecord {
  wins: number;
  losses: number;
  ties: number;
}

export interface ManagersResponse {
  managers: ManagerSummary[];
  h2h: Record<string, Record<string, H2HRecord>>;
}

export interface StreakRecord {
  manager: string;
  streak: number;
}

export interface MatchupRecord {
  winner: string;
  loser: string;
  score: string;
  season: number;
  week: number;
}

export interface CategoryRecord {
  category: string;
  value: number;
  manager: string;
  season: number;
  week: number;
  higher_is_better: boolean;
}

export interface RecordsResponse {
  category_records: CategoryRecord[];
  streaks: {
    longest_win_streak: StreakRecord;
    longest_loss_streak: StreakRecord;
    longest_undefeated_streak: StreakRecord;
  };
  matchup_records: {
    biggest_blowout: MatchupRecord | null;
    closest_match: MatchupRecord | null;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  type: "recap" | "rankings";
  season: number;
  week: number;
  date: string;
  file: string;
}
