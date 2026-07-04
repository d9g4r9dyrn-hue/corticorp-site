---
description: Register a new CortiCorp project in the hub and refresh the registry
---

Register a new project in the CortiCorp hub.

Project to add: $ARGUMENTS

Steps:
1. Add the project's folder name to the `KNOWN_PROJECTS` list in
   `src/scanner/ProjectScanner.ts`.
2. Confirm the folder exists at `../<name>` (or under `../plugins/<name>`) relative
   to the corticorp root, and read its `CLAUDE.md` / `README.md` to gather metadata
   (name, type, description, version, tags, formats).
3. Run `npm run build && npm run scan` to auto-discover and write the registry.
4. Run `npm run registry:list` and confirm the new project appears.
5. Summarize what was added and flag anything the scanner couldn't infer.
