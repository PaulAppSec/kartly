# fix(stored-xss): escape review body + product description on render [#8]

**Branch:** `fix/stored-xss` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/views/share.ejs

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/08-stored-xss` — passes on `main` (bug present).
- `server/tests/fixed/08-stored-xss` — **fails on `main`, passes on `fix/stored-xss`.**

## How to open the PR (once a remote exists)
```
git push origin fix/stored-xss
gh pr create --base main --head fix/stored-xss --title "fix(stored-xss): escape review body + product description on render [#8]" --body-file artifacts/stored-xss/PR.md
```
See `artifacts/stored-xss/fix-diff.diff` for the full remediation diff.
