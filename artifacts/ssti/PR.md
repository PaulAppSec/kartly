# fix(ssti): render the store announcement as escaped data [#16]

**Branch:** `fix/ssti` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/controllers/pageController.ts
  - server/src/views/store.ejs

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/16-ssti` — passes on `main` (bug present).
- `server/tests/fixed/16-ssti` — **fails on `main`, passes on `fix/ssti`.**

## How to open the PR (once a remote exists)
```
git push origin fix/ssti
gh pr create --base main --head fix/ssti --title "fix(ssti): render the store announcement as escaped data [#16]" --body-file artifacts/ssti/PR.md
```
See `artifacts/ssti/fix-diff.diff` for the full remediation diff.
