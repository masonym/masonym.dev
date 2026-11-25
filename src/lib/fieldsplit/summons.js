/**
 * Several placed summons on the field split grid. No React here.
 *
 * You see a placed summon only while your cell is within one cell of the summon's cell, so with
 * several summons down, the spots where all of them keep attacking are the overlap of their 3x3
 * blocks. Looting outside that pauses the far summons until you come back, and because of the
 * transition bands (see grid.js) you have to come back *past* the cyan line: stop inside a band
 * and a summon can stay paused until your next trip.
 */

import { cellOf, edges, possibleCells, visibility } from "./grid.js";

/**
 * What you can put on the map: your character (where you idle between loot trips) and placed
 * summons. `box` is the attack range relative to the marker, from Skill/50000.img in Data/Packs:
 * - you: your character (`self`: it's what sees the summons, and is never hidden itself). With
 *   Sol Janus: Dusk in use it carries Dusk's range (DUSK_BOX).
 * - dawn: Sol Janus: Dawn. Each ring is its own skill, and each one is smaller than the last: the
 *   1st ring is 500001002, the 2nd 500001003, the 3rd 500001004, ranges in DAWN_BOXES. Relative to
 *   where the ring sits (where you stood, or in the air if cast mid-jump). Rings must be 300-2500
 *   apart (common/s and common/range, confirmed in game); up to 3 at max level (common/w2).
 * - other: any other placed summon; no range drawn.
 */
export const KINDS = {
  you: { key: "y", name: "Your character", short: "You", max: 1, self: true },
  dawn: {
    key: "d",
    name: "Sol Janus: Dawn",
    short: "Dawn",
    max: 3,
    minGap: 300,
    maxGap: 2500,
  },
  other: { key: "o", name: "Other summon", short: "Summon", max: 6 },
};
export const KIND_BY_KEY = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [v.key, k]));
export const MAX_SUMMONS = 8;

/** Dawn ring ranges in cast order: summon/attack1/info/range of 500001002, 500001003, 500001004. */
export const DAWN_BOXES = [
  { l: -280, t: -415, r: 280, b: 145 },
  { l: -255, t: -390, r: 255, b: 120 },
  { l: -235, t: -370, r: 235, b: 100 },
];

/**
 * Sol Janus: Dusk (500001001), common/lt2 and rb2. Not a summon: it attacks around your character
 * (the skill has no summon node; its Primal Crystals are SecondAtoms), so it can't be hidden and
 * moves with you. People farm with it instead of three Dawn rings for the range; the two can't be
 * active together, so Dawn rings are set aside while Dusk is in use.
 *
 * Unconfirmed in game: the skill also has a smaller lt/rb (600 each side, 600 up, 400 down), and
 * nothing in the WZ says which box picks targets. lt2/rb2 is what maplemaps.net uses. See
 * docs/fieldsplit-data.md for the test.
 */
export const DUSK_BOX = { l: -1000, t: -1000, r: 1000, b: 800 };

/** Whether this entry is a placed summon (and so can be hidden), not your character. */
export const isPlaced = (s) => !KINDS[s.kind].self;

/**
 * The attack range of each entry, or null: Dawn rings by cast order (the first Dawn in the list is
 * the first ring), Dusk around your character when `dusk` is set.
 */
export function rangeBoxes(summons, { dusk = false } = {}) {
  let ring = 0;
  return summons.map((s) => {
    if (s.kind === "dawn") return DAWN_BOXES[Math.min(ring++, DAWN_BOXES.length - 1)];
    if (s.kind === "you" && dusk) return DUSK_BOX;
    return null;
  });
}

/** Display labels in placement order: "You", "Dawn 1", "Dawn 2", "Summon 1"... */
export function labels(summons) {
  const totals = {};
  for (const s of summons) totals[s.kind] = (totals[s.kind] ?? 0) + 1;
  const seen = {};
  return summons.map((s) => {
    seen[s.kind] = (seen[s.kind] ?? 0) + 1;
    const k = KINDS[s.kind];
    return totals[s.kind] > 1 || k.max > 1 ? `${k.short} ${seen[s.kind]}` : k.short;
  });
}

const NO_HITBOX = { l: 0, t: 0, r: 0, b: 0 };

/**
 * The part of a monster's hitbox it covers whichever way it faces, relative to its feet. `box` is
 * [l, t, r, b] as the monster's sprite is drawn, facing left; facing right mirrors it, and nothing
 * says which way a monster will face, so only the overlap of the two counts as hit.
 * Without a box (ally NPCs) it's just the feet.
 */
export function bodyBox(box) {
  if (!box) return NO_HITBOX;
  const [l, t, r, b] = box;
  return { l: Math.max(l, -r), t, r: Math.min(r, -l), b };
}

/** Whether an attack range around `s` overlaps the body of a monster standing at (x, y). */
export function hits(s, range, x, y, body) {
  return (
    !!range &&
    x + body.r > s.x + range.l &&
    x + body.l < s.x + range.r &&
    y + body.b > s.y + range.t &&
    y + body.t < s.y + range.b
  );
}

