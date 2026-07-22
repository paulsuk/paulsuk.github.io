import { describe, it, expect } from "vitest";
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
    remarkPlayerDirective()(tree);
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
    remarkPlayerDirective()(tree);
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
    remarkPlayerDirective()(tree);
    const nested = tree.children[0].children[1] as unknown as {
      data?: { hName?: string; hProperties?: { uid?: string } };
    };
    expect(nested.data?.hName).toBe("player-chip");
    expect(nested.data?.hProperties?.uid).toBe("mlb:592450");
  });
});
