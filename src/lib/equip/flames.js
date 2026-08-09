/**
 * Flame (bonus stat) values.
 *
 * Not in the WZ files. Transcribed from the MapleStory Wiki's Bonus Stats stat
 * tables (https://maplestorywiki.net/w/Bonus_Stats/Stat_Tables), which is the
 * authority for every number here; all functions are pure.
 *
 * Flame tiers run 1-7, but not every tier is reachable on every line — see
 * `tierRange` below.
 *
 * ── Flame advantage ──────────────────────────────────────────────────────────
 * Most boss drops and boss-currency gear are Flame Advantaged: they roll higher
 * tiers and are guaranteed all four lines. For every stat except attack that is
 * purely a rolling rule — a tier-5 STR line is worth the same either way — so
 * nothing here needs to know about it.
 *
 * Attack on a *weapon* is the exception, and the wiki lists it as two separate
 * tables. Advantaged weapons roll tiers 3-7 off one curve, ordinary weapons
 * tiers 1-5 off another, and at the same tier number the two do not agree. Both
 * are offered as their own line rather than hidden behind a toggle, so the value
 * you can see on your weapon is the value you click.
 */

export const FLAME_TIERS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Slots a Rebirth Flame cannot be used on.
 *
 * Nothing in the WZ records this, so it is transcribed from the wiki's Bonus
 * Stats restrictions: secondaries and shields, emblems, badges, medals, rings,
 * androids and mechanical hearts, shoulders and totems.
 *
 * `Si` covers shields as well as class secondaries and katara. Androids are not
 * modelled as a slot, so only their hearts appear. Pocket items are deliberately
 * absent — the wiki's restriction list does not name them.
 */
const SLOTS_WITHOUT_FLAMES = new Set(['Ri', 'Sh', 'Me', 'Em', 'Ba', 'Ht', 'Si']);

/**
 * Individual items that take flames despite sitting in an excluded slot.
 *
 * The wiki names these as exceptions to the slot rules; these are the two that
 * exist in the GMS dump. Ancient Slate Replica is also named upstream but is a
 * totem, which is not a slot we model.
 */
const FLAMEABLE_EXCEPTIONS = new Set([
  1152155, // Scarlet Shoulder
  1143471, // Immortal Legacy (medal)
]);

/** True when this item can carry bonus stats. */
export function acceptsFlames(item) {
  if (!item) return false;
  if (FLAMEABLE_EXCEPTIONS.has(item.id)) return true;
  return !SLOTS_WITHOUT_FLAMES.has(item.slot);
}

/** True when the item is a weapon, which several lines are restricted to. */
export function isWeaponSlot(slot) {
  return slot === 'Wp' || slot === 'WpSi';
}

/**
 * Bucket index (1-based) for a level, given inclusive [from, to] ranges.
 * Returns the last bucket for anything above the table.
 */
function bucketOf(ranges, level) {
  for (let i = 0; i < ranges.length; i += 1) {
    if (level >= ranges[i][0] && level <= ranges[i][1]) return i + 1;
  }
  return ranges.length;
}

/**
 * Single-stat (STR only, DEX only, …) and DEF buckets.
 *
 * Twenty levels wide up to 199, and then not: 200-229 share a bucket and 230+
 * is the last. A formula over `level / 20` gets 220-229 wrong, so the ranges are
 * listed as the wiki lists them.
 */
const SINGLE_STAT_RANGES = [
  [0, 19], [20, 39], [40, 59], [60, 79], [80, 99], [100, 119],
  [120, 139], [140, 159], [160, 179], [180, 199], [200, 229], [230, Infinity],
];

/** Single-stat flame value: bucket index × tier. */
export function singleStatFlame(level, tier) {
  if (tier < 1 || tier > 7) return 0;
  return bucketOf(SINGLE_STAT_RANGES, level) * tier;
}

/**
 * Dual-stat (STR+DEX, INT+LUK, …) buckets — the value applies to *each* of the
 * two stats. Forty levels wide, except 200-249 which is one bucket.
 */
