/**
 * The equip comparison engine.
 *
 * The central constraint: you cannot compare two *items*, only two *loadouts*.
 * Set effects are counted across the whole equipped set, so swapping one piece
 * changes the bonuses granted by the pieces you kept. A two-item diff cannot be
 * correct in general, so everything here is loadout-shaped.
 *
 * Every function is pure. Data comes from public/equip-data/ (see
 * docs/equip-compare-data.md).
 */

import { emptyStats, addInto, sumStats, diffStats } from './stats.js';
import { starForceGains, gainsStarForceAttack } from './starforce.js';
import { resolveFlames, acceptsFlames, flameContext } from './flames.js';

/**
 * Equipment slots a character actually has, and how many of each.
 * Rings are the only genuinely repeated slot.
 */
export const LOADOUT_SLOTS = [
  { key: 'hat',       label: 'Hat' },
  { key: 'top',       label: 'Top' },
  { key: 'bottom',    label: 'Bottom' },
  { key: 'shoes',     label: 'Shoes' },
  { key: 'gloves',    label: 'Gloves' },
  { key: 'cape',      label: 'Cape' },
  { key: 'shoulder',  label: 'Shoulder' },
  { key: 'weapon',    label: 'Weapon' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'face',      label: 'Face Accessory' },
  { key: 'eye',       label: 'Eye Accessory' },
  { key: 'earrings',  label: 'Earrings' },
  { key: 'pendant',   label: 'Pendant 1' },
  { key: 'pendant2',  label: 'Pendant 2' },
  { key: 'ring1',     label: 'Ring 1' },
  { key: 'ring2',     label: 'Ring 2' },
  { key: 'ring3',     label: 'Ring 3' },
  { key: 'ring4',     label: 'Ring 4' },
  { key: 'belt',      label: 'Belt' },
  { key: 'medal',     label: 'Medal' },
  { key: 'badge',     label: 'Badge' },
  { key: 'pocket',    label: 'Pocket' },
  { key: 'emblem',    label: 'Emblem' },
  { key: 'heart',     label: 'Heart' },
];

/**
 * Slot code → the loadout slot keys it can occupy.
 *
 * These are mostly raw WZ `islot` codes. Two are synthesised by
 * build-equip-data.mjs because the WZ code is ambiguous:
 *   - `Em` emblems, which share islot `Si` with shields and secondaries
 *   - `Ht` mechanical hearts, which share islot `Tm` with androids and mounts
 * Both keep their original code in `item.islot` for potential-table lookups.
 */
export const ISLOT_TO_SLOTS = {
  Cp: ['hat'],
  Ma: ['top'],
  Pn: ['bottom'],
  MaPn: ['top', 'bottom'],
  So: ['shoes'],
  Gv: ['gloves'],
  Sr: ['cape'],
  Sh: ['shoulder'],
  Wp: ['weapon'],
  WpSi: ['weapon', 'secondary'],
  Si: ['secondary'],
  Af: ['face'],
  Ay: ['eye'],
  Ae: ['earrings'],
  Pe: ['pendant', 'pendant2'],
  Ri: ['ring1', 'ring2', 'ring3', 'ring4'],
  Be: ['belt'],
  Me: ['medal'],
  Ba: ['badge'],
  Po: ['pocket'],
  Em: ['emblem'],
  Ht: ['heart'],
};

/**
 * Slot codes whose item fills more than one loadout slot at once, listed
 * primary slot first.
 *
 * This is an *occupancy* list, not a list of slots the item can be equipped
 * into. A two-handed weapon goes in the weapon slot and merely covers the
 * secondary — it is not a secondary you can choose. Conflating the two is what
 * used to put every two-hander in the Secondary picker.
 */
export const MULTI_SLOT_ISLOTS = {
  WpSi: ['weapon', 'secondary'],
  MaPn: ['top', 'bottom'],
};

