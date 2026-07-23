# fix(jwt): pin verification to HS256, reject alg:none [#19]

**Branch:** `fix/jwt` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/lib/jwt.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/19-jwt` — passes on `main` (bug present).
- `server/tests/fixed/19-jwt` — **fails on `main`, passes on `fix/jwt`.**

## How to open the PR (once a remote exists)
```
git push origin fix/jwt
gh pr create --base main --head fix/jwt --title "fix(jwt): pin verification to HS256, reject alg:none [#19]" --body-file artifacts/jwt/PR.md
```
See `artifacts/jwt/fix-diff.diff` for the full remediation diff.
