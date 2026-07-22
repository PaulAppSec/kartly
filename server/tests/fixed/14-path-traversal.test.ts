import { describe, expect, it } from "vitest";
import { downloadFile } from "../attacks/dangerous.js";

// fix/path-traversal — the filename is confined to the downloads dir.
describe("FIXED #14 — path traversal blocked", () => {
  it("a ../ escape is refused and leaks nothing", async () => {
    const res = await downloadFile("../decoys/secret.txt");
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.text).not.toContain("FLAG{kartly_lfi_decoy_only}");
  });
});