/** Which loadout slots an item placed in `slotKey` actually occupies. */
export function occupiedSlots(item, slotKey) {
  if (!item) return [slotKey];
  const multi = MULTI_SLOT_ISLOTS[item.slot];
  return multi ? [...multi] : [slotKey];
}

/** The loadout slots an item can actually be equipped into. */
export function equippableSlots(item) {
  if (!item) return [];
  const multi = MULTI_SLOT_ISLOTS[item.slot];
  if (multi) return [multi[0]];
  return ISLOT_TO_SLOTS[item.slot] ?? [];
}

/** True when `item` can be equipped into `slotKey`. */
export function itemFitsSlot(item, slotKey) {
  return equippableSlots(item).includes(slotKey);
}

/**
 * The WZ islot the potential tables are keyed by.
 *
 * Emblems and hearts carry a synthesised `slot`, so their potential lines must
 * still be looked up under the original WZ code.
 */
export function potentialIslot(item) {
  return item?.islot ?? item?.slot ?? null;
}

/**
 * The potential lines actually on an item.
 *
 * 310 items ship with their potential already decided and recorded in the WZ —
 * Dominator Pendant, the Tower of Oz emblems, the Krrr rings. Those lines are
 * used unless the user has entered their own, so the item resolves correctly the
 * moment it is equipped rather than reading as unpotentialed.
 *
 * The rest of the fixed-potential items (Red Beryl and friends) carry only a
 * `fixedPotential` flag: their lines are picked per job when the item is granted
 * and are genuinely absent from the data, so nothing can be filled in for them.
 */
export function effectivePotentials(item, chosen = []) {
  if (chosen.length) return chosen;
  return item?.presetPotential ?? [];
}

/** Level index used by the potential tables: ceil(reqLevel / 10), clamped 1..25. */
export function potentialLevelIndex(reqLevel) {
  return Math.min(Math.max(Math.ceil((reqLevel || 0) / 10), 1), 25);
}

/** Picks the tier whose `from` is the greatest value <= levelIndex. */
export function potentialValueAt(line, levelIndex) {
  if (!line?.tiers?.length) return null;
  let chosen = null;
  for (const tier of line.tiers) {
    if (tier.from <= levelIndex) chosen = tier;
    else break;
  }
  return chosen ? chosen.stats : null;
}

/** True when `line` may roll on an item with this islot. */
export function potentialAllowedOn(line, islot) {
  if (!line.slots) return true;     // no restriction recorded → any slot
  return line.slots.includes(islot);
}

/** How many Exceptional Hammers this item can take. */
export function exceptionalSlots(item) {
  return item?.exceptional ? (item.exceptionalSlots ?? 0) : 0;
}

/**
 * Stats from `count` Exceptional Hammers.
 *
 * Every hammer for a slot grants the same block, and an item may take several —
 * Immortal Legacy and Original Sin of Pride take three each — so the bonus is
 * simply multiplied. The count is clamped rather than trusted, because a saved
 * config outlives the data it was entered against.
 */
export function exceptionalGains(item, count = 0) {
  const applied = Math.min(Math.max(count, 0), exceptionalSlots(item));
  if (applied <= 0) return null;

  const out = {};
  for (const [key, value] of Object.entries(item.exceptional)) out[key] = value * applied;
  return out;
}

/**
 * Resolves one configured item into stat blocks grouped by source.
 *
 * Modifier order matters and follows the game:
 *   1. base stats, scrolls / soul / exceptional (flat), and potential / bonus
 *      potential — everything that behaves like a fixed part of the item
 *   2. star force — for weapons below 15 stars the attack gain compounds over
 *      base + scroll attack, so scrolls must already be counted
 *   3. flames — attack flames scale off *base* attack only, not scrolled attack
 *
 * Kept separate (rather than summed) so callers like the item tooltip can show
 * where each point of a stat came from.
 *
 * @param {object} item      Record from items.json.
 * @param {object} config    User-entered modifiers for this item.
 * @param {Map}    lineIndex Map of optionId → potential line, from potentials.json.
 * @returns { base, starforce, flame } stat blocks.
 */
