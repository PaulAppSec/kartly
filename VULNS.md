# Kartly — Vulnerability Index (`VULNS.md`)

> The master index the content is written from. **If a vuln isn't in this file,
> it doesn't exist.** Every class gets the full six-part shape once it's live:
> **Where · Vulnerable code · Exploit (exact payload) · Impact · Fix (code) ·
> Detect (defender's view).**

**Status legend:** 🔴 pending (not yet introduced) · 🟠 live on `main` (documented + exploit test) · 🟢 fixed on `fix/<slug>` (PR open, fixed test passing)

> **Phase status:** Phase 3 in progress (Batch 1 = the injection + broken-auth
> cluster). **1 of 24 live:** #1 SQLi (UNION). Each live vuln has a passing
> exploit test in `server/tests/exploits/`. The rest are still the secure Phase 2
> baseline.

## Matrix

| # | Vuln class | Lives in | Fix branch | Status |
|---|-----------|----------|------------|--------|
| 1 | SQLi – UNION/data | `GET /api/search?q=` | `fix/sqli` | 🟠 live on `main` |
| 2 | SQLi – auth bypass | `POST /api/auth/login` | `fix/sqli-login` | 🔴 pending |
| 3 | Blind SQLi (boolean/time) | `GET /api/products?sort=` | `fix/blind-sqli` | 🔴 pending |
| 4 | Broken auth | login / register / seed | `fix/auth` | 🔴 pending |
| 5 | Broken access control (IDOR) | `GET /api/orders/:id`, `/messages/:id` | `fix/idor` | 🔴 pending |
| 6 | Privilege escalation | `/api/admin/*` | `fix/authz-admin` | 🔴 pending |
| 7 | Mass assignment | `POST /api/register`, `PATCH /api/me` | `fix/mass-assignment` | 🔴 pending |
| 8 | Stored XSS | reviews, bio, description, messages | `fix/stored-xss` | 🔴 pending |
| 9 | Reflected XSS | search / server error / share page | `fix/reflected-xss` | 🔴 pending |
| 10 | DOM XSS | client renders `location.hash`/param | `fix/dom-xss` | 🔴 pending |
| 11 | CSRF | `POST /account/email`, place order | `fix/csrf` | 🔴 pending |
| 12 | SSRF | import-image-from-URL, avatar-from-URL | `fix/ssrf` | 🔴 pending |
| 13 | Unrestricted file upload | avatar / product image | `fix/upload` | 🔴 pending |
| 14 | Path traversal / LFI | `GET /download?file=` | `fix/path-traversal` | 🔴 pending |
| 15 | Command injection (RCE) | admin export / image processing | `fix/cmdi` | 🔴 pending |
| 16 | SSTI | seller store-announcement template | `fix/ssti` | 🔴 pending |
| 17 | XXE | bulk XML product import | `fix/xxe` | 🔴 pending |
| 18 | Open redirect | `GET /login?returnTo=` | `fix/open-redirect` | 🔴 pending |
| 19 | JWT weaknesses | API auth | `fix/jwt` | 🔴 pending |
| 20 | Security misconfig | verbose errors, `/.env`, debug route | `fix/misconfig` | 🔴 pending |
| 21 | Sensitive data exposure | API returns `passwordHash`/tokens | `fix/data-exposure` | 🔴 pending |
| 22 | Business logic | checkout: qty/price/coupon | `fix/business-logic` | 🔴 pending |
| 23 | CORS misconfig | API CORS | `fix/cors` | 🔴 pending |
| 24 | No rate limiting | login, coupon, reset | `fix/rate-limit` | 🔴 pending |

---

## Detailed entries

Each entry is filled in when the vuln goes live on `main` (Phase 3). Until then
the placeholders below reserve the slot and record the plan.

<!-- Template — copy per vuln when introduced:
### N. <Vuln class>  — <status emoji>
- **Where:** file:line / endpoint
- **Vulnerable code:** ```ts …```
- **Exploit (copy-paste):** ```…```
- **Impact:** business framing (what an attacker gets, why it matters)
- **Fix:** `fix/<slug>` — ```ts …``` (the PR diff)
- **Detect:** how a defender spots it (log signature, scanner rule, code review tell)
- **Exploit test:** `server/tests/exploits/<name>.test.ts`
-->

### 1. SQLi – UNION/data — 🟠 live on `main`
- **Where:** `server/src/services/searchService.ts` → `GET /api/search?q=`
- **Vulnerable code:**
  ```ts
  const sql = `SELECT id, name, description, category FROM "Product"
               WHERE name ILIKE '%${q}%' OR description ILIKE '%${q}%' ...`;
  return prisma.$queryRawUnsafe(sql);
  ```
- **Exploit (copy-paste):**
  ```
  GET /api/search?q=' UNION SELECT id, email, "passwordHash", role::text FROM "User"-- 
  ```
  (URL-encode the value.) User `email` comes back in the `name` field and
  `passwordHash` in `description`.
- **Impact:** Full read of any table — here it dumps every customer's email and
  (because of #4) plaintext password. Total account takeover, incl. admin.
- **Fix (`fix/sqli`):** use a parameterized query — `prisma.$queryRaw\`... ILIKE ${'%'+q+'%'}\`` or Prisma's `findMany` with `contains`. Never concatenate input into SQL.
- **Detect:** grep for `$queryRawUnsafe` / string-built SQL; WAF sees `UNION SELECT`; DB logs show a `UNION` against `"User"` from the search path.
- **Exploit test:** `server/tests/exploits/01-sqli-search.test.ts`

### 2. SQLi – auth bypass — 🔴 pending
_Batch 1 (next commit) — raw concatenated login query in `authService.login`._

### 3. Blind SQLi (boolean/time) — 🔴 pending
_Batch 2 — `GET /api/products?sort=` raw ORDER BY._

### 4. Broken auth — 🔴 pending
_Batch 1 (next commit) — plaintext password storage in seed + register/reset._
### 5. Broken access control (IDOR) — 🔴 pending
### 6. Privilege escalation — 🔴 pending
### 7. Mass assignment — 🔴 pending
### 8. Stored XSS — 🔴 pending
### 9. Reflected XSS — 🔴 pending
### 10. DOM XSS — 🔴 pending
### 11. CSRF — 🔴 pending
### 12. SSRF — 🔴 pending
### 13. Unrestricted file upload — 🔴 pending
### 14. Path traversal / LFI — 🔴 pending
### 15. Command injection (RCE) — 🔴 pending
### 16. SSTI — 🔴 pending
### 17. XXE — 🔴 pending
### 18. Open redirect — 🔴 pending
### 19. JWT weaknesses — 🔴 pending
### 20. Security misconfig — 🔴 pending
### 21. Sensitive data exposure — 🔴 pending
### 22. Business logic — 🔴 pending
### 23. CORS misconfig — 🔴 pending
### 24. No rate limiting — 🔴 pending
