import { describe, expect, it } from "vitest";
import { exfiltrateUsersViaSearch } from "../attacks/sqli.js";

// FIXED #1 — run against a fix/sqli container. Same attack as the exploit test;
// only the assertion flips. On the parameterized build the payload is a literal
// search string, so nothing is exfiltrated.
describe("FIXED #1 — SQLi UNION is blocked on fix/sqli", () => {
  it("cannot exfiltrate any credentials through search", async () => {
    const { status, loot } = await exfiltrateUsersViaSearch();
    expect(status).not.toBe(500); // no raw DB error either
    expect(loot.length, "no credentials leaked").toBe(0);
  });
});
