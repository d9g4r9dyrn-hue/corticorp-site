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
  /**
   * Explicit metadata for projects the CLAUDE.md parser cannot read correctly.
   * These WIN over anything parsed out of the file, because a CLAUDE.md whose
   * first heading is not a product title (the news repo opens on "The Board,
   * and who does what") would otherwise name the project after that heading.
   */
  name?: string;
  description?: string;
  /** True when the source repository is deliberately private, not merely absent. */
  repoPrivate?: boolean;
  /** The project's write-up on corticorp.com, where one exists. */
  detailPage?: string;
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
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'dynamics', 'compressor'],
    name: 'CortComp',
    description:
      'A VST3 dynamics processor that can make the softs loud and the louds ' +
      'soft past a limiter, with an INVERT mode that drives the transfer slope ' +
      'negative so louder input yields quieter output.',
  },
  {
    id: 'synth_plugin',
    pathFromCortiCorp: 'plugins/synth_plugin',
    type: 'plugin',
    status: 'active',
    version: '0.9.114',
    tags: ['audio', 'dsp', 'vst3', 'synth', 'sampler', 'ai'],
    homepage: 'https://corticorp.com/music/plugins/CortSynth/',
    repoPrivate: true,
    name: 'CortSynth',
    description:
      'A free VST3 synth, sampler and drum machine in one plugin. Dual-oscillator ' +
      'hybrid engine with physical modeling, 200+ presets, an AI Tone Designer, ' +
      'and a zero-allocation audio thread.',
  },
  {
    id: 'reverb_plugin',
    pathFromCortiCorp: 'plugins/reverb_plugin',
    type: 'plugin',
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'reverb', 'effect'],
    homepage: 'https://corticorp.com/music/plugins/CortVerb/',
    repoPrivate: true,
    name: 'CortVerb',
    description:
      'A VST3 reverb on a Hybrid FDN engine, with a central digital screen that ' +
      'visualizes the reverb across six pages, an auto-duck sidechain, and 12 ' +
      'tactile knobs. Finished and heading to release.',
  },
  {
    id: 'ironclad',
    pathFromCortiCorp: 'plugins/ironclad',
    type: 'plugin',
    status: 'beta',
    version: '0.4.7',
    tags: ['audio', 'dsp', 'vst3', 'distortion', 'effect'],
    homepage: 'https://corticorp.com/music/plugins/Ironclad/',
    name: 'Ironclad',
    description:
      'A VST3 amp-style distortion with four distinct voicings, a focused tone ' +
      'stack, cabinet and room simulation, and a bold hardware-inspired ' +
      'interface for guitars and broader audio processing.',
  },
  {
    id: 'harmonizer_plugin',
    pathFromCortiCorp: 'plugins/harmonizer_plugin',
    type: 'plugin',
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'harmonizer', 'auto-tune', 'effect'],
    name: 'CortHarm',
    description:
      'A VST3 vocal harmonizer and pitch corrector: pick a key and scale, set ' +
      'how hard the retune bites, and blend generated harmony voices under the ' +
      'lead.',
  },
  // The three single-purpose instruments split out of the all-in-one CortSynth.
  // They share its sample and synthesis engines, so the descriptions say which
  // half of CortSynth each one is rather than describing three unrelated tools.
  {
    id: 'cortkeys',
    pathFromCortiCorp: 'plugins/cortkeys',
    type: 'plugin',
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'synth', 'ai'],
    name: 'CortKeys',
    description:
      'The synthesizer half of CortSynth as its own plugin: dual oscillators, ' +
      'FM and wavetable engines, physically modelled strings and piano, a ' +
      'drag-to-wire modulation matrix, and the AI Tone Designer.',
  },
  {
    id: 'cortsampler',
    pathFromCortiCorp: 'plugins/cortsampler',
    type: 'plugin',
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'sampler'],
    name: 'CortSampler',
    description:
      'The sampler half of CortSynth as its own plugin: load, map and play your ' +
      'own samples with velocity layers, loop modes and round robin, import a ' +
      'folder or an SFZ instrument, and pull instrument packs from the Sounds panel.',
  },
  {
    id: 'cortdrum',
    pathFromCortiCorp: 'plugins/cortdrum',
    type: 'plugin',
    status: 'beta',
    version: '0.1.0',
    tags: ['audio', 'dsp', 'vst3', 'drums', 'sampler'],
    name: 'CortDrum',
    description:
      'A drum machine built on the CortSampler engine in one-shot mode: a 20-pad ' +
      'General MIDI grid with per-pad level, and kit import from a folder of ' +
      'one-shots, a folder tree, or a DrumGizmo kit.',
  },
  // Non-plugin entries. Their CLAUDE.md files are engineering briefs rather than
  // product pages, so name and description are seeded here; the seed now wins
  // over the parsed title for exactly that reason.
  {
    id: 'news',
    pathFromCortiCorp: 'news',
    type: 'app',
    status: 'active',
    tags: ['ai', 'news', 'nextjs', 'sqlite', 'maps', 'claude'],
    homepage: 'https://news.corticorp.com',
    detailPage: 'https://corticorp.com/projects/news/',
    repoPrivate: true,
    name: 'Corticorp News',
    description:
      'An AI-curated news digest that clusters dozens of paywall-free outlets ' +
      'into one synthesized summary per real-world event, checks circulating ' +
      'claims on a public Verification Desk, and runs map-driven situation ' +
      'rooms for ongoing conflicts.',
  },
  // Corticorp Finance is a separate product on its own domain, and it is served
  // by the news codebase, which is why it points at the same folder. Two seeds
  // over one path is deliberate: the catalog lists products, not repositories,
  // and a reader looking for finance.corticorp.com should find it by name.
  {
    id: 'finance',
    pathFromCortiCorp: 'news',
    type: 'app',
    status: 'active',
    tags: ['ai', 'finance', 'markets', 'nextjs', 'sqlite', 'claude'],
    homepage: 'https://finance.corticorp.com',
    detailPage: 'https://corticorp.com/projects/finance/',
    repoPrivate: true,
    name: 'Corticorp Finance',
    description:
      'A public, simulated strategy tracker: 39 model-managed portfolios that ' +
      'publish every decision and the reasoning behind it, alongside the Market ' +
      'Pulse, the persisted market data the strategies are shown, an earnings ' +
      'and macro calendar, and the AI Board that reviews the whole roster.',
  },
  {
    id: 'worlds_eye_view',
    pathFromCortiCorp: 'worlds-eye-view',
    type: 'app',
    status: 'active',
    tags: ['web', 'maps', 'webcams', 'nextjs', 'leaflet'],
    homepage: 'https://cams.corticorp.com',
    detailPage: 'https://corticorp.com/projects/worlds-eye-view/',
    name: "World's Eye View",
    description:
      'Around 34,700 public webcams quilted onto one satellite map as live ' +
      'thumbnails. Zoom in and a city fills with windows, watch one full screen ' +
      'or send several to a multicam wall, and follow cameras along a route.',
  },
  {
    id: 'algorythmic',
    pathFromCortiCorp: 'algorythmic',
    type: 'app',
    status: 'active',
    tags: ['web', 'music', 'youtube', 'playlists', 'ai', 'nextjs', 'postgres'],
    homepage: 'https://music.corticorp.com',
    detailPage: 'https://corticorp.com/projects/algorythmic/',
    repoPrivate: true,
    name: 'AlgoRythmic',
    description:
      'Build YouTube Music playlists from selection strategies you define. ' +
      'Describe a vibe in plain English and it compiles to rules you can edit, ' +
      'preview the whole queue in the browser for nothing, then save it as a ' +
      'real private playlist your car can play.',
  },
  {
    id: 'apartment_finder',
    pathFromCortiCorp: 'apartment_poc',
    type: 'app',
    status: 'active',
    tags: ['ai', 'python', 'web-scraping', 'gemini-vision', 'maps'],
    homepage: 'https://corticorp.com/projects/apartment-finder/',
    name: 'Apartment Finder',
    description:
      'A rental aggregator that scrapes six listing sources, scores every photo ' +
      'with Gemini Vision, flags likely scams, and generates a mapped, filterable ' +
      'dashboard with a detail page per unit and work-commute scoring.',
  },
  {
    id: 'catfishcheck',
    pathFromCortiCorp: 'catfishcheck',
    type: 'app',
    status: 'active',
    tags: ['osint', 'privacy', 'javascript', 'browser-only'],
    homepage: 'https://corticorp.com/projects/catfishcheck/',
    name: 'CatfishCheck',
    description:
      'A self-service tool for verifying an online identity: reverse image ' +
      'search, carrier lookup, social cross-referencing and a geo-verification ' +
      'beacon, compiled into one red-flag report. Everything stays in the browser.',
  },
  {
    id: 'corticorp-site',
    pathFromCortiCorp: 'corticorp-site',
    type: 'web',
    status: 'active',
    tags: ['web', 'typescript', 'registry', 'node'],
    homepage: 'https://corticorp.com/',
    name: 'CortiCorp Site',
    description:
      'The corticorp.com hub and this very inventory: a TypeScript scanner that ' +
      'reads each project from its own files so the published catalog cannot ' +
      'quietly drift from what is actually on disk.',
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

    // Seed first, parsed second. Every plugin seed leaves both blank and so is
    // unaffected; the apps carry a hand-written line because their CLAUDE.md
    // files are engineering briefs rather than product descriptions.
    const name = seed.name ?? parsed.name ?? seed.id;
    const description =
      seed.description ?? parsed.description ?? `${name} - CortiCorp project`;

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
    if (seed.detailPage) base.detailPage = seed.detailPage;
    // A private project still has an origin in .git/config, so publishing the
    // URL the scanner finds would put a link to a 404 on a public page. The
    // seed flag suppresses the URL and says why the link is missing instead.
    if (seed.repoPrivate) {
      base.repoPrivate = true;
    } else if (repository) {
      base.repository = repository;
    }

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
