import { Link } from "react-router-dom";
import type { Article } from "../../api/types";

interface ArticleCardProps {
  article: Article;
  slug: string;
  basePath?: string;
}

export default function ArticleCard({ article, slug, basePath }: ArticleCardProps) {
  const to = basePath
    ? `${basePath}/${article.id}`
    : `/${slug}/articles/${article.id}`;
  return (
    <Link
      to={to}
      className="block item-card-interactive no-underline hover:border-ink"
    >
      <div className="text-sm font-medium text-ink">{article.title}</div>
      <div className="mt-0.5 text-xs text-ink-soft">
        {article.date}
        {article.author && <> &middot; {article.author}</>}
      </div>
      {article.summary && (
        <div className="mt-1 text-xs text-ink-soft line-clamp-2">
          {article.summary}
        </div>
      )}
    </Link>
  );
}
