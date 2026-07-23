# fix(dom-xss): write the fragment note via textContent [#10]

**Branch:** `fix/dom-xss` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/views/share.ejs

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/10-dom-xss` — passes on `main` (bug present).
- `server/tests/fixed/10-dom-xss` — **fails on `main`, passes on `fix/dom-xss`.**

## How to open the PR (once a remote exists)
```
git push origin fix/dom-xss
gh pr create --base main --head fix/dom-xss --title "fix(dom-xss): write the fragment note via textContent [#10]" --body-file artifacts/dom-xss/PR.md
```
See `artifacts/dom-xss/fix-diff.diff` for the full remediation diff.
