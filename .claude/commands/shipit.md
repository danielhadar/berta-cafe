---
description: Ship the Berta Coffee punch card to prod — commit pending work, push to origin/main, and verify the live site picks up the change
---

You are shipping the Berta Coffee punch card to production. "Prod" means `origin/main` on GitHub — Vercel watches that branch and auto-deploys. The live site is **https://berta-coffee-demo.danielhadar.com** (canonical) and the auto-generated `*.vercel.app` URL (mirror).

## Goal

Get everything the user is working on onto `origin/main`, safely, with a sensible commit message. Finish with a clean working tree, local in sync with origin, and the live site serving the new build.

## Steps

**1. Survey state.** Run `git status` and `git log origin/main..HEAD --oneline` and `git fetch origin` in parallel.

**2. Handle stale locks.** If any git command fails with `Unable to create '.git/*.lock': File exists` and no git processes are running (`ps aux | grep -v grep | grep -i git`), the lock is stale — remove and retry.

**3. Decide what to commit.**
- Modified tracked files → stage with explicit paths (not `git add -A`).
- New untracked files → only stage things that are clearly part of the project (HTML/CSS/JS/images, manifest changes). Be cautious about ad-hoc files like scratch demos (`*-demo.html`), local notes, scripts, screenshots. When in doubt, ask.
- **Never** stage anything containing secrets. The `PUNCH_CODE` in `app.js` is by design ("private" means not on the public GitHub UI; it is necessarily visible in the deployed JS bundle to anyone visiting the site). Don't add server-side secrets or `.env`-style files to the repo without asking.

**4. Write the commit message.**
- Match the repo's existing style: lowercase, short subject, no trailing period. Multiple concerns separated by semicolons or commas.
- Use a body (HEREDOC) only when there are multiple distinct changes worth itemizing.
- Examples of the style:
  - `palette: switch to olive grove (green #3F5C38)`
  - `mobile: remove top white padding under header`
  - `qr: point card to live url; bump theme color`

**5. Handle divergence.** If push is rejected because remote has commits you don't:
- Show the user what's on the other side (`git log HEAD..origin/main --oneline`, `git diff --name-only HEAD...origin/main`).
- If it's clean (no conflict overlap) → `git pull --rebase origin main` and push.
- If there are real conflicting edits → stop and show the user before doing anything.

**6. Push.** `git push origin main`. Then `git status` to confirm clean + tracking up to date.

**7. Verify the live site.** After push, give Vercel ~30s to pick up the build, then probe:
- `curl -sI https://berta-coffee-demo.danielhadar.com/ -o /dev/null -w "%{http_code}\n"` — should be `200`.
- Optionally fetch a known string from the latest change to confirm content swapped (e.g. `curl -s https://berta-coffee-demo.danielhadar.com/style.css | grep -m1 "<some new selector>"`).
- If it's still serving the old build, wait another 30–60s and re-probe. Vercel deploys are usually under a minute for static sites.

**8. Report.** Tell the user:
- Which commits went to origin (SHA range, one-line subjects).
- Confirmation the live URL is serving the new build (or the latest probe status if still building).

## Guardrails

- **Never** `--force` push. If something seems off, stop and explain.
- **Never** skip hooks (`--no-verify`) unless the user explicitly asks.
- **Don't** stage `.DS_Store`, `node_modules/`, or anything ignored — they're already in `.gitignore`, but new patterns may appear.
- **Don't** run destructive operations (`reset --hard`, `clean -f`, branch deletions) without explicit confirmation. If the working tree looks unexpectedly dirty, investigate — could be in-progress work.
- If the user has unpushed local commits unrelated to the current intent, flag before pushing.
- If there's no work to ship (nothing staged, nothing unpushed), say so and stop. Don't create empty commits or fake activity.

## Scope notes

- This is a static site (vanilla HTML/CSS/JS, no build step). Pushing to `main` is enough to trigger a deploy — there's nothing to compile, install, or test before the push.
- The repo is private. Vercel has authorized read access via the GitHub integration.
- DNS lives in Cloudflare. The custom domain `berta-coffee-demo.danielhadar.com` is a CNAME pointing to Vercel.
