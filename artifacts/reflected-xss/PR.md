# fix(reflected-xss): escape the reflected search term [#9]

**Branch:** `fix/reflected-xss` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/views/share.ejs

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/09-reflected-xss` — passes on `main` (bug present).
- `server/tests/fixed/09-reflected-xss` — **fails on `main`, passes on `fix/reflected-xss`.**

## How to open the PR (once a remote exists)
```
git push origin fix/reflected-xss
gh pr create --base main --head fix/reflected-xss --title "fix(reflected-xss): escape the reflected search term [#9]" --body-file artifacts/reflected-xss/PR.md
```
See `artifacts/reflected-xss/fix-diff.diff` for the full remediation diff.
