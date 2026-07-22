import { describe, expect, it } from "vitest";
import { corsProbe } from "../attacks/config.js";

// fix/cors — strict allowlist; a foreign origin is not reflected.
describe("FIXED #23 — CORS allowlist enforced", () => {
  it("a foreign Origin is not echoed back", async () => {
    const res = await corsProbe("https://evil.example");
    expect(res.allowOrigin).not.toBe("https://evil.example");
  });
});
