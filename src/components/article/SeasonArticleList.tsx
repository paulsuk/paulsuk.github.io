import { Link } from "react-router-dom";
import type { SeasonArticleListProps } from "../../api/types";

/** Season article list sidebar shared by league article + lab research pages. */
export default function SeasonArticleList({
  title,
  basePath,
  articles,
  currentId,
  variant = "league",
}: SeasonArticleListProps) {
  if (!articles.length) return null;
  const lab = variant === "lab";
  return (
    <div className={lab ? "rounded-lg border border-rule bg-raised p-4 shadow-sm" : "card-editorial"}>
      <h4
        className={
          lab
            ? "mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft"
            : "eyebrow section-rule mb-2 pt-1"
        }
      >
        {title}
      </h4>
      <div className="space-y-1">
        {articles.map((sa) => (
          <div key={sa.id} className="text-xs">
            {sa.id === currentId ? (
              <span className="font-medium text-ink">&#9654; {sa.title}</span>
            ) : (
              <Link
                to={`${basePath}/${sa.id}`}
                className={`text-ink-soft no-underline ${lab ? "hover:text-blue-600" : "hover:text-accent"}`}
              >
                &bull; {sa.title}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
