/**
 * Which items the picker offers for a slot, and in what order.
 *
 * Two kinds of rule live here and it matters which is which:
 *
 *   - Slot and class are **hard constraints**. An item that fails them cannot be
 *     equipped, so hiding it is never wrong.
 *   - Notability and the level floor are an optional **noise filter**, and they
 *     are off by default. See below.
 *
 * ── Why the noise filter is not the default ──────────────────────────────────
 * It used to be. The `notable` flag is inferred from boss-drop and set-membership
 * flags in the WZ, and those flags miss real gear: the Princess No secondaries
 * carry neither, so a whole generation of endgame secondaries vanished from the
 * picker. Chaos Horntail Necklace and Sweetwater Pendant miss them too.
 *
 * There is no fix for that short of curating several thousand items by hand,
 * because the game does not record what we are trying to infer. So the picker
 * stopped inferring: it shows everything and **orders by an estimate of power**
 * instead. Ranking cannot hide anything, so being wrong about an item costs it a
 * few rows rather than removing it from the tool. `notable` survives as a filter
 * you can switch on, never as one applied for you.
 */

import { itemFitsSlot } from "./engine.js";
import { getClass, itemMatchesClass } from "./classes.js";
import { starCap, starForceGains, gainsStarForceAttack } from "./starforce.js";

export const DEFAULT_FILTERS = { notableOnly: false, minLevel: 0 };

/**
 * Weights for the ordering score, in points of main stat.
 *
 * Main stat is the unit — one point of STR for a warrior is 1 — and everything
 * else is priced against it:
 *
 *   1 attack / magic attack        3
 *   1% main stat, All Stat, attack 10
 *   1% boss damage, damage         10
 *   1% ignore DEF                  5
 *
 * This is a sort key, not a damage model. It exists to put the six items you
 * might actually equip above the two hundred you never will, and it is judged
 * only on whether it does that.
 *
 * The rates below the line are not anchored to anything the way the four above
 * are; they are set to keep the same relative footing they had before the
 * rebasing, which is enough for a sort key.
 */
const ATTACK_WEIGHT = 3;
const PERCENT_WEIGHT = 10;

const SCORE_WEIGHTS = {
  boss: PERCENT_WEIGHT,
  dmg: PERCENT_WEIGHT,
  ied: 5,
  critDmg: PERCENT_WEIGHT,
  critRate: 4,
  attackCount: 24,
  hp: 0.01,
};

const MAIN_STATS = ["str", "dex", "int", "luk"];

/**
 * The star count every item is scored at, or its own ceiling if that is lower.
 *
 * Base stats alone rank the picker badly: the biggest single source of stat on
 * endgame gear is star force, and plenty of high-base gear cannot be starred at
 * all — quest weapons, badges, emblems, every medal. Scoring those on base stats
 * put them straight to the top of lists they do not belong in.
 *
 * 22 rather than each item's own cap, because comparing every item at whatever
 * ceiling it happens to have rewards the ceiling instead of the item: it ranked
 * the unliberated Sealed Genesis weapons, which cap at 30, above the Genesis
 * weapons they turn into, which are fixed at 22. A shared reference point is
 * also closer to what people actually own.
 */
const SCORE_STARS = 22;
const SCORE_STARS_SUPERIOR = 12;

function referenceStarStats(item) {
  const stars = Math.min(
    starCap(item),
    item.superior ? SCORE_STARS_SUPERIOR : SCORE_STARS,
  );
  if (stars <= 0) return null;

  return starForceGains({
    level: item.reqLevel,
    stars,
    slot: item.slot,
    superior: Boolean(item.superior),
    gainsAtt: gainsStarForceAttack(item.slot),
    baseAttack: item.stats?.att ?? 0,
    baseMagic: item.stats?.matt ?? 0,
  });
}

/**
 * Rough power estimate, used only to order the picker.
 *
 * Attack and main stat are counted **once**, not once per variant. A heart with
 * 77 ATT and 77 MATT is a 77-attack item to every class, not a 154-attack one,
 * and 25 of all four stats is 25 points of main stat plus change. Summing the
 * raw keys made all-stat gear look twice as good as it is.
 *
 * Set membership is counted as the average share of its set's whole bonus that
 * one piece unlocks (`set.perPiece`, computed at build time). Ignoring it used
 * to be defensible on the grounds that set pieces score well on raw stats
 * anyway — but the gear it misjudges is exactly the gear that has no set. A 15★
 * Tyrant piece really does carry more attack than the Arcane Umbra piece that
 * replaced it, and the only reason it is not the better item is the set bonus.
 *
 * @param {object} item
 * @param {string} classKey Narrows attack and main stat to the ones that matter
 *   to that job. Without it the best variant is used, which is the right guess
 *   when no class has been picked.
 * @param {Map} setIndex setId → set record. Omitted, sets simply do not count.
 */
