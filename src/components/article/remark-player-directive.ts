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
