# fix(misconfig): remove debug/.env routes, generic errors, strict CSP [#20]

**Branch:** `fix/misconfig` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/app.ts
  - server/src/middleware/errorHandler.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/20-misconfig` — passes on `main` (bug present).
- `server/tests/fixed/20-misconfig` — **fails on `main`, passes on `fix/misconfig`.**

## How to open the PR (once a remote exists)
```
git push origin fix/misconfig
gh pr create --base main --head fix/misconfig --title "fix(misconfig): remove debug/.env routes, generic errors, strict CSP [#20]" --body-file artifacts/misconfig/PR.md
```
See `artifacts/misconfig/fix-diff.diff` for the full remediation diff.
