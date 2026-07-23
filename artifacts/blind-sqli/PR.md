# fix(blind-sqli): allowlist the sort column in product search [#3]

**Branch:** `fix/blind-sqli` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/data/productRepo.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/03-blind-sqli` — passes on `main` (bug present).
- `server/tests/fixed/03-blind-sqli` — **fails on `main`, passes on `fix/blind-sqli`.**

## How to open the PR (once a remote exists)
```
git push origin fix/blind-sqli
gh pr create --base main --head fix/blind-sqli --title "fix(blind-sqli): allowlist the sort column in product search [#3]" --body-file artifacts/blind-sqli/PR.md
```
See `artifacts/blind-sqli/fix-diff.diff` for the full remediation diff.
