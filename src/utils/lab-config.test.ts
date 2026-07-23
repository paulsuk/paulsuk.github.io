import { describe, expect, it } from "vitest";
import { firstNumericSeason } from "./lab-config";

describe("lab-config", () => {
  it("picks the first numeric season id", () => {
    expect(firstNumericSeason([{ id: "projections" }, { id: "2026" }, { id: "2025" }]))
      .toBe("2026");
    expect(firstNumericSeason([{ id: "projections" }])).toBeNull();
    expect(firstNumericSeason([])).toBeNull();
  });
});
