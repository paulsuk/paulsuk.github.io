import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import { extractPlayerUids, remarkPlayerDirective } from "./remark-player-directive";

describe("extractPlayerUids", () => {
  it("pulls uids from :player directives, in order", () => {
    const md =
      'Hot week for :player[Aaron Judge]{uid="mlb:592450"} and ' +
      ':player[Kyle Tucker]{uid="mlb:663656"}.';
    expect(extractPlayerUids(md)).toEqual(["mlb:592450", "mlb:663656"]);
  });

  it("dedupes repeated uids", () => {
    const md = ':player[A]{uid="mlb:1"} then again :player[A]{uid="mlb:1"}';
    expect(extractPlayerUids(md)).toEqual(["mlb:1"]);
  });

  it("returns [] for legacy prose with colons but no directives", () => {
    const md = "Final: 6-4. First pitch 5:30. K:BB ratio held up.";
    expect(extractPlayerUids(md)).toEqual([]);
  });

  it("returns [] for empty content", () => {
    expect(extractPlayerUids("")).toEqual([]);
  });
});

describe("remarkPlayerDirective", () => {
  it("annotates a player textDirective with hName/hProperties", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "textDirective",
          name: "player",
          attributes: { uid: "mlb:1" },
          children: [{ type: "text", value: "A" }],
        },
      ],
    };
    remarkPlayerDirective("")(tree);
    // Inline assertion type to read back the `data` the transform attaches —
    // anonymous, not a named/exported declaration (no mdast import, no local
    // interface; see remark-player-directive.ts for why).
    const node = tree.children[0] as unknown as {
      data?: { hName?: string; hProperties?: { uid?: string } };
    };
    expect(node.data?.hName).toBe("player-chip");
    expect(node.data?.hProperties?.uid).toBe("mlb:1");
  });

  it("leaves a textDirective with a different name untouched", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "textDirective",
          name: "foo",
          attributes: { uid: "mlb:1" },
          children: [{ type: "text", value: "A" }],
        },
      ],
    };
    remarkPlayerDirective("")(tree);
    const node = tree.children[0] as unknown as { data?: { hName?: string } };
    expect(node.data?.hName).toBeUndefined();
  });

  it("annotates a player directive nested inside another node's children", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Hot week for " },
            {
              type: "textDirective",
              name: "player",
              attributes: { uid: "mlb:592450" },
              children: [{ type: "text", value: "Aaron Judge" }],
            },
          ],
        },
      ],
    };
    remarkPlayerDirective("")(tree);
    const nested = tree.children[0].children[1] as unknown as {
      data?: { hName?: string; hProperties?: { uid?: string } };
    };
    expect(nested.data?.hName).toBe("player-chip");
    expect(nested.data?.hProperties?.uid).toBe("mlb:592450");
  });
});

// remarkDirective's micromark extension treats ANY bare `:word` as a directive
// node (not just our `:player[...]{...}` form) — a lone colon followed by a
// name-like token in ordinary prose ("3:1", "3:05pm", "K:BB", "5:30") parses as
// a spurious textDirective/leafDirective/containerDirective. Since our
// transform only annotates `player` directives, every other directive used to
// leak through mdast-util-to-hast as an empty <div> with the adjacent text
// silently dropped. These tests run the REAL remark-parse -> remark-directive
// -> remarkPlayerDirective -> remark-rehype pipeline (no jsdom — assertions
// read the hast tree directly) so real prose corruption is caught here rather
// than only in a dev-server visual pass.
//
// Note on invoking the plugin: remarkPlayerDirective(source) is called
// directly against the already-parsed tree here (mirroring the direct-call
// style used in the `describe("remarkPlayerDirective", ...)` block above)
// rather than registered via unified's `.use()` list. unified calls a `.use()`
// attacher ONCE at freeze time with whatever options were supplied, and only
// registers its return value as the real per-tree transformer if that value is
// a function — so `.use(remarkPlayerDirective(source))` (passing an
// already-invoked transformer as if it were the attacher) would invoke that
// transformer immediately at freeze time with `tree === undefined` and never
// run it again against the real tree. Calling `remarkPlayerDirective(source)`
// ourselves and applying the result to the parsed tree directly avoids that
// pitfall entirely (verified empirically against unified 11.0.5 while
// debugging this fix — see task-5-report.md for the repro).
describe("remarkPlayerDirective — real pipeline (spurious directive corruption)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hast tree shape; `any` per this file's existing mdast/hast convention
  function toHast(md: string): any {
    const processor = unified().use(remarkParse).use(remarkDirective);
    const tree = processor.parse(md);
    remarkPlayerDirective(md)(tree);
    return unified().use(remarkRehype).runSync(tree);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function collectText(node: any): string {
    if (node.type === "text") return node.value ?? "";
    if (Array.isArray(node.children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return node.children.map((c: any) => collectText(c)).join("");
    }
    return "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function hasTag(node: any, tagName: string): boolean {
    if (node.type === "element" && node.tagName === tagName) return true;
    if (Array.isArray(node.children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return node.children.some((c: any) => hasTag(c, tagName));
    }
    return false;
  }

  it('preserves "held a 3:1 edge" verbatim with no leaked <div>', () => {
    const md = "held a 3:1 edge";
    const hast = toHast(md);
    expect(hasTag(hast, "div")).toBe(false);
    expect(collectText(hast)).toBe(md);
  });

  it('preserves "first pitch (3:05pm ET) today" verbatim with no leaked <div>', () => {
    const md = "first pitch (3:05pm ET) today";
    const hast = toHast(md);
    expect(hasTag(hast, "div")).toBe(false);
    expect(collectText(hast)).toBe(md);
  });

  it('preserves "a 15:6 K:BB run" verbatim with no leaked <div>', () => {
    const md = "a 15:6 K:BB run";
    const hast = toHast(md);
    expect(hasTag(hast, "div")).toBe(false);
    expect(collectText(hast)).toBe(md);
  });

  it('preserves "at 5:30 tonight" verbatim with no leaked <div>', () => {
    const md = "at 5:30 tonight";
    const hast = toHast(md);
    expect(hasTag(hast, "div")).toBe(false);
    expect(collectText(hast)).toBe(md);
  });

  it("still renders a real :player directive as a player-chip, with surrounding prose intact", () => {
    const md = ':player[Aaron Judge]{uid="mlb:592450"} went off';
    const hast = toHast(md);
    expect(hasTag(hast, "player-chip")).toBe(true);
    const text = collectText(hast);
    expect(text).toContain("Aaron Judge");
    expect(text).toContain("went off");
  });
});
