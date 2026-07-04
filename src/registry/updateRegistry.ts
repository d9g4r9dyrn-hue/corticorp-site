/**
 * CLI: re-scan every known project and rewrite the registry from scratch.
 *
 *   npm run registry:update            # full clean rebuild (prunes stale entries)
 *
 * This is the "sync" command — after touching a plugin's CLAUDE.md, run it to
 * pull the latest name/description/parameters into projects/registry.json.
 */

import { RegistryManager } from './RegistryManager.js';
import { ProjectScanner } from '../scanner/ProjectScanner.js';

async function main() {
  console.log('🔄 Rebuilding CortiCorp registry from source...\n');

  const scanner = new ProjectScanner();
  const scanned = await scanner.scanAllProjects();

  const registry = new RegistryManager();
  registry.replaceProjects(scanned);

  console.log(`\n✓ Registry rebuilt with ${scanned.length} projects.`);
  console.log('  Saved to projects/registry.json\n');
}

main().catch((error) => {
  console.error('Registry update failed:', error);
  process.exit(1);
});
