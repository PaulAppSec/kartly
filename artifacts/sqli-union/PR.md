# fix(sqli): parameterize product search query [#1]

**Branch:** `fix/sqli` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/searchService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/01-sqli-search` — passes on `main` (bug present).
- `server/tests/fixed/01-sqli-search` — **fails on `main`, passes on `fix/sqli`.**

## How to open the PR (once a remote exists)
```
git push origin fix/sqli
gh pr create --base main --head fix/sqli --title "fix(sqli): parameterize product search query [#1]" --body-file artifacts/sqli-union/PR.md
```
See `artifacts/sqli-union/fix-diff.diff` for the full remediation diff.