/**
 * Indices of the spawn points where a monster is hit by any entry's range (boxes from rangeBoxes).
 * `bodies` are the map's monsters' body boxes, by the spawn point's monster index.
 */
export function coveredSpawns(summons, boxes, spawnPts, bodies) {
  const out = new Set();
  spawnPts.forEach(([x, y, m], i) => {
    if (summons.some((s, k) => hits(s, boxes[k], x, y, bodies[m]))) out.add(i);
  });
  return out;
}

/** Pairs of Dawn rings that break the spacing rule: { i, j, dist, kind: "close" | "far" }. */
export function spacingIssues(summons) {
  const { minGap, maxGap } = KINDS.dawn;
  const out = [];
  for (let i = 0; i < summons.length; i++)
    for (let j = i + 1; j < summons.length; j++) {
      if (summons[i].kind !== "dawn" || summons[j].kind !== "dawn") continue;
      const dist = Math.hypot(summons[i].x - summons[j].x, summons[i].y - summons[j].y);
      if (dist < minGap) out.push({ i, j, dist, kind: "close" });
      else if (dist > maxGap) out.push({ i, j, dist, kind: "far" });
    }
  return out;
}

/**
 * Rectangles over the grid box, each with the summons a player standing there can't see
 * (`hidden`) and the ones that depend on which way you walked in (`depends`), by index.
 * Adjacent rectangles that agree are merged along x.
 */
export function summonZones(g, summons) {
  const cells = summons.map((s) => cellOf(g, s));
  const xs = edges(g.x);
  const ys = edges(g.y);
  const out = [];
  for (let j = 0; j < ys.length - 1; j++) {
    const py = possibleCells((ys[j] + ys[j + 1]) / 2, g.y);
    let run = null;
    for (let i = 0; i < xs.length - 1; i++) {
      const px = possibleCells((xs[i] + xs[i + 1]) / 2, g.x);
      const hidden = [];
      const depends = [];
      cells.forEach((s, k) => {
        if (!isPlaced(summons[k])) return;
        const v = visibility(s, px, py);
        if (v === "hidden") hidden.push(k);
        else if (v === "depends") depends.push(k);
      });
      const key = `${hidden}|${depends}`;
      if (run && run.key === key) run.x1 = xs[i + 1];
      else {
        run = { x0: xs[i], x1: xs[i + 1], y0: ys[j], y1: ys[j + 1], hidden, depends, key };
        out.push(run);
      }
    }
  }
  return out;
}

/**
 * Each summon's status for a player standing at (x, y): visible, depends or hidden; null for
 * entries that aren't placed summons.
 */
export function statusesAt(g, summons, x, y) {
  const px = possibleCells(x, g.x);
  const py = possibleCells(y, g.y);
  return summons.map((s) => (isPlaced(s) ? visibility(cellOf(g, s), px, py) : null));
}

/**
 * The looting picture at cell level: the home cells (every summon visible) and, for the rest of
 * the walkable cells, which summons pause there, grouped as { summons: [index], cells: [{c, r}] }.
 */
export function pausePlan(g, summons) {
  const home = [];
  const groups = new Map();
  const cells = summons.map((s) => cellOf(g, s));
  for (let c = g.x.walk[0]; c <= g.x.walk[1]; c++)
    for (let r = g.y.walk[0]; r <= g.y.walk[1]; r++) {
      const paused = cells.flatMap((s, k) =>
        isPlaced(summons[k]) && (Math.abs(s.c - c) > 1 || Math.abs(s.r - r) > 1) ? [k] : [],
      );
      if (!paused.length) home.push({ c, r });
      else {
        const key = paused.join(",");
        if (!groups.has(key)) groups.set(key, { summons: paused, cells: [] });
        groups.get(key).cells.push({ c, r });
      }
    }
  return { home, pauses: [...groups.values()] };
}

/**
 * For a summon that "depends" from (x, y): the way to walk in so it's active, as a list of
 * "the left" / "the right" / "above" / "below". You're counted in the cell you came from until
 * you're past the band, so come from the summon's side along each axis where it matters.
 */
export function approachFrom(g, summon, x, y) {
  const sc = cellOf(g, summon);
  const out = [];
  const [xlo, xhi] = possibleCells(x, g.x);
  if (xlo !== xhi && (Math.abs(sc.c - xlo) > 1 || Math.abs(sc.c - xhi) > 1))
    out.push(sc.c < xlo + (xhi - xlo) / 2 ? "the left" : "the right");
  const [ylo, yhi] = possibleCells(y, g.y);
  if (ylo !== yhi && (Math.abs(sc.r - ylo) > 1 || Math.abs(sc.r - yhi) > 1))
    out.push(sc.r < ylo + (yhi - ylo) / 2 ? "above" : "below");
  return out;
}
