# fix(xxe): disable DTD/external entities in XML import [#17]

**Branch:** `fix/xxe` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/sellerService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/17-xxe` — passes on `main` (bug present).
- `server/tests/fixed/17-xxe` — **fails on `main`, passes on `fix/xxe`.**

## How to open the PR (once a remote exists)
```
git push origin fix/xxe
gh pr create --base main --head fix/xxe --title "fix(xxe): disable DTD/external entities in XML import [#17]" --body-file artifacts/xxe/PR.md
```
See `artifacts/xxe/fix-diff.diff` for the full remediation diff.
