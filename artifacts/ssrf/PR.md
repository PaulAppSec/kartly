# fix(ssrf): SSRF-safe fetch for image import from URL [#12]

**Branch:** `fix/ssrf` → `main` — **DO NOT MERGE.** The PR diff is the teaching
artifact; `main` intentionally stays vulnerable.

## Files changed
  - server/src/services/sellerService.ts
  - server/src/services/userService.ts

## Proof (both-outcomes, same attack code)
- `server/tests/exploits/12-ssrf` — passes on `main` (bug present).
- `server/tests/fixed/12-ssrf` — **fails on `main`, passes on `fix/ssrf`.**

## How to open the PR (once a remote exists)
```
git push origin fix/ssrf
gh pr create --base main --head fix/ssrf --title "fix(ssrf): SSRF-safe fetch for image import from URL [#12]" --body-file artifacts/ssrf/PR.md
```
See `artifacts/ssrf/fix-diff.diff` for the full remediation diff.
