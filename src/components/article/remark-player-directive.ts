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
// hast element the components map can pick up. Unknown directive names are left
// untouched → they render as their literal text (safe no-op).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/mdast node shape; typed as any per plan to avoid an @types/mdast dep
function annotate(node: any): void {
  if (node.type === "textDirective" && node.name === "player") {
    node.data = node.data || {};
    node.data.hName = "player-chip";
    node.data.hProperties = { uid: node.attributes?.uid ?? "" };
  }
  if (Array.isArray(node.children)) node.children.forEach(annotate);
}

export function remarkPlayerDirective() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/mdast node shape; typed as any per plan to avoid an @types/mdast dep
  return (tree: any): void => annotate(tree);
}
