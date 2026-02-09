import { useParams, Link } from "react-router-dom";
import { useArticleContent, useRecap, useArticles } from "../../api/hooks";
import ArticleContent from "./ArticleContent";
import StatsSidebar from "./StatsSidebar";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function ArticlePage() {
  const { slug, articleId } = useParams<{ slug: string; articleId: string }>();

  // Find article metadata from manifest
  const { articles } = useArticles(slug!);
  const article = articles.find((a) => a.id === articleId);

  // Fetch markdown content
  const { content, loading: contentLoading } = useArticleContent(article?.file ?? null);

  // Fetch contextual stats for sidebar
  const { data: recap, loading: recapLoading } = useRecap(
    slug!,
    article?.week,
    article?.season
  );

  if (contentLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Back link */}
      <Link
        to={`/${slug}`}
        className="mb-4 inline-block text-sm text-gray-500 no-underline hover:text-gray-700"
      >
        &larr; Back to {slug}
      </Link>

      {article ? (
        <>
          <h1 className="mb-1 text-2xl font-bold">{article.title}</h1>
          <p className="mb-6 text-sm text-gray-500">
            {article.date} &middot; {article.season} Season, Week {article.week}
          </p>
        </>
      ) : (
        <ErrorBanner message={`Article "${articleId}" not found.`} />
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Article content */}
        <div className="min-w-0 flex-1">
          {content ? (
            <ArticleContent content={content} />
          ) : (
            !contentLoading && <p className="text-sm text-gray-400">No content available.</p>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {recapLoading && <LoadingSpinner />}
            {recap && <StatsSidebar recap={recap} />}
          </div>
        </div>
      </div>
    </div>
  );
}
