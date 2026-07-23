# fix(sqli-login): parameterized account lookup on login [#2]

**Branch:** `fix/sqli-login` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/authService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/02-sqli-login-bypass` — passes on `main` (bug present).
- `server/tests/fixed/02-sqli-login-bypass` — **fails on `main`, passes on `fix/sqli-login`.**

## How to open the PR (once a remote exists)
```
git push origin fix/sqli-login
gh pr create --base main --head fix/sqli-login --title "fix(sqli-login): parameterized account lookup on login [#2]" --body-file artifacts/sqli-login/PR.md
```
See `artifacts/sqli-login/fix-diff.diff` for the full remediation diff.
