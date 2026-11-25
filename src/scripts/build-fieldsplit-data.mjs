/**
 * build-fieldsplit-data.mjs
 *
 * Builds the site data for the field split ("summon zone") viewer from the
 * WzDataExtractor dumps. The game divides each map into a grid of cells and only
 * keeps objects in the 3x3 block around your cell visible to you. A placed
 * summon in any other cell is hidden for you and stops attacking.
 *
 * Run: node src/scripts/build-fieldsplit-data.mjs [--src <dir>] [--maps <dir>]
 *
 * Input:
 *   <src>/fieldsplit.json, <src>/minimap/<id>.png   (FieldSplitExtractor --minimaps --all)
 *   <maps>/maps.json                                (MapExtractor: world-map region, mob names)
 * Output (public/fieldsplit/):
 *   fieldsplit.json, minimap/<id>.png
 *
 * See docs/fieldsplit-data.md for the schema and what is still unverified.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const WZ_OUT = "/mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor/output";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : fallback;
};
const SRC_DIR = arg("--src", join(WZ_OUT, "fieldsplit"));
const MAPS_DIR = arg("--maps", join(WZ_OUT, "maps"));
const OUT_DIR = join(REPO_ROOT, "public", "fieldsplit");

/** Same cut as the burning-field catalogue (build-map-data.mjs): boss rooms and
 *  cutscene maps carry one or two spawn points, real training maps dozens. */
const MIN_SPAWNS = 3;

/** Lowest monster level a map may have. Only endgame training maps: summon placement matters where people farm with Sol Janus and
 *  other placed summons, not in the levelling maps on the way. */
const MIN_LEVEL = 200;

/**
 * The picker's top-level categories, by world-map region. Regions not listed go under "Other"
 * (at 200+ that's Scrapyard, Black Heaven and the Dark World Tree).
 */
const CATEGORIES = [
  ["Arcane River", [
    "Vanishing Journey", "Reverse City", "Chu Chu Island", "Yum Yum Island",
    "Lachelein, the Dreaming City", "The Mysterious Forest of Arcana",
    "Morass, the Swamp of Memory", "Esfera, the Origin Sea", "Sellas, Where the Stars Rest",
    "Tenebris", "Limina",
  ]],
  ["Grandis", ["Eastern Grandis", "Western Grandis"]],
  ["Quanah", ["Quanah"]],
];
const CATEGORY_OF = new Map(CATEGORIES.flatMap(([c, regions]) => regions.map((r) => [r, c])));

/**
 * Hunting maps that aren't on the world map, shipped under a region given here.
 *
 * Quanah's Proving Fields (the Training maps). The live set is the 6931xx01 maps, which
 * return to the Proving Fields entrance (693100006). 693100007-009 share the "Basic 1-3" names
 * but are a leftover: they return to 693100010 and run a Maple Island enter script.
 */
const EXTRA_MAPS = new Map(
  [693106101, 693106401, 693106701, 693107001, 693107301, 693107601, 693107901, 693108201, 693108501]
    .map((id) => [id, "Quanah"]),
);

/**
 * largeSplit values tested in game and found to never hide a summon on any map that uses them.
 * A map with largeSplit uses a non-standard grid we can't compute, so it's shown as "grid unknown"
 * unless its value is listed here or the map is too small to hide a summon even on the standard
 * grid (every test shows largeSplit cells are bigger than standard, never smaller).
 *
 * Tests, 2026-11-24, GMS v272: summon placed at one end, walked to the far end, and the summon
 * kept attacking every time. Each walk would have hidden it on the standard grid; "cells >= Nx"
 * is the smallest cell scale that fits the result. Tested on each value's widest and tallest map.
 * - 2: Odium: Road to the Castle's Gate 3 (410007004) left to right, >= 2.09x;
 *      Toy Factory <Apparatus Room> (220020600) bottom to top, >= 1.21x
 * - 3: Empress Road: Western Outskirts (410007523) right to left, >= 1.25x;
 *      Eastern Outskirts (410007525) bottom-left to top-right, >= 2.15x across, >= 1.94x down
 * - 4: World's Sorrow Depths 1 (450012020) left to right, >= 2.51x; Midpoint 3 and 4
 *      (450012120, 450012130) bottom to top, >= 1.12x
 * - 5: Eree Valley: Torrent Zone 1 (450002012) left to right, >= 3.57x;
 *      Nightmare Clocktower 5F (450003540) top to bottom, >= 2.15x
 * Last Horizon 2 (2) and Deep in the Cavern - Lower Path 1 (5) were also tested, but both are 2x2
 * on the standard grid, so they couldn't have hidden a summon anyway.
 * - 4: World's Sorrow Depths 2 (450012030), the one map too wide (4311) for the 2.51x above to
 *      settle, tested on its own and also never hid a summon.
 *
 * Applying each value's largest scale to both axes, no shipped map with that value can hide a
 * summon. A map too big for that to cover goes in LARGE_SPLIT_UNSETTLED until it's tested.
 */
