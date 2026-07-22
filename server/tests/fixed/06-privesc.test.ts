import { describe, expect, it } from "vitest";
import { listUsersAsNonAdmin, loginAs } from "../attacks/access.js";

// FIXED #6 — run against fix/authz-admin. The role guard rejects non-admins.
describe("FIXED #6 — privilege escalation blocked on fix/authz-admin", () => {
  it("a CUSTOMER is forbidden from the admin API", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const res = await listUsersAsNonAdmin(alice.cookie);
    expect(res.status).toBe(403);
  });
});
