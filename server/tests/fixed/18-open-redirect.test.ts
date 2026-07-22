import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { followContinue } from "../attacks/web.js";

// fix/open-redirect — only same-origin relative targets are honoured.
describe("FIXED #18 — open redirect blocked", () => {
  it("an external returnTo is not followed", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await followContinue(alice.cookie, "https://evil.example/phish");
    expect(res.location).not.toBe("https://evil.example/phish");
  });
});
