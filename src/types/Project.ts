/**
 * Core project metadata types for CortiCorp projects
 */

export type ProjectType = 'plugin' | 'tool' | 'app' | 'utility';

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