const DUAL_STAT_RANGES = [
  [0, 39], [40, 79], [80, 119], [120, 159], [160, 199], [200, 249], [250, Infinity],
];

export function dualStatFlame(level, tier) {
  if (tier < 1 || tier > 7) return 0;
  return bucketOf(DUAL_STAT_RANGES, level) * tier;
}

/**
 * HP / MP flame values.
 *
 * Ten levels wide. The first bucket is 3 per tier and the rest step by 30 per
 * tier — until level 210, where the step drops to 20 and stays there to the
 * 250+ cap of 700 per tier. Level 250 equipment exists (the Eternal set, the
 * Destiny weapons), so the flattening is not hypothetical.
 */
export function hpFlame(level, tier) {
  if (tier < 1 || tier > 7) return 0;

  const bucket = Math.floor(Math.max(level, 0) / 10);
  if (bucket === 0) return 3 * tier;
  if (bucket <= 20) return 30 * bucket * tier;
  return (600 + 20 * Math.min(bucket - 20, 5)) * tier;
}

/**
 * Attack / magic attack on a **weapon**, as a fraction of its base attack.
 *
 * `bucket × tier × 1.1^(tier - offset)` percent, where the bucket is the same
 * forty-level bucket the dual-stat lines use. The offset is 1 for an ordinary
 * weapon and 3 for a flame advantaged one, which is the whole of the difference
 * between the two published tables.
 *
 * @param {number} baseAttack The weapon's base attack (or magic attack).
 * @param {number} level Item level.
 * @param {number} tier Flame tier.
 * @param {boolean} advantaged Flame advantaged ("boss flame") weapon.
 * @returns The attack gained, rounded up as the game does.
 */
export function weaponAttackFlame(baseAttack, level, tier, advantaged = false) {
  if (!baseAttack || baseAttack <= 0) return 0;
  if (tier < 1 || tier > 7) return 0;

  const bucket = bucketOf(DUAL_STAT_RANGES, level);
  const percent = bucket * tier * 1.1 ** (tier - (advantaged ? 3 : 1));

  // Cleaned before it is rounded up: 1.1**2 is 1.2100000000000002 in binary
  // floating point, and rounding up turns that dust into a whole extra attack.
  return Math.ceil(Math.round(percent * baseAttack * 1e4) / 1e6);
}

/**
 * Attack / magic attack on anything that is not a weapon: a flat +1 per tier,
 * at every level, regardless of what the piece's own attack is.
 *
 * This is why armour with no attack at all can still roll an attack line — and
 * why scaling it off base attack, as the weapon tables do, produced a column of
 * 1s on every accessory.
 */
export function nonWeaponAttackFlame(tier) {
  return tier >= 1 && tier <= 7 ? tier : 0;
}

/** All Stat % flame: 1% per tier. */
export function allStatFlame(tier) {
  return tier >= 1 && tier <= 7 ? tier : 0;
}

/** Boss damage % flame: 2% per tier. */
export function bossDamageFlame(tier) {
  return tier >= 1 && tier <= 7 ? tier * 2 : 0;
}

/** Damage % flame: 1% per tier. */
export function damageFlame(tier) {
  return tier >= 1 && tier <= 7 ? tier : 0;
}

/** Speed / Jump flame: 1 per tier. */
export function speedJumpFlame(tier) {
  return tier >= 1 && tier <= 7 ? tier : 0;
}

/**
 * Tier ranges for the two weapon attack curves.
 *
 * The restriction is a property of the weapon tables, not of the attack line:
 * on anything that is not a weapon, attack is the flat +1-per-tier table and
 * rolls the full 1-7 like every other line.
 */
const ALL_TIERS = [1, 7];
const ORDINARY_WEAPON_TIERS = (c) => (c.isWeapon ? [1, 5] : ALL_TIERS);
const ADVANTAGED_WEAPON_TIERS = () => [3, 7];

