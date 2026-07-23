import { describe, expect, it } from "vitest";
import { sparklineSegments } from "./sparkline";

describe("sparklineSegments", () => {
  it("returns one segment for a full series, scaled into the box", () => {
    const segs = sparklineSegments([1, 2, 3], 64, 18, 2);
    expect(segs).toHaveLength(1);
    const pts = segs[0].split(" ").map((p) => p.split(",").map(Number));
    expect(pts).toHaveLength(3);
    expect(pts[0][0]).toBeCloseTo(2, 1);        // left pad
    expect(pts[2][0]).toBeCloseTo(62, 1);       // right pad
    expect(pts[0][1]).toBeCloseTo(16, 1);       // min -> bottom
    expect(pts[2][1]).toBeCloseTo(2, 1);        // max -> top
  });
  it("splits on null gaps and drops isolated points", () => {
    // [1,2,null,4,5] -> two runs, but [1,null,3] -> single-point runs are dropped
    expect(sparklineSegments([1, 2, null, 4, 5])).toHaveLength(2);
    expect(sparklineSegments([1, null, 3])).toHaveLength(0);
  });
  it("handles flat and empty series", () => {
    expect(sparklineSegments([2, 2, 2])).toHaveLength(1); // no divide-by-zero
    expect(sparklineSegments([])).toHaveLength(0);
    expect(sparklineSegments([null, 5, null])).toHaveLength(0);
  });
});
