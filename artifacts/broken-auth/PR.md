# fix(auth): store scrypt password hashes, verify constant-time [#4]

**Branch:** `fix/auth` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/prisma/seed.ts
  - server/src/services/authService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/04-broken-auth-plaintext` — passes on `main` (bug present).
- `server/tests/fixed/04-broken-auth-plaintext` — **fails on `main`, passes on `fix/auth`.**

## How to open the PR (once a remote exists)
```
git push origin fix/auth
gh pr create --base main --head fix/auth --title "fix(auth): store scrypt password hashes, verify constant-time [#4]" --body-file artifacts/broken-auth/PR.md
```
See `artifacts/broken-auth/fix-diff.diff` for the full remediation diff.
