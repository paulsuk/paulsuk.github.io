import { describe, expect, it } from "vitest";
import { fmtCompact, fmtTiered, signed, logoUrl } from "./format";

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