export function resolveItemBreakdown(item, config = {}, lineIndex = new Map()) {
  const base = emptyStats();
  const starforce = emptyStats();
  const flame = emptyStats();
  if (!item) return { base, starforce, flame };

  const {
    stars = 0,
    flames = [],
    potentials = [],
    bonusPotentials = [],
    scrolls = null,
    soul = null,
    exceptional = 0,
    effectiveLevel = null,
  } = config;

  const level = effectiveLevel ?? item.reqLevel ?? 0;
  const baseAttack = item.stats?.att || 0;
  const baseMagic = item.stats?.matt || 0;

  // base item stats
  addInto(base, item.stats || {});

  // flat additions that behave like part of the item
  const scrollAttack = scrolls?.att || 0;
  const scrollMagic = scrolls?.matt || 0;
  if (scrolls) addInto(base, scrolls);
  if (soul) addInto(base, soul);
  addInto(base, exceptionalGains(item, exceptional));

  // star force
  if (stars > 0) {
    addInto(starforce, starForceGains({
      level,
      stars,
      slot: item.slot,
      superior: Boolean(item.superior),
      gainsAtt: gainsStarForceAttack(item.slot),
      baseAttack: baseAttack + scrollAttack,
      baseMagic: baseMagic + scrollMagic,
    }));
  }

  // flames — scale off base attack, deliberately excluding scroll attack.
  // Checked rather than trusted: a config can outlive the item it was entered
  // against, and rings and secondaries take no bonus stats at all.
  if (flames.length && acceptsFlames(item)) {
    addInto(flame, resolveFlames(flames, { ...flameContext(item), level }));
  }

  // potential + bonus potential
  const levelIndex = potentialLevelIndex(level);
  for (const entry of [...effectivePotentials(item, potentials), ...bonusPotentials]) {
    if (!entry?.optionId) continue;
    const line = lineIndex.get(entry.optionId);
    if (!line) continue;
    const stats = potentialValueAt(line, entry.levelIndex ?? levelIndex);
    if (stats) addInto(base, stats);
  }

  return { base, starforce, flame };
}

/** Resolves one configured item into a single summed stat block. */
export function resolveItem(item, config = {}, lineIndex = new Map()) {
  const { base, starforce, flame } = resolveItemBreakdown(item, config, lineIndex);
  return sumStats(base, starforce, flame);
}

/**
 * Counts how many pieces of each set a loadout has equipped.
 *
 * Multi-slot items (two-handers, overalls) still count as a single piece — they
 * fill two slots but are one item.
 *
 * @returns Map of setId → piece count.
 */
export function countSetPieces(entries) {
  const counts = new Map();
  for (const { item } of entries) {
    if (!item?.setId) continue;
    counts.set(item.setId, (counts.get(item.setId) || 0) + 1);
  }
  return counts;
}

/**
 * Resolves the set bonuses a loadout earns.
 *
 * Set effects are cumulative: a 4-piece set grants the 2-, 3- and 4-piece
 * entries together, so every threshold at or below the equipped count applies.
 *
 * @returns { stats, active: [{ setId, name, pieces, thresholds }] }
 */
export function resolveSetEffects(entries, setIndex) {
  const out = emptyStats();
  const active = [];
  const counts = countSetPieces(entries);

  for (const [setId, pieces] of counts) {
    const set = setIndex.get(setId);
    if (!set) continue;

    const thresholds = Object.keys(set.effects)
      .map(Number)
      .filter((n) => n <= pieces)
      .sort((a, b) => a - b);

    if (!thresholds.length) continue;

    for (const t of thresholds) addInto(out, set.effects[String(t)]);
    active.push({ setId, name: set.name, pieces, thresholds });
  }

  active.sort((a, b) => b.pieces - a.pieces);
  return { stats: out, active };
}

/**
 * Resolves a whole loadout.
 *
 * @param {object} loadout   { [slotKey]: { itemId, ...config } }
 * @param {object} data      { itemIndex, lineIndex, setIndex }
 * @returns { stats, items, sets, setStats }
 */
