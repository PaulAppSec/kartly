import { describe, expect, it } from "vitest";
import { bruteLogin } from "../attacks/config.js";

// fix/rate-limit — the credential limiter throttles brute force.
describe("FIXED #24 — login rate limiting enforced", () => {
  it("rapid attempts eventually get a 429", async () => {
    const res = await bruteLogin("alice@kartly.test", 15);
    expect(res.sawThrottle).toBe(true);
  });
});
