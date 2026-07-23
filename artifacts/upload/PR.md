# fix(upload): validate uploads by magic bytes [#13]

**Branch:** `fix/upload` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/sellerService.ts
  - server/src/services/userService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/13-upload` — passes on `main` (bug present).
- `server/tests/fixed/13-upload` — **fails on `main`, passes on `fix/upload`.**

## How to open the PR (once a remote exists)
```
git push origin fix/upload
gh pr create --base main --head fix/upload --title "fix(upload): validate uploads by magic bytes [#13]" --body-file artifacts/upload/PR.md
```
See `artifacts/upload/fix-diff.diff` for the full remediation diff.
