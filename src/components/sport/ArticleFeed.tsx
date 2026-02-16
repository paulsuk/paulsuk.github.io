import { Link } from "react-router-dom";
import type { Article } from "../../api/types";
import Card from "../shared/Card";

interface ArticleFeedProps {
  articles: Article[];
  slug: string;
}

function ArticleCard({ article, slug }: { article: Article; slug: string }) {
  return (
    <Link
      to={`/${slug}/article/${article.id}`}
      className="block item-card-interactive no-underline hover:border-gray-200"
    >
      <div className="text-sm font-medium text-gray-800">{article.title}</div>
      <div className="mt-0.5 text-xs text-gray-500">
        {article.date}
        {article.author && <> &middot; {article.author}</>}
      </div>
      {article.summary && (
        <div className="mt-1 text-xs text-gray-500 line-clamp-2">
          {article.summary}
        </div>
      )}
    </Link>
  );
}

export default function ArticleFeed({ articles, slug }: ArticleFeedProps) {
  if (articles.length === 0) {
    return (
      <Card title="Articles">
        <p className="text-sm text-gray-400">No articles for this season yet.</p>
      </Card>
    );
  }

  // Sort newest first
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card title="Articles">
      <div className="space-y-1.5">
        {sorted.map((a) => (
          <ArticleCard key={a.id} article={a} slug={slug} />
        ))}
      </div>
    </Card>
  );
}
