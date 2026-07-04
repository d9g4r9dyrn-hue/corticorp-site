/**
 * ProjectScanner — auto-discovers CortiCorp projects and derives metadata.
 *
 * Each project is seeded in KNOWN_PROJECTS with the facts that can't be inferred
 * (id, folder path, type, status, tags). Everything else — display name, a real
 * description, the parameter list, supported formats, and the git remote — is
 * read from the project's own files at scan time (chiefly CLAUDE.md), so the
 * registry stays in sync with the source of truth instead of drifting.
 *
 * Run from the corticorp-site directory; paths resolve against the parent
 * corticorp/ folder.
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  AnyProjectMetadata,
  ParameterInfo,
  ProjectType,
} from '../types/Project.js';

// ESM __dirname. Compiled file lives at dist/scanner/, so ../../../ is corticorp/.
const __dirname = dirname(fileURLToPath(import.meta.url));
const CORTICORP_ROOT = join(__dirname, '../../../');

/** A project's non-inferrable facts. The scanner enriches everything else. */
export interface ProjectSeed {
  id: string;
  /** Path from the corticorp/ root, e.g. "plugins/compressor_plugin". */
  pathFromCortiCorp: string;
  type: ProjectType;
  status: AnyProjectMetadata['status'];
  tags: string[];
  version?: string;
  homepage?: string;
  /** Fallbacks for projects without a CLAUDE.md to parse. */
  name?: string;
  description?: string;
}

/**
 * The projects the hub tracks. Add a folder here, then `npm run scan`.
 * Plugins carry a CLAUDE.md the scanner mines for name/description/parameters.
 * Non-plugin projects are seeded with an explicit name + description.
 */
export const KNOWN_PROJECTS: ProjectSeed[] = [
  {
    id: 'compressor_plugin',
    pathFromCortiCorp: 'plugins/compressor_plugin',
    type: 'plugin',
    status: 'active',
    tags: ['audio', 'dsp', 'vst3', 'dynamics', 'compressor'],
  },
  {
    id: 'synth_plugin',
    pathFromCortiCorp: 'plugins/synth_plugin',
    type: 'plugin',
    status: 'active',
    tags: ['audio', 'dsp', 'vst3', 'synth', 'sampler', 'ai'],
    homepage: 'https://corticorp.com/music/plugins/CortSynth/',
  },
  {
    id: 'reverb_plugin',
    pathFromCortiCorp: 'plugins/reverb_plugin',
    type: 'plugin',
    status: 'beta',
    tags: ['audio', 'dsp', 'vst3', 'reverb', 'effect'],
    homepage: 'https://corticorp.com/music/plugins/CortVerb/',
  },
  {
    id: 'ironclad',
    pathFromCortiCorp: 'plugins/ironclad',
    type: 'plugin',
    status: 'beta',
    tags: ['audio', 'dsp', 'vst3', 'distortion', 'effect'],
    homepage: 'https://corticorp.com/music/plugins/Ironclad/',
  },
  {
    id: 'harmonizer_plugin',
    pathFromCortiCorp: 'plugins/harmonizer_plugin',
    type: 'plugin',
    status: 'beta',
    tags: ['audio', 'dsp', 'vst3', 'harmonizer', 'auto-tune', 'effect'],
  },
];

interface ParsedClaudeMd {
  name?: string;
  description?: string;
  parameters?: Record<string, ParameterInfo>;
  formats?: string[];
}

export class ProjectScanner {
  private corticorpRoot: string;

  constructor(corticorpRoot: string = CORTICORP_ROOT) {
    this.corticorpRoot = corticorpRoot;
  }

  /** Discover and enrich every seeded project. */
  public async scanAllProjects(): Promise<AnyProjectMetadata[]> {
    const results: AnyProjectMetadata[] = [];
    for (const seed of KNOWN_PROJECTS) {
      const project = this.scanProject(seed);
      if (project) {
        results.push(project);
        console.log(`  ✓ Scanned ${project.name} (${seed.id})`);
      } else {
        console.warn(
          `  ✗ Skipped ${seed.id} — folder not found at ${seed.pathFromCortiCorp}`
        );
      }
    }
    return results;
  }

