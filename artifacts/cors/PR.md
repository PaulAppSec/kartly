# fix(cors): strict origin allowlist for the API [#23]

**Branch:** `fix/cors` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/app.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/23-cors` — passes on `main` (bug present).
- `server/tests/fixed/23-cors` — **fails on `main`, passes on `fix/cors`.**

## How to open the PR (once a remote exists)
```
git push origin fix/cors
gh pr create --base main --head fix/cors --title "fix(cors): strict origin allowlist for the API [#23]" --body-file artifacts/cors/PR.md
```
See `artifacts/cors/fix-diff.diff` for the full remediation diff.
