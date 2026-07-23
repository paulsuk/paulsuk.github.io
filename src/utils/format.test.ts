import { describe, expect, it } from "vitest";
import { fmtCompact, fmtTiered, formatStat, signed, logoUrl } from "./format";

describe("fmtCompact", () => {
  it("strips trailing zeros and a bare decimal point", () => {
    expect(fmtCompact(0.3)).toBe("0.3");
    expect(fmtCompact(0.305)).toBe("0.305");
    expect(fmtCompact(1.0)).toBe("1");
    expect(fmtCompact(12.5)).toBe("12.5");
  });

  it("renders em dash for missing values", () => {
    expect(fmtCompact(null)).toBe("—");
    expect(fmtCompact(undefined)).toBe("—");
  });
});

describe("fmtTiered", () => {
  it("uses fewer decimals as magnitude grows", () => {
    expect(fmtTiered(12.34)).toBe("12.3");
    expect(fmtTiered(3.456)).toBe("3.46");
    expect(fmtTiered(0.3456)).toBe("0.346");
  });

  it("supports 0dp for large values (team stat tables)", () => {
    expect(fmtTiered(12.34, 0)).toBe("12");
    expect(fmtTiered(3.456, 0)).toBe("3.46");
  });

  it("renders em dash for missing values", () => {
    expect(fmtTiered(null)).toBe("—");
    expect(fmtTiered(undefined)).toBe("—");
  });
});

describe("signed", () => {
  it("prefixes non-negatives with +", () => {
    expect(signed(1.234)).toBe("+1.23");
    expect(signed(0)).toBe("+0.00");
    expect(signed(-0.5)).toBe("-0.50");
  });

  it("supports custom decimals", () => {
    expect(signed(2.5, 1)).toBe("+2.5");
  });
});

describe("formatStat", () => {
  it("formats 0-100 percent keys to 1dp, fraction percent keys to 3dp", () => {
    expect(formatStat(8.3456, "Barrel%")).toBe("8.3");
    expect(formatStat(41.2, "Hard Hit%")).toBe("41.2");
    expect(formatStat(0.472, "FG%")).toBe("0.472");
  });

  it("treats TS% as a 0-1 fraction, not a 0-100 percent (EfficiencyPanel computes it as pts / (2 * (fga + 0.44 * fta)))", () => {
    expect(formatStat(0.6062, "TS%")).toBe("0.606");
  });

  it("keeps x-stat display labels (StatcastPanel) at 3dp via STAT_DECIMALS", () => {
    expect(formatStat(0.2563, "xBA")).toBe("0.256");
    expect(formatStat(0.3456, "xwOBA")).toBe("0.346");
    expect(formatStat(0.4567, "xSLG")).toBe("0.457");
    expect(formatStat(0.2789, "xBA Against")).toBe("0.279");
  });

  it("still treats USG% as 0-100 (pending live-data scale verification) and pruned keys fall to the fraction branch", () => {
    expect(formatStat(28.4, "USG%")).toBe("28.4");
    expect(formatStat(0.345, "Whiff%")).toBe("0.345");
    expect(formatStat(0.123, "eFG%")).toBe("0.123");
  });
});

describe("logoUrl", () => {
  it("slugifies team names the same way the publisher does", () => {
    expect(logoUrl("baseball", "Warsaw Wocks!", 2026)).toBe(
      "/api/baseball/assets/logo-warsaw-wocks-2026",
    );
    expect(logoUrl("baseball", "  A--B  ", 2025)).toBe(
      "/api/baseball/assets/logo-a-b-2025",
    );
  });
});
