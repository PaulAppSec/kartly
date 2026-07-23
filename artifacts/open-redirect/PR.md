# fix(open-redirect): allow only same-origin relative returnTo [#18]

**Branch:** `fix/open-redirect` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/controllers/pageController.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/18-open-redirect` — passes on `main` (bug present).
- `server/tests/fixed/18-open-redirect` — **fails on `main`, passes on `fix/open-redirect`.**

## How to open the PR (once a remote exists)
```
git push origin fix/open-redirect
gh pr create --base main --head fix/open-redirect --title "fix(open-redirect): allow only same-origin relative returnTo [#18]" --body-file artifacts/open-redirect/PR.md
```
See `artifacts/open-redirect/fix-diff.diff` for the full remediation diff.
