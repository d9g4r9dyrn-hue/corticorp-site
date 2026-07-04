/**
 * Central registry manager for all CortiCorp projects
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AnyProjectMetadata, Registry } from '../types/Project.js';

const REGISTRY_FILE = 'projects/registry.json';
const DEFAULT_REGISTRY: Registry = {
  projects: {},
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
};

export class RegistryManager {
  private registry: Registry;
  private registryPath: string;

  constructor(registryPath: string = REGISTRY_FILE) {
    this.registryPath = registryPath;
    this.registry = this.loadRegistry();
  }

  private loadRegistry(): Registry {
    if (existsSync(this.registryPath)) {
      try {
        const data = readFileSync(this.registryPath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.warn(`Failed to load registry from ${this.registryPath}:`, error);
        return DEFAULT_REGISTRY;
      }
    }
    return DEFAULT_REGISTRY;
  }

  public saveRegistry(): void {
    this.registry.lastUpdated = new Date().toISOString();
    writeFileSync(
      this.registryPath,
      JSON.stringify(this.registry, null, 2),
      'utf-8'
    );
    console.log(`Registry saved to ${this.registryPath}`);
  }

  public addProject(project: AnyProjectMetadata): void {
    this.registry.projects[project.id] = project;
    this.saveRegistry();
  }

  /**
   * Replace the entire project set in one shot. Use this after a full scan so
   * that projects no longer discovered are pruned instead of lingering.
   */
  public replaceProjects(projects: AnyProjectMetadata[]): void {
    this.registry.projects = {};
    for (const project of projects) {
      this.registry.projects[project.id] = project;
    }
    this.saveRegistry();
  }

  public getProject(id: string): AnyProjectMetadata | undefined {
    return this.registry.projects[id];
  }

  public getAllProjects(): AnyProjectMetadata[] {
    return Object.values(this.registry.projects);
  }

  public getProjectsByType(type: string): AnyProjectMetadata[] {
    return this.getAllProjects().filter((p) => p.type === type);
  }

  public getProjectsByStatus(status: string): AnyProjectMetadata[] {
    return this.getAllProjects().filter((p) => p.status === status);
  }

  public removeProject(id: string): void {
    delete this.registry.projects[id];
    this.saveRegistry();
  }

  public updateProject(id: string, updates: Partial<AnyProjectMetadata>): void {
    const project = this.getProject(id);
    if (project) {
      this.registry.projects[id] = { ...project, ...updates };
      this.saveRegistry();
    }
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  public exportAsJSON(): string {
    return JSON.stringify(this.registry, null, 2);
  }

  public exportAsMarkdown(): string {
    let md = '# CortiCorp Projects Registry\n\n';
    md += `*Last updated: ${this.registry.lastUpdated}*\n\n`;

    const byType: Record<string, AnyProjectMetadata[]> = {};
    for (const project of this.getAllProjects()) {
      if (!byType[project.type]) {
        byType[project.type] = [];
      }
      byType[project.type].push(project);
    }

    for (const [type, projects] of Object.entries(byType)) {
      md += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      for (const project of projects) {
        md += `### ${project.name}\n`;
        md += `- **ID**: \`${project.id}\`\n`;
        md += `- **Description**: ${project.description}\n`;
        md += `- **Version**: ${project.version}\n`;
        md += `- **Status**: ${project.status}\n`;
        if (project.repository) {
          md += `- **Repository**: [Link](${project.repository})\n`;
        }
        if (project.homepage) {
          md += `- **Homepage**: [Link](${project.homepage})\n`;
        }
        if (project.tags.length > 0) {
          md += `- **Tags**: ${project.tags.map((t) => `\`${t}\``).join(', ')}\n`;
        }
        md += '\n';
      }
    }

    return md;
  }
}
