import { Link } from "react-router-dom";
import type { PrevNextNavProps } from "../../api/types";

/**
 * Previous / Next navigation links over a base path (league articles, lab
 * research). Renders two Link elements (or empty spans) flanking a flex row.
 */
export default function PrevNextNav({
  basePath,
  prevId,
  nextId,
  className,
  linkClassName = "text-accent no-underline hover:text-accent-deep",
}: PrevNextNavProps) {
  return (
    <div className={`flex items-center justify-between text-sm${className ? ` ${className}` : ""}`}>
      {prevId ? (
        <Link to={`${basePath}/${prevId}`} className={linkClassName}>
          &larr; Previous
        </Link>
      ) : (
        <span />
      )}
      {nextId ? (
        <Link to={`${basePath}/${nextId}`} className={linkClassName}>
          Next &rarr;
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
