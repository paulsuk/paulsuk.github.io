import { describe, it, expect } from "vitest";
import { extractPlayerUids } from "./remark-player-directive";

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
