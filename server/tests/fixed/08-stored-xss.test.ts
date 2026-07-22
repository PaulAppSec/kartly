import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { XSS_IMG, fetchSharePage, postReview } from "../attacks/web.js";

// fix/stored-xss — the SAME stored payload is now HTML-escaped on render.
describe("FIXED #8 — stored XSS is escaped on output", () => {
  it("the review payload comes back entity-encoded, not as live HTML", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    await postReview(alice.cookie, alice.csrf, "p01", `${XSS_IMG}<!--${Date.now()}-->`);

    const page = await fetchSharePage("p01");
    expect(page.status).toBe(200);
    expect(page.text).not.toContain(XSS_IMG);
    expect(page.text).toContain("&lt;img");
  });
});
