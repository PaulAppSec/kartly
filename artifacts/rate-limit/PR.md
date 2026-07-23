# fix(rate-limit): reinstate limiters on auth + checkout [#24]

**Branch:** `fix/rate-limit` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/routes/auth.ts
  - server/src/routes/orders.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/24-rate-limit` — passes on `main` (bug present).
- `server/tests/fixed/24-rate-limit` — **fails on `main`, passes on `fix/rate-limit`.**

## How to open the PR (once a remote exists)
```
git push origin fix/rate-limit
gh pr create --base main --head fix/rate-limit --title "fix(rate-limit): reinstate limiters on auth + checkout [#24]" --body-file artifacts/rate-limit/PR.md
```
See `artifacts/rate-limit/fix-diff.diff` for the full remediation diff.
