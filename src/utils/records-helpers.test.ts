import { describe, expect, it } from "vitest";
import { formatStatValue } from "./records-helpers";

describe("formatStatValue", () => {
  it("formats integers plainly", () => {
    expect(formatStatValue(4)).toBe("4");
    expect(formatStatValue(0)).toBe("0");
  });
  it("formats sub-1 rates to 3 decimals", () => {
    expect(formatStatValue(0.333)).toBe("0.333");
    expect(formatStatValue(0.98)).toBe("0.980");
  });
  it("formats other decimals to 2 places", () => {
    expect(formatStatValue(2.5)).toBe("2.50");
    expect(formatStatValue(13.75)).toBe("13.75");
  });
});
