import { useParams } from "react-router-dom";

export default function ArticlePage() {
  const { slug, articleId } = useParams<{ slug: string; articleId: string }>();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Article: {articleId}</h1>
      <p className="text-gray-500">Article view for {slug} coming soon.</p>
    </div>
  );
}
