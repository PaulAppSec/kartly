import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { adminExport } from "../attacks/dangerous.js";

// fix/cmdi — execFile with an argument array; the label can't spawn a command.
describe("FIXED #15 — command injection blocked", () => {
  it("the injected `cat` does not run", async () => {
    const admin = await loginAs("admin@kartly.test", "admin1234");
    const res = await adminExport(admin.cookie, admin.csrf, "sales; cat server/decoys/secret.txt");
    expect(res.output).not.toContain("FLAG{kartly_lfi_decoy_only}");
  });
});
