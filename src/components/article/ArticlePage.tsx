import { useParams, Link } from "react-router-dom";
import { useArticle, useRecap } from "../../api/hooks";
import { leagueBySlug } from "../../utils/league-config";
import { useDocumentTitle } from "../../utils/use-document-title";
import ArticleContent from "./ArticleContent";
import StatsSidebar from "./StatsSidebar";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorBanner from "../shared/ErrorBanner";
import PrevNextNav from "../shared/PrevNextNav";
import Breadcrumbs from "../layout/Breadcrumbs";

export default function ArticlePage() {
  const { slug, articleId } = useParams<{ slug: string; articleId: string }>();
  const leagueLabel = leagueBySlug(slug!)?.label ?? slug;

  // Fetch full article with navigation context
  const { data: article, loading: articleLoading } = useArticle(slug!, articleId);

  // Fetch contextual stats for sidebar
  const { data: recap, loading: recapLoading } = useRecap(
    slug!,
    article?.week ?? undefined,
    article?.season
  );

  useDocumentTitle(article?.title);

  if (articleLoading) return <LoadingSpinner />;

  if (!article) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: leagueLabel!, to: `/${slug}` },
            { label: "Articles", to: `/${slug}/articles` },
          ]}
        />
        <ErrorBanner message={`Article "${articleId}" not found.`} />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: leagueLabel!, to: `/${slug}` },
          { label: "Articles", to: `/${slug}/articles` },
          { label: article.title },
        ]}
      />

      <h1 className="mb-1 text-2xl font-bold">{article.title}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {article.date}
        {article.author && <> &middot; {article.author}</>}
        {article.week && <> &middot; {article.season} Season, Week {article.week}</>}
        {!article.week && <> &middot; {article.season} Season</>}
      </p>

      {/* Prev / Next navigation */}
      <PrevNextNav slug={slug!} prevId={article.prev_id} nextId={article.next_id} className="mb-6" />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Article content */}
        <div className="min-w-0 flex-1">
          <ArticleContent content={article.content} slug={slug!} />

          {/* Bottom prev/next */}
          <PrevNextNav
            slug={slug!}
            prevId={article.prev_id}
            nextId={article.next_id}
            className="mt-8 border-t border-gray-200 pt-4"
          />
        </div>

        {/* Stats sidebar */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              {recapLoading && <LoadingSpinner />}
              {recap && <StatsSidebar recap={recap} slug={slug!} />}
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
                          to={`/${slug}/articles/${sa.id}`}
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
