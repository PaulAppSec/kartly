# fix(csrf): restore CSRF guard on PATCH /api/me [#11]

**Branch:** `fix/csrf` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/routes/me.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/11-csrf` — passes on `main` (bug present).
- `server/tests/fixed/11-csrf` — **fails on `main`, passes on `fix/csrf`.**

## How to open the PR (once a remote exists)
```
git push origin fix/csrf
gh pr create --base main --head fix/csrf --title "fix(csrf): restore CSRF guard on PATCH /api/me [#11]" --body-file artifacts/csrf/PR.md
```
See `artifacts/csrf/fix-diff.diff` for the full remediation diff.
