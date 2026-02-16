import { useParams, Link } from "react-router-dom";
import { useArticle, useRecap } from "../../api/hooks";
import ArticleContent from "./ArticleContent";
import StatsSidebar from "./StatsSidebar";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function ArticlePage() {
  const { slug, articleId } = useParams<{ slug: string; articleId: string }>();

  // Fetch full article with navigation context
  const { article, loading: articleLoading } = useArticle(slug!, articleId);

  // Fetch contextual stats for sidebar
  const { data: recap, loading: recapLoading } = useRecap(
    slug!,
    article?.week ?? undefined,
    article?.season
  );

  if (articleLoading) return <LoadingSpinner />;

  if (!article) {
    return (
      <div>
        <Link
          to={`/${slug}`}
          className="mb-4 inline-block text-sm text-gray-500 no-underline hover:text-gray-700"
        >
          &larr; Back to {slug}
        </Link>
        <ErrorBanner message={`Article "${articleId}" not found.`} />
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to={`/${slug}`}
        className="mb-4 inline-block text-sm text-gray-500 no-underline hover:text-gray-700"
      >
        &larr; Back to {slug}
      </Link>

      <h1 className="mb-1 text-2xl font-bold">{article.title}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {article.date}
        {article.author && <> &middot; {article.author}</>}
        {article.week && <> &middot; {article.season} Season, Week {article.week}</>}
        {!article.week && <> &middot; {article.season} Season</>}
      </p>

      {/* Prev / Next navigation */}
      <div className="mb-6 flex items-center justify-between text-sm">
        {article.prev_id ? (
          <Link
            to={`/${slug}/article/${article.prev_id}`}
            className="text-blue-600 no-underline hover:text-blue-800"
          >
            &larr; Previous
          </Link>
        ) : (
          <span />
        )}
        {article.next_id ? (
          <Link
            to={`/${slug}/article/${article.next_id}`}
            className="text-blue-600 no-underline hover:text-blue-800"
          >
            Next &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Article content */}
        <div className="min-w-0 flex-1">
          <ArticleContent content={article.content} slug={slug!} />

          {/* Bottom prev/next */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
            {article.prev_id ? (
              <Link
                to={`/${slug}/article/${article.prev_id}`}
                className="text-blue-600 no-underline hover:text-blue-800"
              >
                &larr; Previous
              </Link>
            ) : (
              <span />
            )}
            {article.next_id ? (
              <Link
                to={`/${slug}/article/${article.next_id}`}
                className="text-blue-600 no-underline hover:text-blue-800"
              >
                Next &rarr;
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              {recapLoading && <LoadingSpinner />}
              {recap && <StatsSidebar recap={recap} />}
            </div>

            {/* Season article list */}
            {article.season_articles.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Articles
                </h4>
                <div className="space-y-1">
                  {article.season_articles.map((sa) => (
                    <div key={sa.id} className="text-xs">
                      {sa.id === article.id ? (
                        <span className="font-medium text-gray-800">
                          &#9654; {sa.title}
                        </span>
                      ) : (
                        <Link
                          to={`/${slug}/article/${sa.id}`}
                          className="text-gray-600 no-underline hover:text-blue-600"
                        >
                          &bull; {sa.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
