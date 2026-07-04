/**
 * CLI: List all projects in the registry
 */

import { RegistryManager } from './RegistryManager.js';

const registry = new RegistryManager();
const projects = registry.getAllProjects();

console.log('\n📋 CortiCorp Projects Registry\n');
console.log(`Total: ${projects.length} projects\n`);

for (const project of projects) {
  console.log(`• ${project.name}`);
  console.log(`  ID: ${project.id}`);
  console.log(`  Type: ${project.type} | Status: ${project.status}`);
  console.log(`  ${project.description}`);
  console.log('');
}

const byType = registry
  .getAllProjects()
  .reduce(
    (acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

console.log('--- By Type ---');
for (const [type, count] of Object.entries(byType)) {
  console.log(`${type}: ${count}`);
}