  /** Enrich a single seed into full metadata, or null if the folder is missing. */
  public scanProject(seed: ProjectSeed): AnyProjectMetadata | null {
    const projectDir = join(this.corticorpRoot, seed.pathFromCortiCorp);
    if (!existsSync(projectDir)) {
      return null;
    }

    const parsed = this.parseClaudeMd(join(projectDir, 'CLAUDE.md'));
    const repository = this.readGitRemote(projectDir);

    const name = parsed.name ?? seed.name ?? seed.id;
    const description =
      parsed.description ?? seed.description ?? `${name} — CortiCorp project`;

    const base: AnyProjectMetadata = {
      id: seed.id,
      name,
      description,
      type: seed.type,
      version: seed.version ?? '1.0.0',
      status: seed.status,
      tags: seed.tags,
      pathFromCortiCorp: seed.pathFromCortiCorp,
    };
    if (seed.homepage) base.homepage = seed.homepage;
    if (repository) base.repository = repository;

    if (seed.type === 'plugin') {
      return {
        ...base,
        type: 'plugin',
        formats: parsed.formats ?? [],
        platforms: ['Windows'],
        parameters: parsed.parameters,
      };
    }

    return base;
  }

  /** Extract name, description, parameters, and formats from a CLAUDE.md file. */
  private parseClaudeMd(claudeMdPath: string): ParsedClaudeMd {
    if (!existsSync(claudeMdPath)) {
      return {};
    }

    const text = readFileSync(claudeMdPath, 'utf-8');
    const lines = text.split(/\r?\n/);

    return {
      ...this.parseTitle(lines),
      parameters: this.parseParameters(lines),
      formats: this.parseFormats(text),
    };
  }

  /** First `# Name - Descriptor` line → { name, description }. */
  private parseTitle(lines: string[]): { name?: string; description?: string } {
    const titleLine = lines.find((l) => /^#\s+\S/.test(l));
    if (!titleLine) return {};

    const title = titleLine.replace(/^#\s+/, '').trim();
    // Split on the first hyphen / en-dash / em-dash surrounded by spaces.
    const match = title.match(/^(.*?)\s+[-–—]\s+(.*)$/);
    if (match) {
      return { name: match[1].trim(), description: match[2].trim() };
    }
    return { name: title };
  }

  /**
   * Collect parameter names from the `## Parameters` block. CLAUDE.md lists
   * names (UPPER_SNAKE tokens), not ranges, so we capture names only.
   */
  private parseParameters(
    lines: string[]
  ): Record<string, ParameterInfo> | undefined {
    const start = lines.findIndex((l) => /^##\s+Parameters/i.test(l));
    if (start === -1) return undefined;

    const body: string[] = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (/^##\s+/.test(lines[i])) break; // next section ends the block
      body.push(lines[i]);
    }

    const blob = body.join(' ');
    const names = blob.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b[A-Z]{2,}\b/g);
    if (!names) return undefined;

    const params: Record<string, ParameterInfo> = {};
    for (const raw of names) {
      const name = raw.trim();
      // Drop stray acronyms that aren't parameters.
      if (['LP', 'HP', 'BP', 'AU', 'AAX', 'MIDI', 'XML'].includes(name)) continue;
      if (!params[name]) params[name] = { name };
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }

  /** Detect supported plugin formats mentioned anywhere in the doc. */
  private parseFormats(text: string): string[] {
    const found: string[] = [];
    for (const fmt of ['VST3', 'Standalone', 'AU', 'AAX']) {
      if (new RegExp(`\\b${fmt}\\b`).test(text) && !found.includes(fmt)) {
        found.push(fmt);
      }
    }
    return found;
  }

  /** Pull the origin remote URL from a project's .git/config, if present. */
  private readGitRemote(projectDir: string): string | undefined {
    const configPath = join(projectDir, '.git', 'config');
    if (!existsSync(configPath)) return undefined;
    try {
      const config = readFileSync(configPath, 'utf-8');
      const match = config.match(/\[remote "origin"\][^[]*?url\s*=\s*(.+)/);
      return match ? match[1].trim() : undefined;
    } catch {
      return undefined;
    }
  }
}
