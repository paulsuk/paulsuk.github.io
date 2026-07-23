import { describe, expect, it } from "vitest";
import { rankBadgeClass } from "./lab-helpers";

describe("rankBadgeClass", () => {
  it("maps league-relative tiers to token classes", () => {
    expect(rankBadgeClass(1, 12)).toBe("bg-win/10 text-win");
    expect(rankBadgeClass(2, 12)).toBe("bg-win/10 text-win");
    expect(rankBadgeClass(5, 12)).toBe("bg-rule/50 text-ink-soft");
    expect(rankBadgeClass(9, 12)).toBe("text-ink-faint");
    expect(rankBadgeClass(11, 12)).toBe("bg-loss/10 text-loss");
    expect(rankBadgeClass(12, 12)).toBe("bg-loss/10 text-loss");
  });
  it("never emits raw palette classes", () => {
    for (let r = 1; r <= 12; r++) {
      expect(rankBadgeClass(r, 12)).not.toMatch(/green|amber|slate|red-\d/);
    }
  });
});
