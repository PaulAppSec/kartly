import { describe, expect, it } from "vitest";
import { forgeNoneToken, sellerAreaWithToken } from "../attacks/config.js";

// fix/jwt — the verifier pins HS256; alg:none is rejected.
describe("FIXED #19 — JWT alg:none rejected", () => {
  it("a forged unsigned token is refused", async () => {
    const token = forgeNoneToken({ sub: "u-alice", role: "ADMIN", email: "attacker@evil.example" });
    const res = await sellerAreaWithToken(token);
    expect(res.status).toBe(401);
  });
});
