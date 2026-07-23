# fix(business-logic): server-side pricing, positive qty, stock check [#22]

**Branch:** `fix/business-logic` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - outbox/1784796779997-your-kartly-order-9f87516c-0653-4b07-ac4.html
  - server/src/schemas/orderSchemas.ts
  - server/src/services/orderService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/22-business-logic` — passes on `main` (bug present).
- `server/tests/fixed/22-business-logic` — **fails on `main`, passes on `fix/business-logic`.**

## How to open the PR (once a remote exists)
```
git push origin fix/business-logic
gh pr create --base main --head fix/business-logic --title "fix(business-logic): server-side pricing, positive qty, stock check [#22]" --body-file artifacts/business-logic/PR.md
```
See `artifacts/business-logic/fix-diff.diff` for the full remediation diff.
