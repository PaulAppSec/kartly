# fix(path-traversal): confine downloads to the base directory [#14]

**Branch:** `fix/path-traversal` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/controllers/pageController.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/14-path-traversal` — passes on `main` (bug present).
- `server/tests/fixed/14-path-traversal` — **fails on `main`, passes on `fix/path-traversal`.**

## How to open the PR (once a remote exists)
```
git push origin fix/path-traversal
gh pr create --base main --head fix/path-traversal --title "fix(path-traversal): confine downloads to the base directory [#14]" --body-file artifacts/path-traversal/PR.md
```
See `artifacts/path-traversal/fix-diff.diff` for the full remediation diff.
