import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface ArticleContentProps {
  content: string;
  slug: string;
}

export default function ArticleContent({ content, slug }: ArticleContentProps) {
  const components: Components = {
    img: ({ src, alt, ...props }) => {
      // Rewrite /api/... paths to use the API base URL
      let resolvedSrc = src ?? "";
      if (resolvedSrc.startsWith("/api/")) {
        resolvedSrc = `${API_URL}${resolvedSrc}`;
      } else if (resolvedSrc.startsWith("assets/")) {
        // Shorthand: assets/foo → full API asset URL for this slug
        resolvedSrc = `${API_URL}/api/${slug}/assets/${resolvedSrc.replace("assets/", "")}`;
      }
      return <img src={resolvedSrc} alt={alt ?? ""} {...props} />;
    },
  };

  return (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
