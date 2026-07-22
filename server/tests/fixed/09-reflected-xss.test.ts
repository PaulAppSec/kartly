import { describe, expect, it } from "vitest";
import { XSS_SCRIPT, fetchSharePage } from "../attacks/web.js";

// fix/reflected-xss — the `q` term is contextually escaped.
describe("FIXED #9 — reflected search term is escaped", () => {
  it("the payload is entity-encoded in the response", async () => {
    const page = await fetchSharePage("p01", XSS_SCRIPT);
    expect(page.status).toBe(200);
    expect(page.text).not.toContain(XSS_SCRIPT);
    expect(page.text).toContain("&lt;script&gt;");
  });
});
