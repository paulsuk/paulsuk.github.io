import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import SportLayout from "./components/sport/SportLayout";
import SportPage from "./components/sport/SportPage";
import ArticlesPage from "./components/sport/ArticlesPage";
import LabRootLayout from "./components/lab/LabRootLayout";
import LabSportLayout from "./components/lab/LabSportLayout";
import LoadingSpinner from "./components/shared/LoadingSpinner";

const ArticlePage = lazy(() => import("./components/article/ArticlePage"));
const RecordsPage = lazy(() => import("./components/records/RecordsPage"));
const FranchiseDetailPage = lazy(() => import("./components/franchise/FranchiseDetailPage"));
const RankingsPage = lazy(() => import("./components/lab/rankings/RankingsPage"));
const PlayerDetailPage = lazy(() => import("./components/lab/players/PlayerDetailPage"));
const DraftPage = lazy(
  () => import("./components/draft/DraftPage").then((m) => ({ default: m.DraftPage }))
);
const TeamsPage = lazy(() => import("./components/lab/teams/TeamsPage"));
const ResearchPage = lazy(() => import("./components/lab/ResearchPage"));
const ResearchArticlePage = lazy(() => import("./components/lab/ResearchArticlePage"));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="lab" element={<LabRootLayout />}>
            <Route index element={<Navigate to="mlb" replace />} />
            <Route path=":sport" element={<LabSportLayout />}>
              <Route index element={<Navigate to="rankings" replace />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="players/:id" element={<PlayerDetailPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="draft" element={<DraftPage />} />
            </Route>
            <Route path="research" element={<ResearchPage />} />
            <Route path="research/:articleId" element={<ResearchArticlePage />} />
          </Route>
          <Route path=":slug" element={<SportLayout />}>
            <Route index element={<SportPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="articles" element={<ArticlesPage />} />
          </Route>
          <Route path=":slug/franchise/:franchiseId" element={<FranchiseDetailPage />} />
          <Route path=":slug/article/:articleId" element={<ArticlePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
