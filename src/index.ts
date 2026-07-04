/**
 * CortiCorp Site Hub - Central project management and registry
 */

import { RegistryManager } from './registry/RegistryManager.js';
import { ProjectScanner } from './scanner/ProjectScanner.js';

async function main() {
  console.log('🎵 CortiCorp Site Hub - Project Registry Manager\n');

  // Initialize registry
  const registry = new RegistryManager();
  console.log(`Loaded registry with ${registry.getAllProjects().length} projects.\n`);

  // Initialize scanner
  const scanner = new ProjectScanner();
  console.log('Scanning for projects...\n');

  const scannedProjects = await scanner.scanAllProjects();
  console.log(`\nDiscovered ${scannedProjects.length} projects.\n`);

  // Rebuild the registry from the scan so stale entries are pruned.
  registry.replaceProjects(scannedProjects);
  console.log(`  ✓ Registry synced with ${scannedProjects.length} projects.`);

  // Display summary
  console.log('\n--- Registry Summary ---\n');
  console.log(registry.exportAsMarkdown());

  // Save to file
  registry.saveRegistry();
  console.log(
    '\n✓ Registry updated and saved to projects/registry.json'
  );
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
