/**
 * Import mediterranean_fish_guide_he.xlsx into lib/mock/mediterraneanFishGuide.ts
 *
 * Usage: node scripts/import-mediterranean-fish-guide.mjs [path-to-xlsx]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultXlsx = path.join(process.env.USERPROFILE ?? '', 'Downloads', 'mediterranean_fish_guide_he.xlsx');
const xlsxPath = process.argv[2] ?? defaultXlsx;
const outPath = path.join(root, 'lib', 'mock', 'mediterraneanFishGuide.ts');

const ENGLISH_NAMES = {
  'אינטיאס': 'Amberjack',
  'אראס': 'Rabbitfish',
  'אוט-אוט': 'Small sole',
  'אריען': 'Greater amberjack',
  'בורי': 'Mullet',
  'בורי טוברה': 'Thin-lipped mullet',
  'בורי דהבן': 'Golden mullet',
  'בורי בודמאר': 'Thick-lipped mullet',
  'בוחלוק': 'Small flatfish',
  'בן גוריון': 'Red Sea goatfish',
  'ברבוניה': 'Red mullet',
  'בוניטו': 'Bonito',
  'ברקודה': 'Barracuda',
  'גומבר': 'Bluefish',
  'גרבידה': 'Flathead grey mullet',
  'דג חרב': 'Swordfish',
  'דוראדו': 'Mahi-mahi',
  'דניס': 'Gilthead bream',
  'חדאד': 'White seabream',
  'טונית אטלנטית': 'Atlantic bluefin tuna',
  'טונה אלבקור': 'Albacore tuna',
  'טונה כחולת סנפיר': 'Bluefin tuna',
  'טונה צהובת סנפיר': 'Yellowfin tuna',
  'טרולוס': 'Common sole',
  'טלביזיה': 'Silverside',
  'כחלה': 'Painted comber',
  'לבט': 'Flatfish',
  'לברק': 'European sea bass',
  'לברק נקוד': 'Spotted sea bass',
  'לוקוס אירדי': 'Dusky grouper',
  'לוקוס לבן': 'White grouper',
  'לוקוס אדום': 'Red grouper',
  'לוקוס דבה': 'Honeycomb grouper',
  'לובוס': 'Mediterranean moray',
  'מוסר': 'Moray eel',
  'מרמיר': 'Sand steenbras',
  'נצרן': 'Meagre',
  'סאינאס': 'Saddled seabream',
  'סולבי': 'Two-banded seabream',
  'סרגוס': 'White seabream',
  'סרדין': 'Sardine',
  'עספור': 'Common pandora',
  'פלמידה': 'Chub mackerel',
  'שינן הניבים': 'Common dentex',
};

const LEGACY_SPECIES_ID_MAP = {
  'sp-1': 'mf-028',
  'sp-2': 'mf-018',
  'sp-3': 'mf-036',
  'sp-4': 'mf-040',
  'sp-5': 'mf-014',
  'sp-6': 'mf-043',
  'sp-7': 'mf-005',
  'sp-8': 'mf-030',
  'sp-9': 'mf-024',
  'sp-10': 'mf-001',
  'sp-11': 'mf-013',
  'sp-12': 'mf-041',
  'sp-13': 'mf-011',
  'sp-14': 'mf-019',
  'sp-15': 'mf-004',
};

function esc(value) {
  return JSON.stringify(value ?? '');
}

function isMissing(value) {
  if (!value || typeof value !== 'string') return true;
  const t = value.trim();
  return !t || t === 'לא צוין' || t.startsWith('לא צוין') || t.startsWith('העמוד מציין');
}

function bilingual(heValue, enFallback) {
  const he = (heValue ?? '').trim() || 'לא צוין במדריך.';
  const en = isMissing(heValue) ? enFallback : he;
  return { en, he };
}

function splitAliases(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugId(num) {
  return `mf-${String(num).padStart(3, '0')}`;
}

const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

const entries = rows.map((row) => {
  const num = Number(row['#'] ?? row['__EMPTY'] ?? 0);
  const hebrewName = String(row['שם הדג'] ?? '').trim();
  const aliases = splitAliases(row['שמות נוספים']);
  const englishName = ENGLISH_NAMES[hebrewName] ?? hebrewName;
  const description = bilingual(row['תיאור / זיהוי קצר'], 'No detailed description in the guide.');
  const habitat = bilingual(row['בית גידול / אזור'], 'Habitat not specified in the guide.');
  const diet = bilingual(row['תזונה'], 'Diet not specified in the guide.');
  const sizeSeason = bilingual(row['גודל / עונה'], 'Size/season not specified in the guide.');
  const cookingMethods = bilingual(row['שיטות הכנה מומלצות'], 'Preparation methods not specified in the guide.');
  const handlingNotes = bilingual(row['הערות טיפול / זהירות'], 'Handling notes not specified in the guide.');
  const infoStatus = String(row['סטטוס מידע'] ?? '').trim();
  const hasPageImage = String(row['תמונה בעמוד'] ?? '').trim() === 'כן';
  const sourceUrl = String(row['מקור'] ?? '').trim();

  return {
    id: slugId(num),
    number: num,
    hebrewName,
    englishName,
    aliases,
    description,
    habitat,
    diet,
    sizeSeason,
    cookingMethods,
    handlingNotes,
    identificationNotes: description,
    consumptionWarning: cookingMethods,
    infoStatus,
    hasPageImage,
    sourceUrl,
  };
});

const lines = [];
lines.push('/**');
lines.push(' * Mediterranean fish guide — imported from mediterranean_fish_guide_he.xlsx');
lines.push(' * Source: https://sites.google.com/site/mehayamlatsalahat/home/the-fish');
lines.push(' * Regenerate: node scripts/import-mediterranean-fish-guide.mjs');
lines.push(' */');
lines.push('');
lines.push('export interface MediterraneanFishGuideEntry {');
lines.push('  id: string;');
lines.push('  number: number;');
lines.push('  hebrewName: string;');
lines.push('  englishName: string;');
lines.push('  aliases: string[];');
lines.push('  description: { en: string; he: string };');
lines.push('  habitat: { en: string; he: string };');
lines.push('  diet: { en: string; he: string };');
lines.push('  sizeSeason: { en: string; he: string };');
lines.push('  cookingMethods: { en: string; he: string };');
lines.push('  handlingNotes: { en: string; he: string };');
lines.push('  identificationNotes: { en: string; he: string };');
lines.push('  consumptionWarning: { en: string; he: string };');
lines.push('  infoStatus: string;');
lines.push('  hasPageImage: boolean;');
lines.push('  sourceUrl: string;');
lines.push('}');
lines.push('');
lines.push('export const MEDITERRANEAN_FISH_GUIDE: MediterraneanFishGuideEntry[] = [');
for (const e of entries) {
  lines.push('  {');
  lines.push(`    id: ${esc(e.id)},`);
  lines.push(`    number: ${e.number},`);
  lines.push(`    hebrewName: ${esc(e.hebrewName)},`);
  lines.push(`    englishName: ${esc(e.englishName)},`);
  lines.push(`    aliases: ${JSON.stringify(e.aliases)},`);
  lines.push(`    description: { en: ${esc(e.description.en)}, he: ${esc(e.description.he)} },`);
  lines.push(`    habitat: { en: ${esc(e.habitat.en)}, he: ${esc(e.habitat.he)} },`);
  lines.push(`    diet: { en: ${esc(e.diet.en)}, he: ${esc(e.diet.he)} },`);
  lines.push(`    sizeSeason: { en: ${esc(e.sizeSeason.en)}, he: ${esc(e.sizeSeason.he)} },`);
  lines.push(`    cookingMethods: { en: ${esc(e.cookingMethods.en)}, he: ${esc(e.cookingMethods.he)} },`);
  lines.push(`    handlingNotes: { en: ${esc(e.handlingNotes.en)}, he: ${esc(e.handlingNotes.he)} },`);
  lines.push(`    identificationNotes: { en: ${esc(e.identificationNotes.en)}, he: ${esc(e.identificationNotes.he)} },`);
  lines.push(`    consumptionWarning: { en: ${esc(e.consumptionWarning.en)}, he: ${esc(e.consumptionWarning.he)} },`);
  lines.push(`    infoStatus: ${esc(e.infoStatus)},`);
  lines.push(`    hasPageImage: ${e.hasPageImage},`);
  lines.push(`    sourceUrl: ${esc(e.sourceUrl)},`);
  lines.push('  },');
}
lines.push('];');
lines.push('');
lines.push('export const MEDITERRANEAN_FISH_BY_ID: Record<string, MediterraneanFishGuideEntry> = Object.fromEntries(');
lines.push('  MEDITERRANEAN_FISH_GUIDE.map((entry) => [entry.id, entry]),');
lines.push(');');
lines.push('');
lines.push(`export const LEGACY_SPECIES_ID_MAP: Record<string, string> = ${JSON.stringify(LEGACY_SPECIES_ID_MAP, null, 2)};`);
lines.push('');
lines.push('export function resolveSpeciesGuideId(id: string): string {');
lines.push('  return LEGACY_SPECIES_ID_MAP[id] ?? id;');
lines.push('}');
lines.push('');
lines.push('export function findFishGuideEntry(query: string): MediterraneanFishGuideEntry | undefined {');
lines.push('  const q = query.trim().toLowerCase();');
lines.push('  if (!q) return undefined;');
lines.push('  return MEDITERRANEAN_FISH_GUIDE.find((entry) => {');
lines.push('    if (entry.hebrewName.includes(query.trim())) return true;');
lines.push('    if (entry.englishName.toLowerCase().includes(q)) return true;');
lines.push('    return entry.aliases.some((alias) => alias.toLowerCase().includes(q) || alias.includes(query.trim()));');
lines.push('  });');
lines.push('}');
lines.push('');

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${entries.length} species to ${outPath}`);
