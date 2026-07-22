import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { updateProfileNoCsrf } from "../attacks/web.js";

// fix/csrf — csrfGuard is restored on PATCH /api/me.
describe("FIXED #11 — CSRF token required on profile update", () => {
  it("a cookie-only update with no CSRF token is rejected", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await updateProfileNoCsrf(alice.cookie, `pwned-${Date.now()}`);
    expect(res.status).toBe(403);
  });
});
