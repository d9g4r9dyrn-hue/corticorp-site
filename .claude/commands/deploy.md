---
description: Build, verify, and publish the site to corticorp.com (GitHub Pages)
---

Publish the current site to corticorp.com.

Steps:
1. Run `npm run build` and confirm it compiles cleanly (no tsc errors).
2. Run `git status` and `git diff` and show me exactly what changed. Confirm no
   generated/gitignored files (`dist/`, `node_modules/`, `projects/registry.json`)
   are staged.
3. Sanity-check the published HTML pages (`index.html`, `journal.html`,
   `projects.html`) for obviously broken markup or leftover placeholder text.
4. Stage the intended files, commit with a clear message describing the update, and
   push to the default branch (GitHub Pages deploys from it; CNAME = corticorp.com).
5. Report the commit hash and remind me it may take a minute for Pages to go live.

Do not force-push or rewrite history.
