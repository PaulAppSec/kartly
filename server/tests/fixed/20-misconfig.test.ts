import { describe, expect, it } from "vitest";

const BASE = process.env.KARTLY_URL ?? "http://localhost:4000";

// fix/misconfig — debug/.env routes removed; errors are generic.
describe("FIXED #20 — misconfiguration hardened", () => {
  it("/.env is not served", async () => {
    const res = await fetch(`${BASE}/.env`);
    const text = await res.text();
    expect(text).not.toContain("dev-access-secret-change-me");
  });
  it("errors do not leak a stack trace", async () => {
    const res = await fetch(`${BASE}/api/debug/error`);
    const json = (await res.json().catch(() => ({}))) as { error?: { stack?: string } };
    expect(json.error?.stack).toBeUndefined();
  });
});
