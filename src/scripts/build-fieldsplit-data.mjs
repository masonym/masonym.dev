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
  if (!m.name || m.spawns < MIN_SPAWNS || !cat?.region) {
    dropped++;
    continue;
  }

  const entry = {
    id: m.id,
    name: m.name,
    street: m.street || "",
    region: cat.region,
    minLv: cat.minLv ?? null,
    maxLv: cat.maxLv ?? null,
    spawns: m.spawns,
    cells: m.cells,
    walkCells: m.walkCells,
    canHide: m.canHide,
    ...(m.largeSplit != null ? { largeSplit: m.largeSplit } : {}),
  };

  // Maps that can't hide a cell need nothing more than the verdict. The rest get the
  // grid, the minimap and the spawn points for the viewer.
  const detailed = m.canHide || m.largeSplit != null;
  const mm = m.miniMap;
  if (detailed && mm?.file && existsSync(join(SRC_DIR, mm.file))) {
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
for (const id of [...usedMobs].sort((a, b) => a - b)) {
  const e = catalogue.mobs[String(id)];
  if (e) mobs[id] = e; // [name, level]
}

// Rebuild the minimap folder from scratch so maps that stopped qualifying don't linger.
rmSync(join(OUT_DIR, "minimap"), { recursive: true, force: true });
mkdirSync(join(OUT_DIR, "minimap"), { recursive: true });
for (const file of minimaps) copyFileSync(join(SRC_DIR, file), join(OUT_DIR, file));

const out = { generated: fs.generated, cell: fs.cell, band: fs.band, origin: fs.origin, mobs, maps };
const outPath = join(OUT_DIR, "fieldsplit.json");
writeFileSync(outPath, JSON.stringify(out));

const kb = Math.round(JSON.stringify(out).length / 1024);
console.log(
  `wrote ${outPath}: ${maps.length} maps (${maps.filter((m) => m.canHide).length} can hide a cell, ` +
    `${maps.filter((m) => m.largeSplit != null).length} largeSplit), ${minimaps.length} minimaps, ` +
    `${Object.keys(mobs).length} monsters, ${kb} KB; skipped ${dropped}`,
);
