import { describe, expect, it } from "vitest";
import { loginAs, readOrderAs } from "../attacks/access.js";

// FIXED #5 — run against fix/idor. Ownership is enforced → 404 (not 403).
describe("FIXED #5 — IDOR blocked on fix/idor", () => {
  it("alice cannot read bob's order", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await readOrderAs(alice.cookie, "o-bob-1");
    expect(res.status).toBe(404);
  });
});
