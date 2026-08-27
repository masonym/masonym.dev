/**
 * build-map-data.mjs
 *
 * Transforms the raw MapExtractor output into the slim, site-ready JSON that the
 * burning-field map picker fetches at runtime from public/map-data/. The raw dump
 * covers the whole game; what ships is narrowed by REGIONS and MIN_SPAWNS below.
 *
 * Run: node src/scripts/build-map-data.mjs [--src <dir>]
 *
 * Input  (from WzDataExtractor/MapExtractor):
 *   maps.json
 * Output (public/map-data/):
 *   maps.json
 *
 * See docs/map-data.md for the WZ schema this relies on.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

const DEFAULT_SRC =
  "/mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor/output/maps";

const argv = process.argv.slice(2);
const srcIdx = argv.indexOf("--src");
const SRC_DIR = srcIdx !== -1 ? argv[srcIdx + 1] : DEFAULT_SRC;
const OUT_DIR = join(REPO_ROOT, "public", "map-data");

/**
 * World-map regions to ship. Everything else is dropped.
 *
 * The tracker is for the Grandis burning-field rotation - Cernium at 260 up to
 * Gob's Workshop at 299 - so the catalogue is cut to that progression rather
 * than shipping all 3,833 hunting maps in the game to make one choice out of
 * ten areas. Widen this list and re-run to open it up; nothing downstream
 * assumes a single region.
 *
 * The region filter does a second job worth keeping in mind before swapping it
 * for a street filter: every instanced copy of these areas - Monster Park
 * stages (`954xxxxxx`), story instances (`993xxxxxx`) - carries the same street
 * name but is absent from the world map, so it has no region and falls out
 * here. Those maps have no channels, so they can never hold a burning field.
 */
const REGIONS = new Set(["Western Grandis"]);

/**
 * A map needs this many monster spawn points to count as a hunting map.
 *
 * The extractor keeps everything with at least one, which is the right call for
 * a general map dump but wrong here: boss arenas, their entrance rooms and the
 * cutscene maps in between all carry one or two spawn points (often a single
 * scripted dummy), and none of them is somewhere you can burn. Every real
 * training map is well into the dozens - the cut at 3 removes 265 maps and no
 * training map among them.
 */
const MIN_SPAWNS = 3;

/** At most this many distinct monsters are listed per map. Long tails are pure noise
 *  in the picker - the first few name the map ("Combatron EX"), the twentieth doesn't. */
const MAX_MOBS_PER_MAP = 6;

const raw = JSON.parse(readFileSync(join(SRC_DIR, "maps.json"), "utf8"));

const maps = [];
const usedMobs = new Set();

for (const m of raw.maps) {
  if (!m.name || m.spawns < MIN_SPAWNS) continue;
  if (!REGIONS.has(m.region)) continue;
  // Monsters carry the map's identity, so keep the ones with the most spawn points
  // first - the extractor lists them in whatever order `life` happened to be in.
  const mobs = (m.mobs || []).slice(0, MAX_MOBS_PER_MAP);
  mobs.forEach((id) => usedMobs.add(id));
  maps.push({
    id: m.id,
    name: m.name,
    street: m.street || "",
    ...(m.region ? { region: m.region } : {}),
    minLv: m.minLv ?? null,
    maxLv: m.maxLv ?? null,
    spawns: m.spawns,
    mobs,
  });
}

maps.sort((a, b) => a.id - b.id);

const mobs = {};
for (const id of [...usedMobs].sort((a, b) => a - b)) {
  const entry = raw.mobs[String(id)];
  if (!entry) continue;
  mobs[id] = entry; // [name, level]
}

mkdirSync(OUT_DIR, { recursive: true });
const out = { generated: raw.generated, mobs, maps };
const outPath = join(OUT_DIR, "maps.json");
writeFileSync(outPath, JSON.stringify(out));

const streets = new Set(maps.map((m) => m.street));
const levels = maps.map((m) => m.minLv).filter((l) => l != null);
const kb = Math.round(JSON.stringify(out).length / 1024);
console.log(
  `wrote ${outPath}: ${maps.length} maps, ${streets.size} streets, ` +
    `${Object.keys(mobs).length} monsters, Lv ${Math.min(...levels)}-` +
    `${Math.max(...maps.map((m) => m.maxLv ?? 0))}, ${kb} KB`,
);
