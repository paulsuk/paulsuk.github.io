import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import LeagueLayout from "./components/league/LeagueLayout";
import LabRootLayout from "./components/lab/LabRootLayout";
import LabSportLayout from "./components/lab/LabSportLayout";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import {
  LegacyArticleRedirect,
  LegacyFranchiseRedirect,
  LegacyRecordsRedirect,
} from "./components/league/legacy-redirects";

const LeagueHubPage = lazy(() => import("./components/league/LeagueHubPage"));
const MatchupsPage = lazy(() => import("./components/league/MatchupsPage"));
const StandingsPage = lazy(() => import("./components/league/StandingsPage"));
const ArticlesPage = lazy(() => import("./components/league/ArticlesPage"));
const ArticlePage = lazy(() => import("./components/article/ArticlePage"));
const HistoryPage = lazy(() => import("./components/records/HistoryPage"));
const FranchiseDetailPage = lazy(() => import("./components/franchise/FranchiseDetailPage"));
const RankingsPage = lazy(() => import("./components/lab/rankings/RankingsPage"));
const PlayerDetailPage = lazy(() => import("./components/lab/players/PlayerDetailPage"));
const DraftPage = lazy(() =>
  import("./components/draft/DraftPage").then((m) => ({ default: m.DraftPage }))
);
const TeamsPage = lazy(() => import("./components/lab/teams/TeamsPage"));
const TeamDetailPage = lazy(() => import("./components/lab/teams/TeamDetailPage"));
const ResearchPage = lazy(() => import("./components/lab/ResearchPage"));
const ResearchArticlePage = lazy(() => import("./components/lab/ResearchArticlePage"));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />

          <Route path="lab" element={<LabRootLayout />}>
            {/* Lab keeps the :sport (mlb/nba) param until Task 10 renames it to :slug —
                renaming here would break /lab/nba mid-plan (pages still read `sport`). */}
            <Route index element={<Navigate to="mlb" replace />} />
            <Route path=":sport" element={<LabSportLayout />}>
              <Route index element={<Navigate to="rankings" replace />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="players/:id" element={<PlayerDetailPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="teams/:teamId" element={<TeamDetailPage />} />
              <Route path="draft" element={<DraftPage />} />
            </Route>
            <Route path="research" element={<ResearchPage />} />
            <Route path="research/:articleId" element={<ResearchArticlePage />} />
          </Route>

          <Route path=":slug" element={<LeagueLayout />}>
            <Route index element={<LeagueHubPage />} />
            <Route path="matchups" element={<MatchupsPage />} />
            <Route path="standings" element={<StandingsPage />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="articles/:articleId" element={<ArticlePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="history/franchise/:franchiseId" element={<FranchiseDetailPage />} />
            {/* legacy URLs */}
            <Route path="records" element={<LegacyRecordsRedirect />} />
            <Route path="article/:articleId" element={<LegacyArticleRedirect />} />
            <Route path="franchise/:franchiseId" element={<LegacyFranchiseRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
