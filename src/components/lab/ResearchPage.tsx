import { useArticles } from "../../api/hooks";
import ArticleCard from "../shared/ArticleCard";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function ResearchPage() {
  const { data: articles, loading, error } = useArticles("lab");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  if (articles.length === 0) {
    return <p className="text-sm text-gray-400">No research articles yet.</p>;
  }

  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((a) => (
        <ArticleCard key={a.id} article={a} slug="lab" basePath="/lab/research" />
      ))}
    </div>
  );
}
