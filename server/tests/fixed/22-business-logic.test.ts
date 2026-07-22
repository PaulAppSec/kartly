import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { checkoutTampered } from "../attacks/config.js";

// fix/business-logic — server prices from the DB; client unitPrice is ignored.
describe("FIXED #22 — price tampering blocked", () => {
  it("the order total is the real (non-zero) DB price", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await checkoutTampered(alice.cookie, alice.csrf, "p01", 0, 1);
    expect(res.status).toBe(201);
    expect(res.total).toBeGreaterThan(0);
  });
});
