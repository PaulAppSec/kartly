import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { readMe } from "../attacks/config.js";

// fix/data-exposure — /api/me returns a DTO without passwordHash.
describe("FIXED #21 — no sensitive fields exposed", () => {
  it("passwordHash is absent from /api/me", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await readMe(alice.cookie);
    expect(res.user.passwordHash).toBeUndefined();
  });
});