const LARGE_SPLIT_SAFE = [2, 3, 4, 5];

/** Maps on a LARGE_SPLIT_SAFE value that are too big for its tests to settle; shown as unknown.
 *  None right now: World's Sorrow Depths 2 was the last one, tested safe. */
const LARGE_SPLIT_UNSETTLED = [];

const fs = JSON.parse(readFileSync(join(SRC_DIR, "fieldsplit.json"), "utf8"));
const catalogue = JSON.parse(readFileSync(join(MAPS_DIR, "maps.json"), "utf8"));
const byId = new Map(catalogue.maps.map((m) => [m.id, m]));

const maps = [];
const usedMobs = new Set();
const minimaps = [];
let dropped = 0;

for (const m of fs.maps) {
  const cat = byId.get(m.id);
  // Needing a world-map region drops the instanced copies of every area (Monster
  // Park 954xxxxxx, story instances 993xxxxxx): same street name, not on the world
  // map, and not somewhere anyone sets up summons to farm.
  const region = cat?.region ?? EXTRA_MAPS.get(m.id);
  if (!m.name || m.spawns < MIN_SPAWNS || !region || (cat?.minLv ?? 0) < MIN_LEVEL) {
    dropped++;
    continue;
  }

  const entry = {
    id: m.id,
    name: m.name,
    street: m.street || "",
    category: CATEGORY_OF.get(region) ?? "Other",
    region,
    minLv: cat.minLv ?? null,
    maxLv: cat.maxLv ?? null,
    spawns: m.spawns,
    cells: m.cells,
    walkCells: m.walkCells,
    canHide: m.canHide,
    ...(m.largeSplit != null ? { largeSplit: m.largeSplit } : {}),
  };

  // grid, minimap and spawn points for the viewer, for every map: even where a summon can't be
  // hidden, people want to see the map
  const mm = m.miniMap;
  if (mm?.file && existsSync(join(SRC_DIR, mm.file))) {
    const grid = m.origin === "vr" ? m.vr : m.fh;
    // mobs: distinct monsters, most spawn points first; spawnPts index into it
    const counts = new Map();
    for (const [, , id] of m.spawnPts) counts.set(id, (counts.get(id) ?? 0) + 1);
    const mobs = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a - b);
    const idx = new Map(mobs.map((id, i) => [id, i]));
    mobs.forEach((id) => usedMobs.add(id));
    Object.assign(entry, {
      grid: [grid.l, grid.t, grid.r, grid.b],
      fh: [m.fh.l, m.fh.t, m.fh.r, m.fh.b],
      xBounds: m.xBounds,
      yBounds: m.yBounds,
      miniMap: [mm.centerX, mm.centerY, mm.mag, mm.width, mm.height],
      mobs,
      spawnPts: m.spawnPts.map(([x, y, id]) => [x, y, idx.get(id)]),
    });
    minimaps.push(mm.file);
  }
  maps.push(entry);
}

const mobs = {};
const hitboxes = {};
for (const id of [...usedMobs].sort((a, b) => a - b)) {
  const e = catalogue.mobs[String(id)];
  if (e) mobs[id] = e; // [name, level]
  if (fs.hitboxes[id]) hitboxes[id] = fs.hitboxes[id]; // [l, t, r, b] from its feet, facing left
}

// Rebuild the minimap folder from scratch so maps that stopped qualifying don't linger.
rmSync(join(OUT_DIR, "minimap"), { recursive: true, force: true });
mkdirSync(join(OUT_DIR, "minimap"), { recursive: true });
for (const file of minimaps) copyFileSync(join(SRC_DIR, file), join(OUT_DIR, file));

const out = {
  generated: fs.generated,
  cell: fs.cell,
  band: fs.band,
  origin: fs.origin,
  categories: [...CATEGORIES.map(([c]) => c), "Other"],
  largeSplitSafe: LARGE_SPLIT_SAFE,
  largeSplitUnsettled: LARGE_SPLIT_UNSETTLED,
  mobs,
  hitboxes,
  maps,
};
const outPath = join(OUT_DIR, "fieldsplit.json");
writeFileSync(outPath, JSON.stringify(out));

const kb = Math.round(JSON.stringify(out).length / 1024);
console.log(
  `wrote ${outPath}: ${maps.length} maps (${maps.filter((m) => m.canHide).length} can hide a cell, ` +
    `${maps.filter((m) => m.largeSplit != null).length} largeSplit), ${minimaps.length} minimaps, ` +
    `${Object.keys(mobs).length} monsters (${Object.keys(hitboxes).length} with a hitbox), ${kb} KB; skipped ${dropped}`,
);
