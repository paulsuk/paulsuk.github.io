import { Link } from "react-router-dom";
import type { Article } from "../../api/types";
import Card from "../shared/Card";

interface ArticleFeedProps {
  articles: Article[];
  slug: string;
}

function ArticleCard({ article, slug }: { article: Article; slug: string }) {
  const typeColors: Record<string, string> = {
    recap: "bg-blue-100 text-blue-700",
    rankings: "bg-amber-100 text-amber-700",
  };

  return (
    <Link
      to={`/${slug}/article/${article.id}`}
      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 no-underline transition-colors hover:border-gray-200 hover:bg-gray-100"
    >
      <div className="flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${typeColors[article.type] ?? "bg-gray-100 text-gray-600"}`}>
          {article.type}
        </span>
        <span className="text-sm font-medium text-gray-800">{article.title}</span>
      </div>
      <span className="text-xs text-gray-400">{article.date}</span>
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
