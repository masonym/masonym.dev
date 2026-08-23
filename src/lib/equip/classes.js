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
 */
export const CLASSES = [
  {
    key: "all",
    label: "All classes",
    mask: null,
    mainStat: null,
    subStat: null,
  },
  {
    key: "warrior",
    label: "Warrior",
    mask: 1,
    mainStat: "str",
    subStat: "dex",
  },
  {
    key: "magician",
    label: "Magician",
    mask: 2,
    mainStat: "int",
    subStat: "luk",
  },
  { key: "bowman", label: "Bowman", mask: 4, mainStat: "dex", subStat: "str" },
  { key: "thief", label: "Thief", mask: 8, mainStat: "luk", subStat: "dex" },
  { key: "pirate", label: "Pirate", mask: 16, mainStat: "str", subStat: "dex" },
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
