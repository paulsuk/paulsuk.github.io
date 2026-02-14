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
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  rank: number;
  franchise_id?: string | null;
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
  franchise_id?: string | null;
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

export interface SeasonRecord {
  season: number;
  team_name: string;
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  finish: number | null;
  playoff_seed: number | null;
}

export interface ManagerSummary {
  guid: string;
  name: string;
  is_current: boolean;
  seasons: number[];
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  playoff_wins: number;
  playoff_losses: number;
  championships: number;
  regular_season_firsts: number;
  best_finish: number | null;
  worst_finish: number | null;
  season_records: SeasonRecord[];
  franchise_id?: string | null;
}

export interface H2HRecord {
  wins: number;
  losses: number;
  ties: number;
}

export interface FranchiseOwnership {
  manager: string;
  guid: string;
  from: number;
  to: number | null;
}

export interface FranchiseSummary {
  id: string;
  name: string;
  current_manager: string;
  ownership: FranchiseOwnership[];
}

export interface FranchiseSeasonRecord {
  season: number;
  team_name: string;
  manager: string;
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  finish: number | null;
  playoff_seed: number | null;
}

export interface FranchiseStats {
  id: string;
  name: string;
  current_manager: string;
  current_team_name: string;
  ownership: FranchiseOwnership[];
  seasons: number[];
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  championships: number;
  season_records: FranchiseSeasonRecord[];
}

export interface ManagersResponse {
  managers: ManagerSummary[];
  h2h: Record<string, Record<string, H2HRecord>>;
  franchises?: FranchiseSummary[];
  franchise_h2h?: Record<string, Record<string, H2HRecord>>;
  franchise_stats?: FranchiseStats[];
}

export interface StreakRecord {
  manager: string;
  team_name: string;
  streak: number;
}

export interface MatchupRecord {
  winner: string;
  loser: string;
  winner_team: string;
  loser_team: string;
  score: string;
  season: number;
  week: number;
}

export interface CategoryRecord {
  category: string;
  value: number;
  manager: string;
  team_name: string;
  season: number;
  week: number;
  higher_is_better: boolean;
  seasons_active: number[];
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

export interface PlayoffMatchup {
  team_1_name: string;
  team_1_manager: string;
  team_1_seed: number | null;
  team_2_name: string;
  team_2_manager: string;
  team_2_seed: number | null;
  cats_won_1: number;
  cats_won_2: number;
  cats_tied: number;
  winner: string | null;
  is_tied: boolean;
}

export interface PlayoffRound {
  week: number;
  matchups: PlayoffMatchup[];
  consolation: PlayoffMatchup[];
}

export interface PlayoffResponse {
  league_key: string;
  rounds: PlayoffRound[];
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

// --- Current Matchup ---

export interface CurrentMatchup {
  season: number;
  week: number;
  opponent_team_name: string;
  opponent_manager: string;
  cats_won: number;
  cats_lost: number;
  cats_tied: number;
  is_playoffs: boolean;
}

// --- Franchise Detail ---

export interface ManagerEra {
  name: string;
  guid: string;
  from: number;
  to: number | null;
  wins: number;
  losses: number;
  ties: number;
  cat_wins: number;
  cat_losses: number;
  cat_ties: number;
  championships: number;
  seasons: number[];
}

export interface FranchiseH2HEntry {
  franchise_id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
}

export interface RosterPlayer {
  full_name: string;
  primary_position: string;
  selected_position: string;
  is_starter: boolean;
  is_keeper?: boolean;
  keeper_round?: number | null;
}

export interface KeeperEntry {
  name: string;
  position: string | null;
  round_cost: number | null;
  kept_from_season: number | null;
  tenure: number | null;
}

export interface RosterCostPlayer {
  full_name: string;
  primary_position: string;
  selected_position: string;
  is_starter: boolean;
  draft_cost: number;
}

export interface SeasonKeepers {
  season: number;
  keepers: KeeperEntry[];
}

export interface TransactionCount {
  season: number;
  adds: number;
  drops: number;
}

export interface TradePlayer {
  name: string;
  source_team: string;
  dest_team: string;
}

export interface Trade {
  season: number;
  week: number | null;
  timestamp: string;
  players: TradePlayer[];
}

export interface FranchiseDetailResponse {
  overview: {
    id: string;
    name: string;
    current_manager: string;
    current_team_name: string;
    ownership: FranchiseOwnership[];
    seasons: number[];
  };
  stats: {
    wins: number;
    losses: number;
    ties: number;
    cat_wins: number;
    cat_losses: number;
    cat_ties: number;
    championships: number;
    best_finish: number | null;
    worst_finish: number | null;
  };
  season_records: FranchiseSeasonRecord[];
  manager_eras: ManagerEra[];
  h2h: FranchiseH2HEntry[];
  rosters: Record<number, RosterPlayer[]>;
  roster_costs: Record<number, RosterCostPlayer[]>;
  keepers: SeasonKeepers[];
  transactions: {
    counts: TransactionCount[];
    trades: Trade[];
  };
  current_matchup: CurrentMatchup | null;
}
