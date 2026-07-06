/**
 * Export fish identification catalog for Supabase edge function.
 * Usage: node scripts/export-fish-id-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function main() {
  const { FISH_IDENTIFICATION_CATALOG } = await import('../lib/fishRecognition/identificationCatalog.ts');
  const outPath = path.join(root, 'supabase', 'functions', '_shared', 'fish-id-catalog.json');
  fs.writeFileSync(outPath, JSON.stringify(FISH_IDENTIFICATION_CATALOG, null, 2), 'utf8');
  console.log(`Wrote ${FISH_IDENTIFICATION_CATALOG.length} species to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