/**
 * The kinds of flame line that can appear.
 *
 *   resolve(tier, ctx) → a partial bucketed-stat object
 *   percent            → the value is a percentage, for display
 *   on                 → 'weapon' | 'nonWeapon' when the line is restricted
 *   minLevel           → the item level the line needs to roll at all
 *   tierRange          → ctx => [min, max] when the line cannot roll every tier
 *
 * `ctx` carries { level, baseAttack, baseMagic, isWeapon }.
 */
export const FLAME_LINES = {
  str:      { label: 'STR',        resolve: (t, c) => ({ str: singleStatFlame(c.level, t) }) },
  dex:      { label: 'DEX',        resolve: (t, c) => ({ dex: singleStatFlame(c.level, t) }) },
  int:      { label: 'INT',        resolve: (t, c) => ({ int: singleStatFlame(c.level, t) }) },
  luk:      { label: 'LUK',        resolve: (t, c) => ({ luk: singleStatFlame(c.level, t) }) },

  strDex:   { label: 'STR + DEX',  resolve: (t, c) => ({ str: dualStatFlame(c.level, t), dex: dualStatFlame(c.level, t) }) },
  strInt:   { label: 'STR + INT',  resolve: (t, c) => ({ str: dualStatFlame(c.level, t), int: dualStatFlame(c.level, t) }) },
  strLuk:   { label: 'STR + LUK',  resolve: (t, c) => ({ str: dualStatFlame(c.level, t), luk: dualStatFlame(c.level, t) }) },
  dexInt:   { label: 'DEX + INT',  resolve: (t, c) => ({ dex: dualStatFlame(c.level, t), int: dualStatFlame(c.level, t) }) },
  dexLuk:   { label: 'DEX + LUK',  resolve: (t, c) => ({ dex: dualStatFlame(c.level, t), luk: dualStatFlame(c.level, t) }) },
  intLuk:   { label: 'INT + LUK',  resolve: (t, c) => ({ int: dualStatFlame(c.level, t), luk: dualStatFlame(c.level, t) }) },

  // Non-weapons must be level 70 or above; weapons can roll it at any level.
  allStat:  { label: 'All Stats %', percent: true, minLevel: 70,
              resolve: (t) => ({ allStatP: allStatFlame(t) }) },

  boss:     { label: 'Boss Damage %', percent: true, on: 'weapon', minLevel: 90,
              resolve: (t) => ({ boss: bossDamageFlame(t) }) },
  dmg:      { label: 'Damage %',   percent: true, on: 'weapon',
              resolve: (t) => ({ dmg: damageFlame(t) }) },

  // Attack is the one line whose value depends on the item type. On a weapon it
  // is a share of base attack and the flame-advantaged curve is its own line; on
  // everything else it is a flat +1 per tier.
  att:      { label: 'Attack Power', tierRange: ORDINARY_WEAPON_TIERS,
              resolve: (t, c) => ({
                att: c.isWeapon ? weaponAttackFlame(c.baseAttack, c.level, t, false)
                                : nonWeaponAttackFlame(t),
              }) },
  matt:     { label: 'Magic ATT',  tierRange: ORDINARY_WEAPON_TIERS,
              resolve: (t, c) => ({
                matt: c.isWeapon ? weaponAttackFlame(c.baseMagic, c.level, t, false)
                                 : nonWeaponAttackFlame(t),
              }) },
  attBoss:  { label: 'Attack Power (boss)', on: 'weapon', tierRange: ADVANTAGED_WEAPON_TIERS,
              resolve: (t, c) => ({ att: weaponAttackFlame(c.baseAttack, c.level, t, true) }) },
  mattBoss: { label: 'Magic ATT (boss)', on: 'weapon', tierRange: ADVANTAGED_WEAPON_TIERS,
              resolve: (t, c) => ({ matt: weaponAttackFlame(c.baseMagic, c.level, t, true) }) },

  hp:       { label: 'Max HP',     resolve: (t, c) => ({ hp: hpFlame(c.level, t) }) },
  mp:       { label: 'Max MP',     resolve: (t, c) => ({ mp: hpFlame(c.level, t) }) },
  def:      { label: 'DEF',        resolve: (t, c) => ({ def: singleStatFlame(c.level, t) }) },

  speed:    { label: 'Speed',      on: 'nonWeapon', resolve: (t) => ({ speed: speedJumpFlame(t) }) },
  jump:     { label: 'Jump',       on: 'nonWeapon', resolve: (t) => ({ jump: speedJumpFlame(t) }) },
};

