# fix(idor): enforce object-level authorization on orders/messages [#5]

**Branch:** `fix/idor` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/messageService.ts
  - server/src/services/orderService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/05-idor` — passes on `main` (bug present).
- `server/tests/fixed/05-idor` — **fails on `main`, passes on `fix/idor`.**

## How to open the PR (once a remote exists)
```
git push origin fix/idor
gh pr create --base main --head fix/idor --title "fix(idor): enforce object-level authorization on orders/messages [#5]" --body-file artifacts/idor/PR.md
```
See `artifacts/idor/fix-diff.diff` for the full remediation diff.
