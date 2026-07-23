# fix(cmdi): run the report exporter via execFile, no shell [#15]

**Branch:** `fix/cmdi` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/controllers/adminApiController.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/15-cmdi` — passes on `main` (bug present).
- `server/tests/fixed/15-cmdi` — **fails on `main`, passes on `fix/cmdi`.**

## How to open the PR (once a remote exists)
```
git push origin fix/cmdi
gh pr create --base main --head fix/cmdi --title "fix(cmdi): run the report exporter via execFile, no shell [#15]" --body-file artifacts/cmdi/PR.md
```
See `artifacts/cmdi/fix-diff.diff` for the full remediation diff.
