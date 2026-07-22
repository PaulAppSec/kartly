import { describe, expect, it } from "vitest";
import { loginAs } from "../attacks/access.js";
import { importXml } from "../attacks/dangerous.js";

// fix/xxe — DTDs/entities are rejected outright.
const XXE = `<?xml version="1.0"?>
<!DOCTYPE products [<!ENTITY xxe SYSTEM "file:///app/server/decoys/secret.txt">]>
<products><product><name>&xxe;</name><description>imported</description><price>9.99</price><stock>1</stock></product></products>`;

describe("FIXED #17 — XXE blocked", () => {
  it("an XML with a DTD/entity is refused", async () => {
    const seller = await loginAs("seller@kartly.test", "seller1234");
    const res = await importXml(seller.cookie, seller.csrf, XXE);
    expect(res.status).toBe(400);
    expect(res.products.length).toBe(0);
  });
});
