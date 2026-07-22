# Kartly — Vulnerability Index (`VULNS.md`)

> The master index the content is written from. **If a vuln isn't in this file,
> it doesn't exist.** Every class gets the full six-part shape once it's live:
> **Where · Vulnerable code · Exploit (exact payload) · Impact · Fix (code) ·
> Detect (defender's view).**

**Status legend:** 🔴 pending (not yet introduced) · 🟠 live on `main` (documented + exploit test) · 🟢 fixed on `fix/<slug>` (PR open, fixed test passing)

> **Phase status:** Phase 3 in progress. **5 of 24 live:** #1 SQLi (UNION), #2
> SQLi (auth bypass), #3 blind SQLi, #4 broken auth, #5 IDOR. Each has a passing
> exploit test in `server/tests/exploits/` and a saved artifact in `artifacts/`.
> The rest are still the secure Phase 2 baseline.

## Matrix

| # | Vuln class | Lives in | Fix branch | Status |
|---|-----------|----------|------------|--------|
| 1 | SQLi – UNION/data | `GET /api/search?q=` | `fix/sqli` | 🟠 live on `main` |
| 2 | SQLi – auth bypass | `POST /api/auth/login` | `fix/sqli-login` | 🟠 live on `main` |
| 3 | Blind SQLi (boolean/time) | `GET /api/products?sort=` | `fix/blind-sqli` | 🟠 live on `main` |
| 4 | Broken auth | login / register / seed | `fix/auth` | 🟠 live on `main` |
| 5 | Broken access control (IDOR) | `GET /api/orders/:id`, `/messages/:id` | `fix/idor` | 🟠 live on `main` |
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

### 2. SQLi – auth bypass — 🟠 live on `main`
- **Where:** `server/src/services/authService.ts` → `POST /api/auth/login`
- **Vulnerable code:**
  ```ts
  const rows = await prisma.$queryRawUnsafe<User[]>(
    `SELECT * FROM "User" WHERE email = '${input.email}' AND "passwordHash" = '${input.password}'`,
  );
  ```
  (The login Zod schema is also loosened — no `.email()` — so the payload gets through, per §2 "Zod loose on main".)
- **Exploit (copy-paste):**
  ```
  POST /api/auth/login
  { "email": "admin@kartly.test'-- ", "password": "anything" }
  ```
  The `'-- ` closes the string and comments out the password check → logs in as admin.
- **Impact:** Authentication bypass. Any known email → full session as that user, including admin, with no password.
- **Fix (`fix/sqli-login`):** parameterized lookup by email + restore strict validation, then verify a hashed password in code (`fix/auth` supplies the hash).
- **Detect:** raw SQL in the auth path; login succeeding with a quote/`--` in the email field; failed-login count that doesn't match successes.
- **Exploit test:** `server/tests/exploits/02-sqli-login-bypass.test.ts`

### 3. Blind SQLi (boolean/time) — 🟠 live on `main`
- **Where:** `server/src/data/productRepo.ts` → `GET /api/products?sort=`
- **Vulnerable code:**
  ```ts
  const orderBy = sort?.trim() || '"createdAt" DESC';
  const sql = `SELECT * FROM "Product" WHERE (...) ORDER BY ${orderBy}`;
  return prisma.$queryRawUnsafe(sql, `%${q}%`, category);
  ```
  (q/category are parameterized; only `sort` is concatenated — the injection is isolated to ORDER BY.)
- **Exploit (copy-paste):**
  ```
  GET /api/products?sort=(SELECT 1 FROM pg_sleep(3))        → ~3s delay (time-based)
  GET /api/products?sort=(CASE WHEN (SELECT substr(passwordHash,1,1) FROM "User" WHERE email='admin@kartly.test')='a' THEN name ELSE (SELECT 1 FROM pg_sleep(3)) END)
  ```
- **Impact:** No direct output, but boolean/time oracles extract any data one bit at a time (password hashes, secrets).
- **Fix (`fix/blind-sqli`):** allowlist the sort column → concrete `ORDER BY`; never interpolate the raw value.
- **Detect:** raw value in ORDER BY; response-time spikes correlated with `pg_sleep`/`CASE` in `sort`.
- **Exploit test:** `server/tests/exploits/03-blind-sqli.test.ts`

### 4. Broken auth — 🟠 live on `main`
- **Where:** `server/prisma/seed.ts`, `authService.register` / `resetPassword` (plaintext storage), no lockout.
- **Vulnerable code:**
  ```ts
  function hashPassword(plain: string): string { return plain; } // seed
  // register/reset:
  passwordHash: input.password,
  ```
- **Exploit:** dump `passwordHash` via #1 → it *is* the password (`alice1234`, not a hash). Combined with unlimited attempts (see #24) this is trivial credential compromise.
- **Impact:** A DB read (backup, SQLi, insider) exposes every password directly; password reuse spreads the breach to users' other sites.
- **Fix (`fix/auth`):** store a strong KDF hash (argon2id/bcrypt/scrypt), constant-time verify, account lockout / throttling.
- **Detect:** passwords readable as cleartext in the DB; no `$`-prefixed hash format; no lockout after repeated failures.
- **Exploit test:** `server/tests/exploits/04-broken-auth-plaintext.test.ts`

> **Note (introduction commit):** #2 and #4 were introduced in a single commit
> because the raw-SQL login only functions over plaintext credentials — splitting
> them yields an intermediate commit where no one can log in. They remain
> separate rows and separate fix branches (`fix/sqli-login`, `fix/auth`).
### 5. Broken access control (IDOR) — 🟠 live on `main`
- **Where:** `server/src/services/orderService.ts` (`getById`), `messageService.ts` (`getById`) → `GET /api/orders/:id`, `GET /api/messages/:id`
- **Vulnerable code:** the `customerId === userId` / participant check is removed — only existence is checked.
- **Exploit:** as alice, `GET /api/orders/o-bob-1` → 200 returns bob's order; likewise any `/api/messages/:id`.
- **Impact:** Any logged-in user reads every order and private message by enumerating ids — order history, addresses, DMs.
- **Fix (`fix/idor`):** object-level authorization — verify ownership, return **404** (not 403) so ids don't leak existence.
- **Detect:** handlers that fetch by id without an owner predicate; one account reading many distinct ids.
- **Exploit test:** `server/tests/exploits/05-idor.test.ts`
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
