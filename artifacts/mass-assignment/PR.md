# fix(mass-assignment): strip unknown fields + explicit user create [#7]

**Branch:** `fix/mass-assignment` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/schemas/authSchemas.ts
  - server/src/services/authService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/07-mass-assignment` — passes on `main` (bug present).
- `server/tests/fixed/07-mass-assignment` — **fails on `main`, passes on `fix/mass-assignment`.**

## How to open the PR (once a remote exists)
```
git push origin fix/mass-assignment
gh pr create --base main --head fix/mass-assignment --title "fix(mass-assignment): strip unknown fields + explicit user create [#7]" --body-file artifacts/mass-assignment/PR.md
```
See `artifacts/mass-assignment/fix-diff.diff` for the full remediation diff.
