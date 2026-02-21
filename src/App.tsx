import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import SportLayout from "./components/sport/SportLayout";
import SportPage from "./components/sport/SportPage";
import ArticlesPage from "./components/sport/ArticlesPage";
import ArticlePage from "./components/article/ArticlePage";
import RecordsPage from "./components/records/RecordsPage";
import FranchiseDetailPage from "./components/franchise/FranchiseDetailPage";
import LabPage from "./components/lab/LabPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="lab" element={<LabPage />} />
        <Route path=":slug" element={<SportLayout />}>
          <Route index element={<SportPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="articles" element={<ArticlesPage />} />
        </Route>
        <Route path=":slug/franchise/:franchiseId" element={<FranchiseDetailPage />} />
        <Route path=":slug/article/:articleId" element={<ArticlePage />} />
      </Route>
    </Routes>
  );
}
