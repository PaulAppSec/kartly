import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { avatarFromUrl } from "../attacks/dangerous.js";

// fix/ssrf — internal/loopback targets are rejected before any fetch.
describe("FIXED #12 — SSRF blocked to internal ranges", () => {
  it("a loopback URL is refused", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const imp = await avatarFromUrl(alice.cookie, alice.csrf, "http://127.0.0.1:4000/api/health");
    expect(imp.status).toBe(400);
  });
});
