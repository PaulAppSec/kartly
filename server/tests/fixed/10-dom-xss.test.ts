import { describe, expect, it } from "vitest";
import { fetchSharePage } from "../attacks/web.js";

// fix/dom-xss — the fragment note is written with textContent (inert sink).
describe("FIXED #10 — DOM sink is safe", () => {
  it("the delivered page no longer assigns location.hash via innerHTML", async () => {
    const page = await fetchSharePage("p01");
    expect(page.status).toBe(200);
    expect(/\.innerHTML\s*=\s*note/.test(page.text)).toBe(false);
    expect(/\.textContent\s*=\s*note/.test(page.text)).toBe(true);
  });
});
