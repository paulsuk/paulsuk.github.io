import { describe, expect, it } from "vitest";
import { firstNumericSeason } from "./lab-config";

describe("lab-config", () => {
  it("picks the first numeric season id", () => {
    expect(firstNumericSeason([{ id: "projections" }, { id: "2026" }, { id: "2025" }]))
      .toBe("2026");
    expect(firstNumericSeason([{ id: "projections" }])).toBeNull();
    expect(firstNumericSeason([])).toBeNull();
  });
  it("matches a leading 4-digit year even with a suffix (e.g. in-progress season)", () => {
    expect(
      firstNumericSeason([{ id: "projections" }, { id: "2026_ytd" }, { id: "2025" }])
    ).toBe("2026_ytd");
  });
});
