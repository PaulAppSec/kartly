# fix(data-exposure): return a public DTO from /api/me [#21]

**Branch:** `fix/data-exposure` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/userService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/21-data-exposure` — passes on `main` (bug present).
- `server/tests/fixed/21-data-exposure` — **fails on `main`, passes on `fix/data-exposure`.**

## How to open the PR (once a remote exists)
```
git push origin fix/data-exposure
gh pr create --base main --head fix/data-exposure --title "fix(data-exposure): return a public DTO from /api/me [#21]" --body-file artifacts/data-exposure/PR.md
```
See `artifacts/data-exposure/fix-diff.diff` for the full remediation diff.