/**
 * A line and its counterpart that cannot both be on one item, because they are
 * the same bonus stat rolled off a different table.
 */
const FLAME_LINE_ALIASES = { att: 'attBoss', attBoss: 'att', matt: 'mattBoss', mattBoss: 'matt' };

/** The other line key this one excludes, or null. */
export function conflictingFlameLine(line) {
  return FLAME_LINE_ALIASES[line] ?? null;
}

/** The resolution context for an item. */
export function flameContext(item) {
  return {
    level: item?.reqLevel ?? 0,
    baseAttack: item?.stats?.att ?? 0,
    baseMagic: item?.stats?.matt ?? 0,
    isWeapon: isWeaponSlot(item?.slot),
  };
}

/** True when `line` can roll on an item described by `ctx`. */
export function flameLineApplies(line, ctx = {}) {
  const def = FLAME_LINES[line];
  if (!def) return false;
  if (def.on === 'weapon' && !ctx.isWeapon) return false;
  if (def.on === 'nonWeapon' && ctx.isWeapon) return false;
  if (def.minLevel && !ctx.isWeapon && (ctx.level ?? 0) < def.minLevel) return false;
  return true;
}

/** The tiers `line` can roll at on an item described by `ctx`. */
export function flameTierRange(line, ctx = {}) {
  const def = FLAME_LINES[line];
  if (!def) return ALL_TIERS;
  return def.tierRange ? def.tierRange(ctx) : ALL_TIERS;
}

function tierIsRollable(line, tier, ctx) {
  const [min, max] = flameTierRange(line, ctx);
  return tier >= min && tier <= max;
}

/** The line keys that can roll on an item, in display order. */
export function flameLinesFor(item) {
  const ctx = flameContext(item);
  return Object.keys(FLAME_LINES).filter((line) => flameLineApplies(line, ctx));
}

/**
 * The single number a flame line is worth at a tier, for showing in a picker.
 *
 * Dual-stat lines grant the same amount to both stats, so one number describes
 * them; nothing else resolves to more than one value. Returns null when the line
 * cannot roll that tier, or grants nothing on this item — an attack flame on a
 * weapon with no magic attack — so the caller can leave the cell blank.
 *
 * @returns {{ value: number, percent: boolean }|null}
 */
export function flameLineValue(line, tier, ctx = {}) {
  const def = FLAME_LINES[line];
  if (!def) return null;

  const context = { level: 0, baseAttack: 0, baseMagic: 0, isWeapon: false, ...ctx };
  if (!flameLineApplies(line, context)) return null;
  if (!tierIsRollable(line, tier, context)) return null;

  const values = Object.values(def.resolve(tier, context)).filter(Boolean);
  if (!values.length) return null;

  return { value: Math.max(...values), percent: Boolean(def.percent) };
}

/**
 * Resolves a set of flame lines into bucketed stats.
 *
 * @param {Array<{line: string, tier: number}>} lines Up to four flame lines.
 * @param {object} ctx { level, baseAttack, baseMagic, isWeapon }
 */
export function resolveFlames(lines = [], ctx = {}) {
  const out = {};
  const context = { level: 0, baseAttack: 0, baseMagic: 0, isWeapon: false, ...ctx };

  for (const { line, tier } of lines) {
    const def = FLAME_LINES[line];
    if (!def || !tier) continue;
    if (!tierIsRollable(line, tier, context)) continue;
    for (const [k, v] of Object.entries(def.resolve(tier, context))) {
      if (v) out[k] = (out[k] || 0) + v;
    }
  }
  return out;
}
