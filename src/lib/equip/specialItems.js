/**
 * Gear that is granted already configured.
 *
 * A handful of items are handed out complete — a fixed star count, a fixed
 * potential and a fixed set of bonus stats — and none of that is in the WZ. The
 * client picks the lines per job at the moment the item is granted, so the dump
 * records only that the potential *is* fixed, never what it is.
 *
 * So it is transcribed here, keyed by the branch's main stat. These are only
 * defaults: the moment an item is equipped its configuration belongs to the
 * user, and every value below can be changed in the slot editor.
 *
 * The star counts live in the data instead — see the star force section of
 * build-equip-data.mjs — because those are a property of the item rather than of
 * the character wearing it.
 */

import { getClass } from './classes.js';
import { starCap, starFloor } from './starforce.js';

/** Main-stat % potential lines, by grade. Unique rolls 10%, epic 7%. */
const UNIQUE_MAIN_PCT = { str: 30041, dex: 30042, int: 30043, luk: 30044 };
const EPIC_MAIN_PCT = { str: 20041, dex: 20042, int: 20043, luk: 20044 };

/** Canonical stat order, which is also the order dual flame lines are named in. */
const STAT_ORDER = ['str', 'dex', 'int', 'luk'];

/** The FLAME_LINES key for the dual line covering both stats, e.g. 'strDex'. */
function dualFlameLine(a, b) {
  const [first, second] = STAT_ORDER.filter((k) => k === a || k === b);
  if (!first || !second) return null;
  return `${first}${second[0].toUpperCase()}${second.slice(1)}`;
}

/**
 * The Red Beryl rental accessories.
 *
 * Every piece ships at 20★ with a Unique potential (10% / 7% / 7% main stat) and
 * four tier-5 bonus stat lines: main stat, main + secondary, All Stat %, and
 * attack. Listed by id because `fixedPotential` alone covers far more items than
 * this, and only these five are known to roll exactly this configuration.
 */
const RED_BERYL_IDS = new Set([
  1012902, // Face Accessory
  1022375, // Eye Accessory
  1032361, // Earrings
  1122453, // Pendant
  1132336, // Belt
]);

function redBerylPreset(mainStat, subStat) {
  const dual = dualFlameLine(mainStat, subStat);
  return {
    potentials: [
      { optionId: UNIQUE_MAIN_PCT[mainStat] },
      { optionId: EPIC_MAIN_PCT[mainStat] },
      { optionId: EPIC_MAIN_PCT[mainStat] },
    ],
    flames: [
      { line: mainStat, tier: 5 },
      ...(dual ? [{ line: dual, tier: 5 }] : []),
      { line: 'allStat', tier: 5 },
      { line: mainStat === 'int' ? 'matt' : 'att', tier: 5 },
    ],
  };
}

/** True when this item ships with a configuration we know how to fill in. */
export function hasPreset(item) {
  return Boolean(item) && RED_BERYL_IDS.has(item.id);
}

/**
 * The configuration an item is granted with, or null when it has none.
 *
 * Returns null when the class is "all classes" too: which lines a preset rolls
 * depends entirely on the wearer's main stat, and guessing one would be worse
 * than leaving the fields empty for the user to fill in.
 */
export function itemPreset(item, classKey) {
  if (!hasPreset(item)) return null;

  const { mainStat, subStat } = getClass(classKey);
  if (!mainStat) return null;

  return redBerylPreset(mainStat, subStat);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * The slot configuration to use when `item` is picked.
 *
 * Whatever the slot was already set to is kept — swapping an item is usually a
 * "same stars, same flames, different piece" comparison — except on preset gear,
 * where the item's own configuration is the point.
 *
 * Stars are always brought inside the new item's range, so moving a 25★ config
 * onto a 20★-capped piece cannot leave an unreachable number behind. A flame
 * advantage override goes with the item it was entered for and is dropped, so
 * the new piece starts on whatever its own data says.
 */
export function configForItem(item, classKey, previous = null) {
  const preset = itemPreset(item, classKey);
  const next = { ...(previous || {}), ...(preset || {}), itemId: item.id };

  next.stars = clamp(next.stars ?? 0, starFloor(item), starCap(item));
  delete next.advantaged;

  return next;
}
