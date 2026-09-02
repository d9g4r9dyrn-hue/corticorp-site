/**
 * Core project metadata types for CortiCorp projects
 */

// 'web' exists because projects.html has always rendered a third filter chip for
// it (TYPE_LABEL there lists plugin, app and web) and the hand-maintained
// fallback registry already used it. Leaving it out of the union meant the
// scanner could not produce a project the page was already prepared to show.
export type ProjectType = 'plugin' | 'tool' | 'app' | 'utility' | 'web';

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  version: string;
  author?: string;
  homepage?: string;
  repository?: string;
  releaseDate?: string;
  status: 'active' | 'beta' | 'archived' | 'planned';
  tags: string[];
  pathFromCortiCorp: string; // Relative path from corticorp/ directory
  /**
   * True when the source lives in a repository that is deliberately not public.
   * Distinct from a missing `repository`, which means the scanner found no git
   * remote at all; the catalog page says "Private repo" for the first and
   * "No repo yet" for the second, and reading them as the same thing would
   * advertise a finished project as unstarted.
   */
  repoPrivate?: boolean;
  /**
   * The project's own page on corticorp.com, where one exists. Separate from
   * `homepage`, which for the hosted products is the live application on its
   * own domain; without both, a catalog card could send a reader off-site with
   * no way back to the write-up that explains what they are looking at.
   */
  detailPage?: string;
}

export interface PluginMetadata extends ProjectMetadata {
  type: 'plugin';
  formats?: string[]; // e.g., ["VST3", "Standalone", "AU"]
  platforms?: string[]; // e.g., ["Windows", "macOS", "Linux"]
  parameters?: Record<string, ParameterInfo>;
}

export interface ParameterInfo {
  name: string;
  description?: string;
  min?: number;
  max?: number;
  default?: number;
  unit?: string;
}

export interface ToolMetadata extends ProjectMetadata {
  type: 'tool';
  executable?: string;
  interface: 'cli' | 'web' | 'gui' | 'api';
}

export interface AppMetadata extends ProjectMetadata {
  type: 'app';
  interface: 'web' | 'mobile' | 'desktop';
  url?: string;
}

export type AnyProjectMetadata =
  | PluginMetadata
  | ToolMetadata
  | AppMetadata
  | ProjectMetadata;

export interface Registry {
  projects: Record<string, AnyProjectMetadata>;
  lastUpdated: string;
  version: string;
}
