import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { getStore, setAnnouncement } from "../attacks/dangerous.js";

// fix/ssti — the announcement is rendered as escaped data, never compiled.
describe("FIXED #16 — SSTI blocked", () => {
  it("a template payload is shown literally, not evaluated", async () => {
    const seller = await loginAs("seller@kartly.test", "seller1234");
    await setAnnouncement(seller.cookie, seller.csrf, "math=<%= 7*7 %>");
    const store = await getStore("u-seller");
    expect(store.status).toBe(200);
    expect(store.text).not.toContain("math=49");
  });
});
