/**
 * extract-images.ts
 *
 * Extracts stone icon PNGs from Etc._Canvas.ErdaLink.img.xml.
 * Resolves outlinks from the main ErdaLink XML so every stone ID gets its own
 * image files, even if multiple stones share the same artwork.
 *
 * Run: npm run extract-images
 * Output: output/images/stones/{category}/{id}/{icon|iconDisabled|iconMouseover}.png
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CANVAS_XML = join(__dirname, 'Etc._Canvas.ErdaLink.img.xml');
const MAIN_XML = join(__dirname, 'Etc.ErdaLink.img.xml');
const OUT_DIR = join(__dirname, 'output', 'images', 'stones');

const STONE_CATEGORIES = ['rush', 'skill', 'boost', 'ultimate', 'origin'] as const;
const ICON_VARIANTS = ['icon', 'iconDisabled', 'iconMouseover'] as const;

type Category = typeof STONE_CATEGORIES[number];
type Variant = typeof ICON_VARIANTS[number];

// ─── Step 1: parse canvas XML → flat image data map ──────────────────────────
// Key format: "rush/2/icon", "skill/100/iconDisabled", etc.

function buildCanvasMap(xmlPath: string): Map<string, Buffer> {
  const xml = readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['dir', 'png'].includes(name),
  });

  const raw = parser.parse(xml);
  const rootDir = raw.dir?.[0];
  if (!rootDir) throw new Error('No root <dir> in canvas XML');

  const stoneSection = (rootDir.dir ?? []).find((d: any) => d['@_name'] === 'stone');
  if (!stoneSection) throw new Error('No <dir name="stone"> in canvas XML');

  const map = new Map<string, Buffer>();

  for (const treeDir of stoneSection.dir ?? []) {
    const treeId: string = treeDir['@_name'];
    if (isNaN(parseInt(treeId))) continue; // skip 'info'

    for (const categoryDir of treeDir.dir ?? []) {
      const category: string = categoryDir['@_name'];
      if (!STONE_CATEGORIES.includes(category as Category)) continue;

      for (const stoneDir of categoryDir.dir ?? []) {
        const stoneId: string = stoneDir['@_name'];

        for (const png of stoneDir.png ?? []) {
          const variant: string = png['@_name'];
          if (!ICON_VARIANTS.includes(variant as Variant)) continue;
          // Key includes treeId to match the outlink path format.
          const key = `${treeId}/${category}/${stoneId}/${variant}`;
          map.set(key, Buffer.from(png['@_value'], 'base64'));
        }
      }
    }
  }

  return map;
}

// ─── Step 2: parse main XML → outlink map ────────────────────────────────────
// For every stone+variant, record where its image actually lives in the canvas.
// Key: "18112/rush/15/icon"  Value: "18112/rush/13/icon"  (treeId/category/id/variant)

function parseOutlinkPath(outlink: string): string | null {
  // "Etc/_Canvas/ErdaLink.img/stone/rush/13/icon" → "rush/13/icon"
  const match = outlink.match(/\/stone\/(.+)$/);
  return match ? match[1] : null;
}

function buildOutlinkMap(xmlPath: string): Map<string, string> {
  const xml = readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['dir', 'string', 'png'].includes(name),
  });

  const raw = parser.parse(xml);
  const rootDir = raw.dir?.[0];
  if (!rootDir) throw new Error('No root <dir> in main XML');

  const stoneSection = (rootDir.dir ?? []).find((d: any) => d['@_name'] === 'stone');
  if (!stoneSection) throw new Error('No <dir name="stone"> in main XML');

  const map = new Map<string, string>();

  for (const treeDir of stoneSection.dir ?? []) {
    const treeId: string = treeDir['@_name'];
    if (isNaN(parseInt(treeId))) continue; // skip 'info'

    for (const categoryDir of treeDir.dir ?? []) {
      const category: string = categoryDir['@_name'];
      if (!STONE_CATEGORIES.includes(category as Category)) continue;

      for (const stoneDir of categoryDir.dir ?? []) {
        const stoneId: string = stoneDir['@_name'];

        for (const png of stoneDir.png ?? []) {
          const variant: string = png['@_name'];
          if (!ICON_VARIANTS.includes(variant as Variant)) continue;

          const outlinkStr = (png.string ?? []).find(
            (s: any) => s['@_name'] === '_outlink',
          )?.['@_value'];

          if (!outlinkStr) continue;

          // resolvedKey: "{treeId}/{category}/{stoneId}/{variant}" — matches canvas map key.
          const resolvedKey = parseOutlinkPath(outlinkStr);
          if (!resolvedKey) continue;

          // sourceKey includes treeId so each character gets its own image files.
          const sourceKey = `${treeId}/${category}/${stoneId}/${variant}`;
          map.set(sourceKey, resolvedKey);
        }
      }
    }
  }

  return map;
}

// ─── Step 3: write images for every stone ID ──────────────────────────────────

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function main() {
  console.log('Building canvas image map...');
  const canvasMap = buildCanvasMap(CANVAS_XML);
  console.log(`  ${canvasMap.size} unique images in canvas`);

  console.log('Building outlink resolution map...');
  const outlinkMap = buildOutlinkMap(MAIN_XML);
  console.log(`  ${outlinkMap.size} stone+variant outlinks found`);

  ensureDir(OUT_DIR);

  let written = 0;
  let skipped = 0;
  const skippedKeys: string[] = [];

  for (const [sourceKey, canvasKey] of outlinkMap) {
    const imageData = canvasMap.get(canvasKey);
    if (!imageData) {
      skipped++;
      skippedKeys.push(`${sourceKey} → ${canvasKey} (not in canvas)`);
      continue;
    }

    // sourceKey: "18112/rush/15/icon"  →  output/images/stones/18112/rush/15/icon.png
    const [treeId, category, stoneId, variant] = sourceKey.split('/');
    const stoneDir = join(OUT_DIR, treeId, category, stoneId);
    ensureDir(stoneDir);

    writeFileSync(join(stoneDir, `${variant}.png`), imageData);
    written++;
  }

  console.log(`\nWritten: ${written} images`);
  if (skipped > 0) {
    console.warn(`Skipped: ${skipped} (canvas entry missing)`);
    for (const k of skippedKeys) console.warn(`  ${k}`);
  }

  // Summary by treeId/category
  console.log('\nDirectory structure:');
  if (existsSync(OUT_DIR)) {
    for (const treeId of readdirSync(OUT_DIR)) {
      for (const category of STONE_CATEGORIES) {
        const categoryDir = join(OUT_DIR, treeId, category);
        if (!existsSync(categoryDir)) continue;
        const ids = readdirSync(categoryDir).sort((a, b) => parseInt(a) - parseInt(b));
        console.log(`  stones/${treeId}/${category}/  (${ids.length} stones)`);
      }
    }
  }
}

main();
