import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./components/home/HomePage";
import SportPage from "./components/sport/SportPage";
import ArticlePage from "./components/article/ArticlePage";
import RecordsPage from "./components/records/RecordsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path=":slug" element={<SportPage />} />
        <Route path=":slug/article/:articleId" element={<ArticlePage />} />
        <Route path=":slug/records" element={<RecordsPage />} />
      </Route>
    </Routes>
  );
}
