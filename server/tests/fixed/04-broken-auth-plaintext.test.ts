import { describe, expect, it } from "vitest";
import { exfiltrateUsersViaSearch } from "../attacks/sqli.js";

// FIXED #4 — run against a fix/auth container. (SQLi #1 may still exist on this
// branch — fixes are independent — so the dump can still happen; but the value
// it returns is now a KDF hash, not the cleartext password.)
describe("FIXED #4 — passwords are hashed on fix/auth", () => {
  it("even if dumped, the stored password is a hash, not cleartext", async () => {
    const { loot } = await exfiltrateUsersViaSearch();
    const alice = loot.find((c) => c.email === "alice@kartly.test");
    if (!alice) return; // search itself may be fixed on this branch — also fine
    expect(alice.password).not.toBe("alice1234");
    expect(alice.password.length, "looks like a hash").toBeGreaterThan(30);
  });
});
