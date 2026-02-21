import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import { API_URL } from "../../api/client";

interface ArticleContentProps {
  content: string;
  slug: string;
}

function isLogoSrc(src: string): boolean {
  return src.includes("/logo-") || src.includes("assets/logo-");
}

/**
 * Merge standalone logo paragraphs into the preceding heading.
 * Transforms:
 *   ## 1. Team Name\n\n![alt](assets/logo-...)\n
 * Into:
 *   ## ![alt](assets/logo-...) 1. Team Name\n
 */
function mergeLogosIntoHeadings(md: string): string {
  return md.replace(
    /(^#{1,6}\s+)(.+)\n\n(!\[[^\]]*\]\(assets\/logo-[^)]+\))\n/gm,
    "$1$3 $2\n"
  );
}

export default function ArticleContent({ content, slug }: ArticleContentProps) {
  const processed = mergeLogosIntoHeadings(content);

  const components: Components = {
    img: ({ src, alt, ...props }) => {
      let resolvedSrc = src ?? "";
      if (resolvedSrc.startsWith("/api/")) {
        resolvedSrc = `${API_URL}${resolvedSrc}`;
      } else if (resolvedSrc.startsWith("assets/")) {
        resolvedSrc = `${API_URL}/api/${slug}/assets/${resolvedSrc.replace("assets/", "")}`;
      }

      if (isLogoSrc(src ?? "")) {
        return (
          <img
            src={resolvedSrc}
            alt={alt ?? ""}
            className="team-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            {...props}
          />
        );
      }

      return <img src={resolvedSrc} alt={alt ?? ""} {...props} />;
    },
    h2: ({ children }) => {
      const hasLogo = hasLogoChild(children);
      return (
        <h2 className={hasLogo ? "article-team-heading" : undefined}>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const hasLogo = hasLogoChild(children);
      return (
        <h3 className={hasLogo ? "article-matchup-heading" : undefined}>
          {children}
        </h3>
      );
    },
  };

  return (
    <div className="article-content prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}

function hasLogoChild(children: ReactNode): boolean {
  if (!children) return false;
  if (!Array.isArray(children)) return false;
  return children.some(
    (c) =>
      c &&
      typeof c === "object" &&
      "props" in c &&
      c.props?.className === "team-logo"
  );
}
