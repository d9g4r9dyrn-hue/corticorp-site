# CortiCorp Site Hub

Central project registry and management hub for all CortiCorp Claude code projects (plugins, tools, finders, etc). Decoupled from any specific application and designed to keep corticorp.com updated with project information.

## Structure

```
corticorp-site/
├── src/
│   ├── types/              # TypeScript interfaces (Project, Plugin, etc)
│   ├── registry/           # Registry manager and query tools
│   ├── scanner/            # Auto-discovery scanner for projects
│   └── index.ts            # Main entry point
├── projects/               # Registry output and project metadata
└── package.json
```

## Projects Tracked

Fifteen projects, seeded in `KNOWN_PROJECTS` in `src/scanner/ProjectScanner.ts`.

Hosted products:
- **Corticorp News** (news.corticorp.com) - AI-curated news digest
- **Corticorp Finance** (finance.corticorp.com) - simulated strategy tracker; split out
  of News in late August 2026, and served by the same repository, which is why both
  seeds point at the `news` folder
- **World's Eye View** (cams.corticorp.com) - public webcams on a satellite map
- **AlgoRythmic** (music.corticorp.com) - YouTube Music playlist builder

Tools:
- **Apartment Finder** - rental aggregator with vision-scored photos
- **CatfishCheck** - browser-only identity verification tool
- **CortiCorp Site** - this hub

VST3 plugins: **CortSynth**, **CortVerb**, **Ironclad**, **CortComp**, **CortHarm**,
and the three single-purpose instruments split out of CortSynth: **CortKeys**,
**CortSampler**, **CortDrum**.

A seed's `name` and `description` win over anything parsed from the project's
`CLAUDE.md`, because several of those files open on an engineering heading rather
than a product title. Set `repoPrivate: true` rather than relying on a missing
remote: the scanner reads `.git/config` and would otherwise publish a link to a
repository that answers 404.

## Usage

### Build
```bash
npm install
npm run build
```

### Scan Projects
Auto-discover all projects and update registry:
```bash
npm run scan
```

### List Projects
View all registered projects:
```bash
npm run registry:list
```

## How to Use with Claude

1. **Register a project** — Add it to KNOWN_PROJECTS in `src/scanner/ProjectScanner.ts`
2. **Scan** — Run `npm run scan` to auto-discover metadata
3. **Update the site** — Ask Claude: *"Look at project X and generate an update post for corticorp.com"*
4. **Claude analyzes** — Claude reads the plugin/app source, CLAUDE.md file, etc.
5. **Post content** — Claude generates Markdown/HTML ready for the website

## Registry Format

Projects are stored in `projects/registry.json`:

```json
{
  "projects": {
    "compressor_plugin": {
      "id": "compressor_plugin",
      "name": "CortComp",
      "type": "plugin",
      "status": "active",
      "version": "1.0.0",
      "description": "...",
      "pathFromCortiCorp": "compressor_plugin",
      "tags": ["audio", "dsp", "vst3"],
      "formats": ["VST3", "Standalone"],
      ...
    }
  }
}
```

## Extending

To add a new project:
1. Add folder name to `KNOWN_PROJECTS` in `ProjectScanner.ts`
2. Run `npm run scan` to auto-discover
3. Or manually add an entry to the registry

To generate website content, ask Claude to analyze a project and export Markdown/HTML for the site.
