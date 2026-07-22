import { describe, expect, it } from "vitest";
import { registerWithRole } from "../attacks/access.js";

// FIXED #7 — run against fix/mass-assignment. role is not accepted → CUSTOMER.
describe("FIXED #7 — mass assignment blocked on fix/mass-assignment", () => {
  it("an injected role is ignored; the user is a CUSTOMER", async () => {
    const email = `mallory+${Date.now()}@kartly.test`;
    const res = await registerWithRole(email, "ADMIN");
    expect((res.json as { user: { role: string } }).user.role).toBe("CUSTOMER");
  });
});
