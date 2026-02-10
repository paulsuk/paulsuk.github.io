import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import SportLayout from "./components/sport/SportLayout";
import SportPage from "./components/sport/SportPage";
import ArticlePage from "./components/article/ArticlePage";
import RecordsPage from "./components/records/RecordsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path=":slug" element={<SportLayout />}>
          <Route index element={<SportPage />} />
          <Route path="records" element={<RecordsPage />} />
        </Route>
        <Route path=":slug/article/:articleId" element={<ArticlePage />} />
      </Route>
    </Routes>
  );
}
