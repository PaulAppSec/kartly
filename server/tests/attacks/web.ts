import { api } from "../helpers.js";

// Reusable attacks for the web-vuln cluster (XSS #8/#9/#10, CSRF #11) plus the
// open-redirect probe (#18). Black-box against the running app; every helper is
// reused unchanged by the matching tests/fixed/* suite.

// A canonical XSS marker — unique enough to grep for verbatim in the response.
export const XSS_IMG = `<img src=x onerror="alert(document.domain)">`;
export const XSS_SCRIPT = `<script>alert(1337)</script>`;

// #8 stored XSS: post a review whose body is an HTML/JS payload.
export async function postReview(cookie: string, csrf: string, productId: string, body: string) {
  return api("POST", `/api/products/${productId}/reviews`, {
    headers: { Cookie: cookie, "X-CSRF-Token": csrf },
    body: { body, rating: 5 },
  });
}

// Fetch the server-rendered public share page (returns raw HTML in `.text`).
export async function fetchSharePage(productId: string, q?: string) {
  const path = `/share/product/${productId}${q ? `?q=${encodeURIComponent(q)}` : ""}`;
  return api("GET", path);
}

// #11 CSRF: a state-changing profile update carrying the auth cookie but NO
// CSRF token — exactly what a cross-site auto-submitting form can send.
export async function updateProfileNoCsrf(cookie: string, name: string) {
  return api("PATCH", "/api/me", { headers: { Cookie: cookie }, body: { name } });
}

// #18 open redirect: hit the post-login continue endpoint with an external target.
export async function followContinue(cookie: string, returnTo: string) {
  const res = await fetch(
    `${process.env.KARTLY_URL ?? "http://localhost:4000"}/login?returnTo=${encodeURIComponent(returnTo)}`,
    { headers: { Cookie: cookie }, redirect: "manual" },
  );
  return { status: res.status, location: res.headers.get("location") ?? "" };
}

export function printLoot(title: string, loot: string) {
  // eslint-disable-next-line no-console
  console.log(`\n  🩸 ${title}\n${loot}\n`);
}
