import { describe, expect, it } from "vitest";
import { loginBypass } from "../attacks/sqli.js";

// FIXED #2 — run against a fix/sqli-login container. Same injection payload;
// the parameterized query treats it as a (non-existent) email → 401.
describe("FIXED #2 — SQLi auth bypass is blocked on fix/sqli-login", () => {
  it("the injection no longer logs anyone in", async () => {
    const { status, user } = await loginBypass("admin@kartly.test'-- ");
    expect(status).toBe(401);
    expect(user).toBeUndefined();
  });
});
