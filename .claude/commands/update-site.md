---
description: Analyze a project and generate website content (journal / projects page) for it
---

Generate publishable website content for corticorp.com from a tracked project.

Target project: $ARGUMENTS

Steps:
1. Read the project's source, `CLAUDE.md`, and `README.md` to understand what it is,
   what's new, and what's noteworthy. Also read its registry entry in
   `projects/registry.json`.
2. Decide which page it belongs on:
   - `projects.html` — the catalog card / entry for the project.
   - `journal.html` — a dated dev-log / update post about recent progress.
3. Match the existing HTML structure, classes, and tone on that page — read the page
   first and mirror its markup exactly. Do not invent new styles.
4. Insert the new content in the right spot (newest journal entries first).
5. Show me a diff of the HTML change and a one-line summary. Do NOT deploy — that's
   a separate step (`/deploy`).
