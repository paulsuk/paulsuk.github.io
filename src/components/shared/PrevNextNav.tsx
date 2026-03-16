import { Link } from "react-router-dom";

interface PrevNextNavProps {
  slug: string;
  prevId: string | null;
  nextId: string | null;
  className?: string;
}

/**
 * Previous / Next article navigation links.
 * Renders two Link elements (or empty spans) flanking a flex container.
 */
export default function PrevNextNav({ slug, prevId, nextId, className }: PrevNextNavProps) {
  return (
    <div className={`flex items-center justify-between text-sm${className ? ` ${className}` : ""}`}>
      {prevId ? (
        <Link
          to={`/${slug}/article/${prevId}`}
          className="text-blue-600 no-underline hover:text-blue-800"
        >
          &larr; Previous
        </Link>
      ) : (
        <span />
      )}
      {nextId ? (
        <Link
          to={`/${slug}/article/${nextId}`}
          className="text-blue-600 no-underline hover:text-blue-800"
        >
          Next &rarr;
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
