/**
 * Field split ("summon zone") grid logic, free of React so it can be run from Node.
 *
 * The mechanic (see docs/fieldsplit-data.md for sources and what is unverified):
 * - The game divides a map into cells of `cell` map units, counted from the
 *   top-left of the map's grid box.
 * - You get updates only for objects in the 3x3 block of cells around your own
 *   cell, so a placed summon more than one cell away (in either direction) is
 *   hidden for you and stops attacking.
 * - You change cell `band` units *past* a boundary in the direction you're moving.
 *   Within `band` of a boundary, which cell you're in depends on where you came from.
 *
 * Data: public/fieldsplit/fieldsplit.json, built by src/scripts/build-fieldsplit-data.mjs.
 */

const DATA_URL = "/fieldsplit/fieldsplit.json";

let cache = null;
let inflight = null;

/** Fetches and indexes the data once per page load. */
export async function loadFieldSplit() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Could not load the map data (${res.status})`);
    const raw = await res.json();
    const maps = raw.maps.map((m) => {
      const mobNames = (m.mobs || []).map((id) => raw.mobs[id]?.[0]).filter(Boolean);
      return {
        ...m,
        mobNames,
        status: statusOf(m, raw),
        _haystack: [m.name, m.street, m.region, ...mobNames, String(m.id)].join(" ").toLowerCase(),
      };
    });
    cache = { ...raw, maps, byId: new Map(maps.map((m) => [m.id, m])) };
    return cache;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/**
 * "hides", "safe", or "unknown" (largeSplit: a non-standard grid we can't compute).
 *
 * A largeSplit map still counts as safe when it can't hide a summon even on the standard grid
 * (in-game tests show largeSplit cells are bigger than standard, never smaller), or when its
 * value has been tested and never hides (data.largeSplitSafe, see build-fieldsplit-data.mjs), unless the map is too big for
 * those tests to settle (data.largeSplitUnsettled).
 */
export function statusOf(m, data) {
  if (!m.canHide) return "safe";
  if (m.largeSplit == null) return "hides";
  if (data.largeSplitUnsettled?.includes(m.id)) return "unknown";
  return data.largeSplitSafe?.includes(m.largeSplit) ? "safe" : "unknown";
}

/** Grid geometry of a detailed map entry, in map units. */
export function geometry(m, data) {
  const [cw, ch] = data.cell;
  const [bw, bh] = data.band;
  const [l, t, r, b] = m.grid;
  const [fl, ft, fr, fb] = m.fh;
  const x = { start: l, end: r, size: cw, band: bw, n: m.cells[0], bounds: m.xBounds };
  const y = { start: t, end: b, size: ch, band: bh, n: m.cells[1], bounds: m.yBounds };
  // cells the walkable area touches; you can never be in a cell outside these
  x.walk = [cellIndex(fl, x), cellIndex(fr, x)];
  y.walk = [cellIndex(ft, y), cellIndex(fb, y)];
  return { x, y };
}

/** The cell a coordinate falls in along one axis, clamped to the grid. */
export function cellIndex(v, axis) {
  const i = Math.floor((v - axis.start) / axis.size);
  return Math.min(Math.max(i, 0), axis.n - 1);
}

/**
 * The cells a player standing at `v` could be counted in along one axis, as
 * [lo, hi]. Usually one cell; two inside a transition band, where it depends on
 * which side you came from.
 */
export function possibleCells(v, axis) {
  const c = cellIndex(v, axis);
  let lo = c;
  let hi = c;
  const left = axis.start + c * axis.size;
  const right = left + axis.size;
  // just past the left boundary: coming from the left, you haven't switched yet
  if (c > 0 && v - left < axis.band) lo = c - 1;
  // just before the right boundary: coming from the right, you haven't switched back yet
  if (c < axis.n - 1 && right - v <= axis.band) hi = c + 1;
  return [Math.max(lo, axis.walk[0]), Math.min(hi, axis.walk[1])];
}

// distance from cell s to the nearest and farthest of [lo, hi]
const near = (s, [lo, hi]) => (s < lo ? lo - s : s > hi ? s - hi : 0);
const far = (s, [lo, hi]) => Math.max(Math.abs(lo - s), Math.abs(hi - s));

/**
 * Whether a summon in cell `s` ({c, r}) is visible to a player who could be in
 * any of the cells `px` x `py`: "visible", "hidden", or "depends" (transition
 * band: it depends on the direction you walked in from).
 */
export function visibility(s, px, py) {
  if (far(s.c, px) <= 1 && far(s.r, py) <= 1) return "visible";
  if (near(s.c, px) > 1 || near(s.r, py) > 1) return "hidden";
  return "depends";
}

/** The cell {c, r} a point falls in. */
export function cellOf(g, p) {
  return { c: cellIndex(p.x, g.x), r: cellIndex(p.y, g.y) };
}

/** The status of a player standing at (x, y) for a summon placed at summon {x, y}. */
export function statusAt(g, summon, x, y) {
  const s = { c: cellIndex(summon.x, g.x), r: cellIndex(summon.y, g.y) };
  return visibility(s, possibleCells(x, g.x), possibleCells(y, g.y));
}

// interval edges along an axis: grid edges, boundaries and transition lines
export function edges(axis) {
  const e = new Set([axis.start, axis.end]);
  for (const b of axis.bounds) for (const v of [b - axis.band, b, b + axis.band]) {
    if (v > axis.start && v < axis.end) e.add(v);
  }
  return [...e].sort((a, b) => a - b);
}

/**
 * Rectangles covering the grid box, each with the status a player standing in it
 * has for a summon at `summon`. Adjacent rectangles with the same status along x
 * are merged.
 */
export function zones(g, summon) {
  const s = { c: cellIndex(summon.x, g.x), r: cellIndex(summon.y, g.y) };
  const xs = edges(g.x);
  const ys = edges(g.y);
  const out = [];
  for (let j = 0; j < ys.length - 1; j++) {
    const py = possibleCells((ys[j] + ys[j + 1]) / 2, g.y);
    let run = null;
    for (let i = 0; i < xs.length - 1; i++) {
      const st = visibility(s, possibleCells((xs[i] + xs[i + 1]) / 2, g.x), py);
      if (run && run.status === st) run.x1 = xs[i + 1];
      else {
        run = { x0: xs[i], x1: xs[i + 1], y0: ys[j], y1: ys[j + 1], status: st };
        out.push(run);
      }
    }
  }
  return out;
}

/**
 * Cells where a summon stays visible from anywhere you can walk: along each axis,
 * cell c works when every walkable cell is within one of it. Returns
 * { cols: [lo, hi], rows: [lo, hi] } or null when no such cell exists (the
 * walkable area spans 4+ cells along some axis).
 */
export function safeSummonCells(g) {
  const axisRange = ([a, b]) => {
    const lo = Math.max(a, b - 1);
    const hi = Math.min(b, a + 1);
    return lo <= hi ? [lo, hi] : null;
  };
  const cols = axisRange(g.x.walk);
  const rows = axisRange(g.y.walk);
  return cols && rows ? { cols, rows } : null;
}

/** Map-unit box of a cell range along both axes. */
export function cellBox(g, cols, rows) {
  return {
    x0: g.x.start + cols[0] * g.x.size,
    x1: Math.min(g.x.start + (cols[1] + 1) * g.x.size, g.x.end),
    y0: g.y.start + rows[0] * g.y.size,
    y1: Math.min(g.y.start + (rows[1] + 1) * g.y.size, g.y.end),
  };
}
