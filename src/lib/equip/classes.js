/**
 * Job branches, and the item filtering that follows from them.
 *
 * Equipment carries a `reqJob` bitmask naming every branch allowed to wear it:
 * 1 warrior, 2 magician, 4 bowman, 8 thief, 16 pirate. Combinations occur -
 * Xenon gear is 24 (thief | pirate), and a handful of items are 9 or 17. A
 * missing or zero `reqJob` means anyone can equip it, which covers most
 * accessories, medals and badges.
 *
 * This filters by who may *equip* an item, which is what the game enforces. It
 * does not filter by weapon type, so a thief still sees both claws and daggers.
 */

/**
 * `subStat` is the branch's secondary stat, the one paired with the main stat on
 * a dual-stat flame line. It has no effect on filtering - it exists so preset
 * gear (Red Beryl) can be filled in with the bonus stats it actually ships with.
 *
 * `stats` is every class-specific stat some job in the branch scales off, and
 * narrows the bonus stat and potential pickers (`statsFitClass`). It is wider
 * than main + sub because a branch is several jobs: thieves take STR for Shadower
 * and Dual Blade, and Max HP is on the warrior list for Demon Avenger.
 */
export const CLASSES = [
  {
    key: "all",
    label: "All classes",
    mask: null,
    mainStat: null,
    subStat: null,
    stats: null,
  },
  {
    key: "warrior",
    label: "Warrior",
    mask: 1,
    mainStat: "str",
    subStat: "dex",
    stats: ["str", "dex", "att", "hp"],
  },
  {
    key: "magician",
    label: "Magician",
    mask: 2,
    mainStat: "int",
    subStat: "luk",
    stats: ["int", "luk", "matt"],
  },
  {
    key: "bowman",
    label: "Bowman",
    mask: 4,
    mainStat: "dex",
    subStat: "str",
    stats: ["dex", "str", "att"],
  },
  {
    key: "thief",
    label: "Thief",
    mask: 8,
    mainStat: "luk",
    subStat: "dex",
    stats: ["luk", "dex", "str", "att"],
  },
  {
    key: "pirate",
    label: "Pirate",
    mask: 16,
    mainStat: "str",
    subStat: "dex",
    stats: ["str", "dex", "att"],
  },
];

export const DEFAULT_CLASS = "all";

const BY_KEY = Object.fromEntries(CLASSES.map((c) => [c.key, c]));

export function getClass(key) {
  return BY_KEY[key] ?? BY_KEY[DEFAULT_CLASS];
}

/** True when a character of this branch is allowed to equip `item`. */
export function itemMatchesClass(item, classKey) {
  const mask = getClass(classKey).mask;
  if (mask === null) return true;

  // No requirement recorded → equippable by everyone.
  const reqJob = item?.reqJob;
  if (!reqJob) return true;

  return (reqJob & mask) !== 0;
}

/**
 * Stats that only some branches care about, mapped to the base stat a class's
 * `stats` names. Anything not listed here - All Stat %, boss, IED, crit, DEF,
 * utility - is useful to, or at least rollable by, everyone and never filtered.
 */
const CLASS_STAT_BASE = {
  str: "str",
  strP: "str",
  strPerLv: "str",
  dex: "dex",
  dexP: "dex",
  dexPerLv: "dex",
  int: "int",
  intP: "int",
  intPerLv: "int",
  luk: "luk",
  lukP: "luk",
  lukPerLv: "luk",
  att: "att",
  attP: "att",
  matt: "matt",
  mattP: "matt",
  hp: "hp",
  hpP: "hp",
  hpPerLv: "hp",
};

/**
 * True when a line granting `keys` is worth offering to this class.
 *
 * One matching stat is enough, so a STR + INT flame still shows for a mage and
 * All Stat % shows for everyone. A line with no class-specific stat always
 * passes.
 */
export function statsFitClass(keys, classKey) {
  const stats = getClass(classKey).stats;
  if (!stats) return true;

  const gated = keys.filter((key) => Object.hasOwn(CLASS_STAT_BASE, key));
  return (
    gated.length === 0 ||
    gated.some((key) => stats.includes(CLASS_STAT_BASE[key]))
  );
}
