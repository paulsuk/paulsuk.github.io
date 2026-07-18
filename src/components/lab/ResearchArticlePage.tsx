import { useParams, Link } from "react-router-dom";
import { useArticle } from "../../api/hooks";
import ArticleContent from "../article/ArticleContent";
import SeasonArticleList from "../article/SeasonArticleList";
import PrevNextNav from "../shared/PrevNextNav";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";

export default function ResearchArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const { data: article, loading } = useArticle("lab", articleId);

  if (loading) return <LoadingSpinner />;

  if (!article) {
    return (
      <div>
        <Link
          to="/lab/research"
          className="mb-4 inline-block text-sm text-ink-soft no-underline hover:text-ink"
        >
          &larr; Back to Research
        </Link>
        <ErrorBanner message={`Article "${articleId}" not found.`} />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/lab/research"
        className="mb-4 inline-block text-sm text-ink-soft no-underline hover:text-ink"
      >
        &larr; Back to Research
      </Link>

      <h1 className="mb-1 text-2xl font-bold">{article.title}</h1>
      <p className="mb-6 text-sm text-ink-soft">
        {article.date}
        {article.author && <> &middot; {article.author}</>}
      </p>

      {/* Prev / Next navigation */}
      <PrevNextNav basePath="/lab/research" prevId={article.prev_id} nextId={article.next_id}
        className="mb-6" linkClassName="text-blue-600 no-underline hover:text-blue-800" />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <ArticleContent content={article.content} slug="lab" />

          {/* Bottom prev/next */}
          <PrevNextNav basePath="/lab/research" prevId={article.prev_id} nextId={article.next_id}
            className="mt-8 border-t border-rule pt-4"
            linkClassName="text-blue-600 no-underline hover:text-blue-800" />
        </div>

        {/* Article list sidebar */}
        {article.season_articles.length > 0 && (
          <div className="w-full shrink-0 lg:w-64">
            <div className="sticky top-6">
              <SeasonArticleList title="Research Articles" basePath="/lab/research"
                articles={article.season_articles} currentId={article.id} variant="lab" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
