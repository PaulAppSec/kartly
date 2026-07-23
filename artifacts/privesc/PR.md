# fix(authz-admin): require ADMIN role on the admin JSON API [#6]

**Branch:** `fix/authz-admin` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/routes/adminApi.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/06-privesc` — passes on `main` (bug present).
- `server/tests/fixed/06-privesc` — **fails on `main`, passes on `fix/authz-admin`.**

## How to open the PR (once a remote exists)
```
git push origin fix/authz-admin
gh pr create --base main --head fix/authz-admin --title "fix(authz-admin): require ADMIN role on the admin JSON API [#6]" --body-file artifacts/privesc/PR.md
```
See `artifacts/privesc/fix-diff.diff` for the full remediation diff.