export function itemScore(item, classKey = "all", setIndex = null) {
  const main = getClass(classKey).mainStat;
  const stars = referenceStarStats(item);
  const set = item.setId ? setIndex?.get(item.setId) : null;

  // Star force adds the same amount to every main stat, and the set share adds
  // whatever the set grants, so both are folded into the base bag rather than
  // scored separately.
  const s = { ...item.stats };
  for (const [key, value] of Object.entries(set?.perPiece ?? {})) {
    s[key] = (s[key] ?? 0) + value;
  }
  if (stars) {
    for (const key of [...MAIN_STATS, "att", "matt", "hp"]) {
      s[key] = (s[key] ?? 0) + stars[key];
    }
  }

  const magic = main === "int";
  const attack = main
    ? ((magic ? s.matt : s.att) ?? 0)
    : Math.max(s.att ?? 0, s.matt ?? 0);
  const attackP = main
    ? ((magic ? s.mattP : s.attP) ?? 0)
    : Math.max(s.attP ?? 0, s.mattP ?? 0);

  const pick = (suffix) =>
    main
      ? (s[`${main}${suffix}`] ?? 0)
      : Math.max(...MAIN_STATS.map((k) => s[`${k}${suffix}`] ?? 0));

  const flatStat = pick("") + (s.allStat ?? 0);
  const pctStat = pick("P") + (s.allStatP ?? 0);

  let total =
    attack * ATTACK_WEIGHT +
    attackP * PERCENT_WEIGHT +
    flatStat +
    pctStat * PERCENT_WEIGHT;
  for (const [key, weight] of Object.entries(SCORE_WEIGHTS)) {
    total += weight * (s[key] ?? 0);
  }
  return total;
}

/**
 * itemScore memoised per item and class.
 *
 * Scoring now walks the star force tables, and a sort calls the comparator
 * O(n log n) times over lists of several thousand items. The cache is keyed by
 * the item object, so a dataset reload drops it.
 */
const scoreCache = new WeakMap();

function cachedScore(item, classKey, setIndex) {
  let byClass = scoreCache.get(item);
  if (!byClass) {
    byClass = new Map();
    scoreCache.set(item, byClass);
  }
  if (!byClass.has(classKey))
    byClass.set(classKey, itemScore(item, classKey, setIndex));
  return byClass.get(classKey);
}

/** Level floors offered by the UI, coarse enough to be one click. */
export const LEVEL_STEPS = [0, 100, 120, 140, 160, 200];

/**
 * Slots the level floor applies to.
 *
 * Armour and weapons come in level-ordered tiers, so a floor is exactly the
 * right way to skip the ones you have outgrown. Nothing else does.
 *
 * The accessory family doesn't — Crystal Ventus Badge is level 130, Black Heart
 * 120, Golden Flower 120, and all three are current gear. Neither do secondaries:
 * there are essentially two generations of them, Princess No at 140 and Astra at
 * 200, and a floor at 140 empties the slot outright for bowmen and pirates.
 *
 * All of those lists are already down to a few dozen once notability has run, so
 * a floor would cost real items and buy nothing. The UI hides the control for
 * these slots rather than applying it invisibly.
 */
export const LEVEL_FILTERED_SLOTS = new Set([
  "hat",
  "top",
  "bottom",
  "shoes",
  "gloves",
  "cape",
  "shoulder",
  "weapon",
]);

/** True when the level floor has any effect on this slot. */
export function levelFilterApplies(slotKey) {
  return LEVEL_FILTERED_SLOTS.has(slotKey);
}

/** Items that could go in `slotKey` at all, before the user's noise filter. */
export function slotCandidates(items, slotKey, classKey) {
  return items.filter(
    (i) => itemFitsSlot(i, slotKey) && itemMatchesClass(i, classKey),
  );
}

/**
 * The picker's list for one slot.
 *
 * @param {Array}  items
 * @param {object} opts { slotKey, classKey, currentId, notableOnly, minLevel }
 */
export function filterItemsForSlot(
  items,
  {
    slotKey,
    classKey,
    currentId = null,
    notableOnly = DEFAULT_FILTERS.notableOnly,
    minLevel = DEFAULT_FILTERS.minLevel,
  } = {},
) {
  const byLevel = levelFilterApplies(slotKey);

  return slotCandidates(items, slotKey, classKey).filter((i) => {
    // Never hide what is already equipped — turning a filter on would otherwise
    // hide the very thing being replaced.
    if (i.id === currentId) return true;
    if (notableOnly && !i.notable) return false;
    return !byLevel || i.reqLevel >= minLevel;
  });
}

/**
 * Comparator ordering items strongest-first for a class.
 *
 * Level breaks ties because two items with the same stats are usually the same
 * item re-issued, and the later one is the one still obtainable.
 */
export function byPower(classKey = "all", setIndex = null) {
  return (a, b) =>
    cachedScore(b, classKey, setIndex) - cachedScore(a, classKey, setIndex) ||
    b.reqLevel - a.reqLevel ||
    a.name.localeCompare(b.name);
}
