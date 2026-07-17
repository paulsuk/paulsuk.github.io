import type { Article } from "../../api/types";
import Card from "../shared/Card";
import ArticleCard from "../shared/ArticleCard";

interface ArticleFeedProps {
  articles: Article[];
  slug: string;
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
