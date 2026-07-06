/**
 * Import דגי_הים_התיכון_משפחות_ומינים.xlsx (Parks.org.il families catalog)
 *
 * Usage: node scripts/import-parks-fish-families.mjs [path-to-xlsx]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function findDefaultXlsx() {
  const downloads = path.join(process.env.USERPROFILE ?? '', 'Downloads');
  const files = fs.readdirSync(downloads).filter((f) => f.endsWith('.xlsx'));
  const encoded = files.find((f) => f.includes('D7%93') || f.includes('%D7%93%D7%92%D7%99'));
  if (encoded) return path.join(downloads, encoded);
  const hebrew = files.find((f) => f.includes('משפחות'));
  if (hebrew) return path.join(downloads, hebrew);
  return path.join(downloads, 'דגי_הים_התיכון_משפחות_ומינים.xlsx');
}

const xlsxPath = process.argv[2] ?? findDefaultXlsx();
const outPath = path.join(root, 'lib', 'mock', 'parksFishCatalog.ts');

function esc(value) {
  return JSON.stringify(value ?? '');
}

function splitNames(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFamilyHeader(text) {
  const match = text.match(/^(\d+)\.\s*משפחת\s+(.+?)\s*\(([A-Z]+)\)/i);
  if (!match) return null;
  return {
    number: Number(match[1]),
    familyHe: match[2].trim(),
    familyLatin: match[3].trim(),
  };
}

function isProtected(details, reproduction) {
  const text = `${details} ${reproduction}`;
  return /מוגן|אסור לדיג|אוכלוסייתו קטנ/i.test(text);
}

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });

const species = [];
let currentFamily = null;

for (const row of rows) {
  const c0 = String(row[0] ?? '').trim();
  if (!c0) continue;

  const family = parseFamilyHeader(c0);
  if (family) {
    currentFamily = family;
    continue;
  }

  if (c0 === 'שם הדג' || c0.startsWith('דגים לפי') || c0.startsWith('מבנה הקובץ')) continue;

  if (!currentFamily) continue;

  const officialNameHe = c0;
  const colloquialNames = splitNames(row[1]);
  const scientificName = String(row[2] ?? '').trim();
  const size = String(row[3] ?? '').trim();
  const habitat = String(row[4] ?? '').trim();
  const diet = String(row[5] ?? '').trim();
  const reproduction = String(row[6] ?? '').trim();
  const details = String(row[7] ?? '').trim();
  const sourceUrl = String(row[8] ?? '').trim();

  species.push({
    id: `pf-${String(species.length + 1).padStart(3, '0')}`,
    familyNumber: currentFamily.number,
    familyHe: currentFamily.familyHe,
    familyLatin: currentFamily.familyLatin,
    officialNameHe,
    colloquialNames,
    scientificName,
    size,
    habitat,
    diet,
    reproduction,
    details,
    sourceUrl,
    protected: isProtected(details, reproduction),
  });
}

/** Map legacy beach-profile species ids to Parks catalog ids. */
const LEGACY_TO_PARKS = {};
const aliasIndex = new Map();
for (const entry of species) {
  aliasIndex.set(entry.officialNameHe, entry.id);
  for (const alias of entry.colloquialNames) aliasIndex.set(alias, entry.id);
}
const legacyPairs = {
  'sp-1': 'לברק',
  'sp-2': 'דניס',
  'sp-3': 'מרמיר',
  'sp-4': 'פארידה',
  'sp-5': 'גומבר',
  'sp-6': 'פלמידה',
  'sp-7': 'בורי',
  'sp-8': 'לוקוס אדום',
  'sp-9': 'טרולוס',
  'sp-10': 'אינטיאס',
  'sp-11': 'ברקודה',
  'sp-12': 'סרדין',
  'sp-13': 'ברבוניה',
  'sp-14': 'סרגוס',
  'sp-15': 'אריען',
};

