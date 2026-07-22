import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { uploadAvatar } from "../attacks/dangerous.js";

// fix/upload — content is validated by magic bytes; a script .html is rejected.
describe("FIXED #13 — unrestricted upload blocked", () => {
  it("an .html masquerading as an image is refused", async () => {
    const alice = await loginAs("alice@kartly.test", "alice1234");
    const up = await uploadAvatar(
      alice.cookie,
      alice.csrf,
      "pwn.html",
      "text/html",
      "<script>alert(document.domain)</script>",
    );
    expect(up.status).toBe(415);
  });
});
