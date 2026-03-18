import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import SportLayout from "./components/sport/SportLayout";
import SportPage from "./components/sport/SportPage";
import ArticlesPage from "./components/sport/ArticlesPage";
import LabLayout from "./components/lab/LabLayout";
import LoadingSpinner from "./components/shared/LoadingSpinner";

const ArticlePage = lazy(() => import("./components/article/ArticlePage"));
const RecordsPage = lazy(() => import("./components/records/RecordsPage"));
const FranchiseDetailPage = lazy(() => import("./components/franchise/FranchiseDetailPage"));
const RankingsPage = lazy(() => import("./components/lab/rankings/RankingsPage"));
const PlayerDetailPage = lazy(() => import("./components/lab/players/PlayerDetailPage"));
const DraftPage = lazy(() => import("./components/draft/DraftPage").then(m => ({ default: m.DraftPage })));
const ResearchPage = lazy(() => import("./components/lab/ResearchPage"));
const ResearchArticlePage = lazy(() => import("./components/lab/ResearchArticlePage"));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="lab" element={<LabLayout />}>
            <Route index element={<Navigate to="rankings/mlb" replace />} />
            <Route path="rankings/:sport" element={<RankingsPage />} />
            <Route path="players/:sport/:id" element={<PlayerDetailPage />} />
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
        <Route path="lab/draft" element={<DraftPage />} />
      </Routes>
    </Suspense>
  );
}
