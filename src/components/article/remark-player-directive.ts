import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";

// :player[Label]{uid="sport:id"} — quoted-attribute form is the contract (see
// the Phase 3b spec). extractPlayerUids pre-scans the raw markdown so the whole
// article's chips resolve in ONE usePlayers batch (no per-chip fetch waterfall).
const PLAYER_DIRECTIVE_RE = /:player\[[^\]]*\]\{[^}]*\buid="([^"]+)"[^}]*\}/g;

export function extractPlayerUids(content: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of content.matchAll(PLAYER_DIRECTIVE_RE)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }
  return out;
}

// remark-directive parses :player[Label]{uid="..."} into a `textDirective` node
// (name "player", attributes {uid}, children = the [Label] text). react-markdown
// won't render an unknown directive node, so map it to a <player-chip uid="...">
// hast element the components map can pick up.
//
// remark-directive's micromark extension recognizes ANY bare `:word` as a
// directive node, not just our `:player[...]{...}` form — ordinary prose like
// "3:1", "3:05pm", "K:BB", "5:30" parses as a spurious textDirective /
// leafDirective / containerDirective. mdast-util-to-hast has no handler for an
// unannotated directive node, so it falls through to its "unknown node"
// handling, which drops the node's own text and emits an empty <div> in its
// place. Any directive we don't recognize must be reverted to its literal
// source text (via mdast position offsets) before it reaches remark-rehype.
const DIRECTIVE_TYPES = new Set(["textDirective", "leafDirective", "containerDirective"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/mdast node shape; typed as any per plan to avoid an @types/mdast dep
function annotate(node: any, source: string): void {
  if (node.type === "textDirective" && node.name === "player") {
    node.data = node.data || {};
    node.data.hName = "player-chip";
    node.data.hProperties = { uid: node.attributes?.uid ?? "" };
  } else if (DIRECTIVE_TYPES.has(node.type)) {
    // Spurious directive from a prose colon (times "3:05pm", ratios "3:1",
    // "K:BB"). remark-directive parsed it; revert it to the literal source so
    // mdast-util-to-hast doesn't drop the text and inject an empty <div>.
    const start = node.position?.start?.offset;
    const end = node.position?.end?.offset;
    if (typeof start === "number" && typeof end === "number") {
      node.type = "text";
      node.value = source.slice(start, end);
      delete node.children;
      delete node.data;
      delete node.attributes;
      return;
    }
  }
  if (Array.isArray(node.children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/mdast node shape; typed as any per plan to avoid an @types/mdast dep
    node.children.forEach((c: any) => annotate(c, source));
  }
}

export function remarkPlayerDirective(source: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/mdast node shape; typed as any per plan to avoid an @types/mdast dep
  return (tree: any): void => annotate(tree, source);
}

// The remarkPlugins list ArticleContent hands to react-markdown. With no
// :player directives this is exactly the pre-directive legacy list
// ([remarkGfm]), so the entire back-catalog of articles renders byte-for-byte
// as before.
//
// remarkPlayerDirective(source) is called ourselves — not placed pre-invoked
// directly as a plugins-array entry. unified calls a `.use()` array entry once
// at freeze time with no tree argument; an already-invoked transformer placed
// there directly fires prematurely against `tree === undefined` and is never
// invoked again against the real tree (verified empirically against unified
// 11.0.5 while debugging this fix — see remark-player-directive.test.ts's
// buildRemarkPlugins describe block, which locks this wiring through a real
// pipeline). Wrapping the already-built transform in a nullary closure keeps
// unified's two-phase attach/run contract intact: the closure is called once
// at freeze time (returning the real transformer), which unified then invokes
// against the actual parsed tree.
//
// `source` must be the exact string the caller parses (ArticleContent's
// `processed`, post-mergeLogosIntoHeadings): the transform reverts spurious
// non-player directives to literal text by slicing `source` at mdast position
// offsets, so any mismatch mis-slices the reverted text.
export function buildRemarkPlugins(uids: string[], source: string) {
  if (uids.length === 0) return [remarkGfm];
  const playerDirectiveTransform = remarkPlayerDirective(source);
  return [remarkGfm, remarkDirective, () => playerDirectiveTransform];
}
