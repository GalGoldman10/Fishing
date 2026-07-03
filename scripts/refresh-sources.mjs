/**
 * Refresh the bot's trusted-source knowledge base.
 *
 * Fetches the curated Israeli fishing pages, strips them to readable text,
 * and writes lib/research/data/sourcePages.json. Runs daily via the
 * refresh-sources GitHub Action (and can be run manually: node scripts/refresh-sources.mjs).
 *
 * Failure policy: a page that cannot be fetched keeps its previous content
 * and fetchedAt. The script fails only when every page fails.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'research', 'data', 'sourcePages.json');
const MAX_TEXT_LENGTH = 15000;
const FETCH_TIMEOUT_MS = 25000;

const SOURCES = [
  {
    id: 'shvilist-beaches',
    title: 'חופי דיג בים התיכון — שביליסט',
    url: 'https://shvilist.com/%D7%97%D7%95%D7%A4%D7%99-%D7%93%D7%99%D7%92-%D7%91%D7%99%D7%9D-%D7%94%D7%AA%D7%99%D7%9B%D7%95%D7%9F/',
  },
  {
    id: 'parks-fishing-info',
    title: 'דגים חכם — מידע לדייג — רשות הטבע והגנים',
    url: 'https://www.parks.org.il/sea/%d7%93%d7%92%d7%99%d7%9d-%d7%97%d7%9b%d7%9d-%d7%a9%d7%95%d7%9e%d7%a8%d7%99%d7%9d-%d7%a2%d7%9c-%d7%94%d7%99%d7%9d/',
  },
  {
    id: 'parks-fish-length',
    title: 'אורכי המינימום של הדגים — רשות הטבע והגנים',
    url: 'https://www.parks.org.il/article/fish-length/',
  },
  {
    id: 'tiulim-fishing-places',
    title: 'מקומות שמומלצים לדיג בישראל — טיולים.נט',
    url: 'https://tiulim.net/%D7%9E%D7%A7%D7%95%D7%9E%D7%95%D7%AA-%D7%93%D7%99%D7%92-%D7%A9%D7%9E%D7%95%D7%9E%D7%9C%D7%A6%D7%99%D7%9D-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C/',
  },
];

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|p|div|li|h[1-6]|tr|section|article)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&[a-z#0-9]{2,8};/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

async function fetchPage(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FishGuideBot/1.0; +https://github.com/GalGoldman10/Fishing)',
        Accept: 'text/html',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = htmlToText(html).slice(0, MAX_TEXT_LENGTH);
    if (text.length < 500) throw new Error('page text too short — possible block page');
    return { id: source.id, url: source.url, title: source.title, fetchedAt: new Date().toISOString(), text };
  } finally {
    clearTimeout(timer);
  }
}

function loadExisting() {
  try {
    return JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  } catch {
    return { generatedAt: null, pages: [] };
  }
}

const existing = loadExisting();
const existingById = new Map(existing.pages.map((p) => [p.id, p]));

const results = await Promise.allSettled(SOURCES.map(fetchPage));
const pages = [];
let succeeded = 0;

for (let i = 0; i < SOURCES.length; i++) {
  const result = results[i];
  if (result.status === 'fulfilled') {
    pages.push(result.value);
    succeeded++;
    console.log(`OK      ${SOURCES[i].id} (${result.value.text.length} chars)`);
  } else {
    const previous = existingById.get(SOURCES[i].id);
    if (previous) {
      pages.push(previous);
      console.warn(`KEPT    ${SOURCES[i].id} — fetch failed (${result.reason}), keeping content from ${previous.fetchedAt}`);
    } else {
      console.warn(`SKIPPED ${SOURCES[i].id} — fetch failed (${result.reason}), no previous content`);
    }
  }
}

if (succeeded === 0 && pages.length === 0) {
  console.error('All source fetches failed and no previous content exists.');
  process.exit(1);
}

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2) + '\n', 'utf8');
console.log(`Wrote ${pages.length} pages (${succeeded} freshly fetched) to ${OUT_PATH}`);