/** Explicit overrides when colloquial names differ between beach profiles and Parks.org.il */
const legacyOverrides = {
  'sp-8': 'pf-013',
};

function resolveLegacyParksId(alias) {
  if (aliasIndex.has(alias)) return aliasIndex.get(alias);
  for (const entry of species) {
    if (entry.colloquialNames.some((name) => name.includes(alias) || alias.includes(name))) {
      return entry.id;
    }
  }
  return undefined;
}

for (const [legacyId, alias] of Object.entries(legacyPairs)) {
  const pfId = legacyOverrides[legacyId] ?? resolveLegacyParksId(alias);
  if (pfId) LEGACY_TO_PARKS[legacyId] = pfId;
}

const lines = [];
lines.push('/**');
lines.push(' * Israeli Mediterranean fish catalog by family — Parks.org.il source.');
lines.push(' * Regenerate: npm run import:parks-fish');
lines.push(' */');
lines.push('');
lines.push('export interface ParksFishSpecies {');
lines.push('  id: string;');
lines.push('  familyNumber: number;');
lines.push('  familyHe: string;');
lines.push('  familyLatin: string;');
lines.push('  officialNameHe: string;');
lines.push('  colloquialNames: string[];');
lines.push('  scientificName: string;');
lines.push('  size: string;');
lines.push('  habitat: string;');
lines.push('  diet: string;');
lines.push('  reproduction: string;');
lines.push('  details: string;');
lines.push('  sourceUrl: string;');
lines.push('  protected: boolean;');
lines.push('}');
lines.push('');
lines.push(`export const PARKS_FISH_CATALOG: ParksFishSpecies[] = [`);
for (const e of species) {
  lines.push('  {');
  lines.push(`    id: ${esc(e.id)},`);
  lines.push(`    familyNumber: ${e.familyNumber},`);
  lines.push(`    familyHe: ${esc(e.familyHe)},`);
  lines.push(`    familyLatin: ${esc(e.familyLatin)},`);
  lines.push(`    officialNameHe: ${esc(e.officialNameHe)},`);
  lines.push(`    colloquialNames: ${JSON.stringify(e.colloquialNames)},`);
  lines.push(`    scientificName: ${esc(e.scientificName)},`);
  lines.push(`    size: ${esc(e.size)},`);
  lines.push(`    habitat: ${esc(e.habitat)},`);
  lines.push(`    diet: ${esc(e.diet)},`);
  lines.push(`    reproduction: ${esc(e.reproduction)},`);
  lines.push(`    details: ${esc(e.details)},`);
  lines.push(`    sourceUrl: ${esc(e.sourceUrl)},`);
  lines.push(`    protected: ${e.protected},`);
  lines.push('  },');
}
lines.push('];');
lines.push('');
lines.push('export const PARKS_FISH_BY_ID: Record<string, ParksFishSpecies> = Object.fromEntries(');
lines.push('  PARKS_FISH_CATALOG.map((entry) => [entry.id, entry]),');
lines.push(');');
lines.push('');
lines.push(`export const LEGACY_SPECIES_TO_PARKS: Record<string, string> = ${JSON.stringify(LEGACY_TO_PARKS, null, 2)};`);
lines.push('');
lines.push('export function findParksFishByText(query: string): ParksFishSpecies | undefined {');
lines.push('  const q = query.trim();');
lines.push('  if (!q) return undefined;');
lines.push('  const lower = q.toLowerCase();');
lines.push('  return PARKS_FISH_CATALOG.find((entry) => {');
lines.push('    if (entry.officialNameHe.includes(q)) return true;');
lines.push('    if (entry.scientificName.toLowerCase().includes(lower)) return true;');
lines.push('    return entry.colloquialNames.some((name) => name.includes(q) || name.toLowerCase().includes(lower));');
lines.push('  });');
lines.push('}');
lines.push('');

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${species.length} Parks.org.il species (${new Set(species.map((s) => s.familyLatin)).size} families) to ${outPath}`);
