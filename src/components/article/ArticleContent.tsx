import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import { API_URL } from "../../api/client";
import { usePlayers } from "../../api/hooks";
import { leagueBySlug } from "../../utils/league-config";
import PlayerChip from "../shared/PlayerChip";
import { extractPlayerUids, remarkPlayerDirective } from "./remark-player-directive";

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
  // Numbered heading (e.g. "## 1. Team Name") → "## 1. [logo] Team Name"
  // Unnumbered heading → "## [logo] Team Name"
  return md.replace(
    /(^#{1,6}\s+)(\d+\.\s+)?(.+)\n\n?(!\[[^\]]*\]\(assets\/logo-[^)]+\))\n/gm,
    (_, hashes, num, title, logo) =>
      num ? `${hashes}${num}${logo} ${title}\n` : `${hashes}${logo} ${title}\n`
  );
}

export default function ArticleContent({ content, slug }: ArticleContentProps) {
  const processed = mergeLogosIntoHeadings(content);

  const sport = leagueBySlug(slug)?.sportCode ?? "";
  // Extract uids from `processed` (what ReactMarkdown actually parses), not
  // raw `content` — mergeLogosIntoHeadings can shift character offsets, and
  // remarkPlayerDirective below reconstructs reverted (non-player) directive
  // text via position offsets into whatever string was parsed.
  const uids = useMemo(() => extractPlayerUids(processed), [processed]);
  const refs = useMemo(
    () => uids.map((uid) => ({ type: "uid" as const, value: uid })),
    [uids],
  );
  const { data: players } = usePlayers(sport, refs);
  // Gate the directive parser on chip presence: with no :player directives,
  // remarkPlugins is exactly the pre-directive legacy list ([remarkGfm]), so
  // the entire back-catalog of articles renders byte-for-byte as before.
  //
  // remarkPlayerDirective(processed) is called ourselves — not placed
  // pre-invoked directly as a plugins-array entry. unified calls a `.use()`
  // array entry once at freeze time with no tree argument; an
  // already-invoked transformer placed there directly fires prematurely
  // against `tree === undefined` and is never invoked again against the real
  // tree (verified empirically against unified 11.0.5 while debugging this
  // fix — see remark-player-directive.test.ts's pipeline describe block).
  // Wrapping the already-built transform in a nullary closure keeps unified's
  // two-phase attach/run contract intact: the closure is called once at
  // freeze time (returning the real transformer), which unified then invokes
  // against the actual parsed tree.
  const remarkPlugins = useMemo(() => {
    if (uids.length === 0) return [remarkGfm];
    const playerDirectiveTransform = remarkPlayerDirective(processed);
    return [remarkGfm, remarkDirective, () => playerDirectiveTransform];
  }, [uids.length, processed]);

  const components: Components & Record<string, unknown> = {
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

      return <img src={resolvedSrc} alt={alt ?? ""} onError={(e) => { e.currentTarget.style.display = "none"; }} {...props} />;
    },
    h2: ({ children }) => {
      const hasLogo = hasLogoChild(children);
      if (!hasLogo) return <h2>{children}</h2>;

      // If heading starts with "N. ", strip the prefix and store rank as data-rank.
      // The badge is rendered via CSS ::before — no span needed.
      const arr = Array.isArray(children) ? children : [children];
      const first = arr[0];
      // numMatch[0] = full "1. " prefix, numMatch[1] = digit "1"
      const numMatch = typeof first === "string" ? first.match(/^(\d+)\.\s*/) : null;

      if (!numMatch) {
        return <h2 className="article-team-heading">{children}</h2>;
      }

      const afterNum = (first as string).slice(numMatch[0].length);
      const remaining = [...(afterNum ? [afterNum] : []), ...arr.slice(1)];
      return (
        <h2 className="article-team-heading" data-rank={numMatch[1]}>
          {remaining}
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
    "player-chip": ({ uid, children }: { uid?: string; children?: ReactNode }) => {
      const resolved = uid ? players[uid] : undefined;
      // Resolved -> inline headshot chip; loading / unknown uid -> plain label.
      return resolved ? <PlayerChip player={resolved} /> : <>{children}</>;
    },
  };

  return (
    <div className="article-content prose prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-ink-soft prose-a:text-accent prose-img:rounded-sm [&>p:first-of-type]:font-display [&>p:first-of-type]:text-lg [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:text-ink">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
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
