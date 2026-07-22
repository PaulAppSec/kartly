import { describe, expect, it } from "vitest";
import { timedSortProbe } from "../attacks/access.js";

// FIXED #3 — run against fix/blind-sqli. The sort is allowlisted, so the
// pg_sleep payload never reaches the query and there is no delay.
describe("FIXED #3 — blind SQLi blocked on fix/blind-sqli", () => {
  it("the pg_sleep payload does not delay the response", async () => {
    const injected = await timedSortProbe("(SELECT 1 FROM pg_sleep(3))");
    expect(injected).toBeLessThan(1500);
  });
});