export function resolveLoadout(loadout = {}, data = {}) {
  const { itemIndex = new Map(), lineIndex = new Map(), setIndex = new Map() } = data;

  // Collect one entry per distinct item, so a two-hander occupying two slots is
  // not counted (or stat-summed) twice.
  const seen = new Set();
  const entries = [];

  for (const { key } of LOADOUT_SLOTS) {
    const config = loadout[key];
    if (!config?.itemId) continue;

    const item = itemIndex.get(config.itemId);
    if (!item) continue;

    // A multi-slot item is registered under its primary slot only.
    const slots = occupiedSlots(item, key);
    const primary = slots[0];
    if (primary !== key && loadout[primary]?.itemId === config.itemId) continue;

    const dedupeKey = `${primary}:${config.itemId}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    entries.push({ slotKey: key, item, config, stats: resolveItem(item, config, lineIndex) });
  }

  const { stats: setStats, active: sets } = resolveSetEffects(entries, setIndex);

  const stats = sumStats(...entries.map((e) => e.stats), setStats);

  return { stats, items: entries, sets, setStats };
}

/**
 * Diffs two loadouts.
 *
 * @returns {
 *   rows,          per-stat deltas (see diffStats)
 *   before, after, the resolved loadouts
 *   setChanges,    sets whose piece count or thresholds changed
 * }
 */
export function diffLoadouts(beforeLoadout, afterLoadout, data) {
  const before = resolveLoadout(beforeLoadout, data);
  const after = resolveLoadout(afterLoadout, data);

  const setChanges = diffSets(before.sets, after.sets);

  return {
    rows: diffStats(before.stats, after.stats),
    before,
    after,
    setChanges,
  };
}

/** Sets whose piece count changed between two loadouts. */
function diffSets(beforeSets, afterSets) {
  const byId = new Map();
  for (const s of beforeSets) byId.set(s.setId, { ...s, beforePieces: s.pieces, afterPieces: 0 });
  for (const s of afterSets) {
    const existing = byId.get(s.setId);
    if (existing) existing.afterPieces = s.pieces;
    else byId.set(s.setId, { ...s, beforePieces: 0, afterPieces: s.pieces });
  }

  return [...byId.values()]
    .filter((s) => s.beforePieces !== s.afterPieces)
    .map(({ setId, name, beforePieces, afterPieces }) => ({
      setId, name, beforePieces, afterPieces, delta: afterPieces - beforePieces,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Convenience: swap a single item into a loadout and diff against the original.
 * This is the common "should I equip this?" question, expressed the only way it
 * can be answered correctly — as a loadout comparison.
 */
export function diffItemSwap(loadout, slotKey, newConfig, data) {
  const after = { ...loadout, [slotKey]: newConfig };

  // Equipping a two-hander clears the secondary; equipping an overall clears
  // top and bottom. Without this the diff would double-count the displaced item.
  const newItem = newConfig?.itemId ? data.itemIndex?.get(newConfig.itemId) : null;
  if (newItem) {
    for (const s of occupiedSlots(newItem, slotKey)) {
      if (s !== slotKey) delete after[s];
    }
  }

  return diffLoadouts(loadout, after, data);
}

/** Builds the lookup indexes the engine expects from the raw fetched JSON. */
export function buildIndexes({ items = [], potentials = [], sets = [] }) {
  const itemIndex = new Map();

  // Aliases first, so a real item always wins if an id somehow appears as both.
  // They exist because the build folds re-issued duplicates into one record, and
  // a loadout saved before that still names the id that was dropped.
  for (const item of items) {
    for (const alias of item.aliases ?? []) itemIndex.set(alias, item);
  }
  for (const item of items) itemIndex.set(item.id, item);

  return {
    itemIndex,
    lineIndex: new Map(potentials.map((p) => [p.id, p])),
    setIndex: new Map(sets.map((s) => [s.id, s])),
  };
}
