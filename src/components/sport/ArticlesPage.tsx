import { useParams } from "react-router-dom";
import { useArticles } from "../../api/hooks";
import type { Article } from "../../api/types";
import { formatSeason } from "../../utils/records-helpers";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import ArticleCard from "../shared/ArticleCard";

export default function ArticlesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: articles, loading, error } = useArticles(slug!);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  if (articles.length === 0) {
    return <p className="text-sm text-gray-400">No articles yet.</p>;
  }

  // Group by season, sort seasons newest first, articles within each season newest first
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const byYear = sorted.reduce<Record<number, Article[]>>((acc, a) => {
    (acc[a.season] ??= []).push(a);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {formatSeason(year, slug!)} Season
          </h3>
          <div className="space-y-1.5">
            {byYear[year].map((a) => (
              <ArticleCard key={a.id} article={a} slug={slug!} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
