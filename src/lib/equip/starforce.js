/**
 * Star force stat gains.
 *
 * These tables are NOT in the WZ files — the client only ships enhancement
 * rates and costs, not the resulting stat gains. Transcribed from the
 * MapleStory Wiki's stat tables
 * (https://maplestorywiki.net/w/Star_Force_Enhancement/Stat_Tables), which
 * publishes four separate tables: weapons, armour and accessories, badges, and
 * superior equipment. All four are encoded here.
 *
 * Gains are indexed by the star being *left*: to reach N stars you sum the gain
 * for stars 0..N-1. Every function here is pure.
 *
 * ── Verification status ──────────────────────────────────────────────────────
 *   - The level 250-300 weapon attack row is not on the wiki and came from the
 *     misaomaki simulator, which flags it as a guess. It is marked here too.
 *   - Weapon attack below 15 stars compounds; see starForceWeaponAttack().
 */

/** Item level → star tier index (1-based). 0 means "below the table". */
const STAR_TIER_RANGES = [
  [128, 137],
  [138, 149],
  [150, 159],
  [160, 199],
  [200, 249],
  [250, 300],
];

const SUPERIOR_TIER_RANGES = [
  [0, 77],
  [78, 87],
  [88, 97],
  [98, 107],
  [108, 117],
  [118, 127],
  [128, 137],
  [138, 149],
  [150, 275],
];

/** [minLevel, maxLevel, maxStars]. Regular gear above 138 uses `cap`. */
const MAX_STAR_RANGES = [
  [0, 95, 5],
  [96, 107, 8],
  [108, 117, 10],
  [118, 127, 15],
  [128, 137, 20],
];

const SUPERIOR_MAX_STAR_RANGES = [
  [0, 95, 3],
  [96, 107, 5],
  [108, 117, 8],
  [118, 127, 10],
  [128, 137, 12],
  [138, 275, 15],
];

/**
 * Stat and attack gains for stars 16+ (index = star - 15), per star tier.
 *
 * `stat` is granted only for stars 16-22; from 23 on, star force gives attack
 * only. `att` / `attWeapon` arrays are indexed by (star - 15) and run as far as
 * that tier's star cap allows.
 */
const HIGH_STAR_TIERS = [
  {
    // level 128-137 (caps at 20 stars)
    stat: 7,
    att: [7, 8, 9, 10, 11],
    attWeapon: [6, 7, 7, 8, 9],
  },
  {
    // level 138-149
    stat: 9,
    att: [8, 9, 10, 11, 12, 13, 15, 17, 19, 21, 22, 23, 24, 25, 26],
    attWeapon: [7, 8, 8, 9, 10, 11, 12, 30, 31, 32, 33, 34, 35, 36, 37],
  },
  {
    // level 150-159
    stat: 11,
    att: [9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 23, 24, 25, 26, 27],
    attWeapon: [8, 9, 9, 10, 11, 12, 13, 31, 32, 33, 34, 35, 36, 37, 38],
  },
  {
    // level 160-199
    stat: 13,
    att: [10, 11, 12, 13, 14, 15, 17, 19, 21, 23, 24, 25, 26, 27, 28],
    attWeapon: [9, 9, 10, 11, 12, 13, 14, 32, 33, 34, 35, 36, 37, 38, 39],
  },
  {
    // level 200-249
    stat: 15,
    att: [12, 13, 14, 15, 16, 17, 19, 21, 23, 25, 26, 27, 28, 29, 30],
    attWeapon: [13, 13, 14, 14, 15, 16, 17, 34, 35, 36, 37, 38, 39, 40, 41],
  },
  {
    // level 250+ - currently only destiny wep
    stat: 17,
    att: [14, 15, 16, 17, 18, 19, 21, 23, 25, 27, 28, 29, 30, 31, 32],
    attWeapon: [16, 16, 17, 17, 18, 19, 20, 36, 37, 38],
  },
];

/**
 * Superior (Tyrant) gear, which caps at 15 stars and follows its own table.
 * Indexed by the star being left (0-14); each entry maps tier index → value.
 * Early stars give all-stat, later stars give attack.
 */
const SUPERIOR_GAINS = [
  { allStat: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 9, 6: 12, 7: 14, 8: 17, 9: 19 } },
  { allStat: { 1: 2, 2: 3, 3: 5, 4: 8, 5: 10, 6: 13, 7: 15, 8: 18, 9: 20 } },
  { allStat: { 1: 4, 2: 5, 3: 7, 4: 10, 5: 12, 6: 15, 7: 17, 8: 20, 9: 22 } },
  { allStat: { 3: 10, 4: 13, 5: 15, 6: 18, 7: 20, 8: 23, 9: 25 } },
  { allStat: { 3: 14, 4: 17, 5: 19, 6: 22, 7: 24, 8: 27, 9: 29 } },
  { att: { 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 } },
  { att: { 5: 6, 6: 7, 7: 8, 8: 9, 9: 10 } },
  { att: { 5: 7, 6: 8, 7: 9, 8: 10, 9: 11 } },
  { att: { 6: 9, 7: 10, 8: 11, 9: 12 } },
  { att: { 6: 10, 7: 11, 8: 12, 9: 13 } },
  { att: { 7: 13, 8: 14, 9: 15 } },
  { att: { 7: 15, 8: 16, 9: 17 } },
  { att: { 8: 18, 9: 19 } },
  { att: { 8: 20, 9: 21 } },
  { att: { 8: 22, 9: 23 } },
];

/**
 * Slot codes that follow the badge table rather than the armour one.
 *
 * Only two badges in the game can be star forced at all — Sengoku Hakase and
 * Ghost Ship Exorcist, both capped at 22 — and what they gain is All Stats and
 * nothing else: no attack at any star, no Max HP, no DEF. Nexon said as much
 * when the cap was introduced, and the wiki's badge table agrees.
 */
const BADGE_SLOT = "Ba";

/** True when star force grants this slot attack at 16 stars and above. */
export function gainsStarForceAttack(slot) {
  return slot !== BADGE_SLOT;
}

/**
 * Slots that gain no Max HP from star force.
 *
 * The wiki footnotes gloves, shoes, face accessories and eye accessories on the
 * armour table; badges have no HP row at all.
 */
const SLOTS_WITHOUT_STAR_HP = new Set(["Gv", "So", "Af", "Ay", BADGE_SLOT]);

function rangeLookup(ranges, level) {
  for (let i = 0; i < ranges.length; i += 1) {
    if (level >= ranges[i][0] && level <= ranges[i][1]) return i + 1;
  }
  return 0;
}

/** Item level → star tier index (1-based); 0 if the item is below the table. */
export function starTier(level, superior = false) {
  return rangeLookup(superior ? SUPERIOR_TIER_RANGES : STAR_TIER_RANGES, level);
}

/**
 * Highest star an item of this level can reach.
 * @param {number} cap Star cap for level 138+ regular gear (30 in current GMS).
 */
export function maxStars(level, superior = false, cap = 30) {
  const ranges = superior ? SUPERIOR_MAX_STAR_RANGES : MAX_STAR_RANGES;
  for (const [min, max, stars] of ranges) {
    if (level >= min && level <= max) return stars;
  }
  return superior ? 15 : cap;
}

/**
 * Highest star a specific item can reach.
 *
 * The level table above is only the default. build-equip-data.mjs resolves the
 * exceptions the game does not state as rules — items with no upgrade slots,
 * which cannot be star forced at all, and the fixed-star gear (Genesis and
 * Destiny weapons, Red Beryl, the three Astra secondary grades) — into an
 * explicit `starMax`, which wins here whenever it is present.
 */
export function starCap(item, cap = 30) {
  if (!item) return 0;
  if (Number.isFinite(item.starMax)) return item.starMax;
  return maxStars(item.reqLevel, Boolean(item.superior), cap);
}

/**
 * Stars an item is granted with and cannot be taken below — 22 on a Genesis
 * weapon, 20 on a Red Beryl piece, 0 on everything you star yourself.
 */
export function starFloor(item) {
  if (!Number.isFinite(item?.starMin)) return 0;
  return Math.min(item.starMin, starCap(item));
}

/** True when the user can choose this item's star count at all. */
export function isStarForceable(item) {
  const cap = starCap(item);
  return cap > 0 && cap > starFloor(item);
}

/**
 * Attack gained by a weapon from stars 1-15.
 *
 * Below 15 stars a weapon gains roughly 2% attack per star, but it compounds:
 * each star adds `1 + floor(currentAttack * 0.02)`, where `currentAttack`
 * includes everything gained so far. Scroll attack counts toward the base, so
 * pass base + scroll attack.
 *
 * @returns The attack gained (not the new total).
 */
export function starForceWeaponAttack(baseAttack, stars) {
  if (!baseAttack || baseAttack <= 0) return 0;
  const steps = Math.min(stars, 15);
  let current = baseAttack;
  for (let i = 0; i < steps; i += 1) {
    current += 1 + Math.floor(current * 0.02);
  }
  return current - baseAttack;
}

const EMPTY = () => ({
  str: 0,
  dex: 0,
  int: 0,
  luk: 0,
  att: 0,
  matt: 0,
  hp: 0,
  mp: 0,
  speed: 0,
  jump: 0,
  defP: 0,
});

/**
 * Total star force gains for an item.
 *
 * @param {object} opts
 * @param {number} opts.level     Item level (use the effective level if scrolled down).
 * @param {number} opts.stars     Current star count.
 * @param {string} opts.slot      islot code, e.g. 'Wp', 'Gv', 'So', 'MaPn'.
 * @param {boolean} opts.superior Superior/Tyrant gear (different table, caps at 15).
 * @param {boolean} opts.gainsAtt Whether the item gains attack at 16+ (false for
 *                                most badges and other non-combat gear).
 * @param {number} opts.baseAttack Base + scroll attack, for the sub-15 weapon curve.
 * @param {number} opts.baseMagic  Base + scroll magic attack.
 * @returns Bucketed stat gains. `defP` is a fraction (0.05 = +5% DEF).
 */
export function starForceGains({
  level,
  stars,
  slot,
  superior = false,
  gainsAtt = true,
  baseAttack = 0,
  baseMagic = 0,
}) {
  const out = EMPTY();
  if (!stars || stars <= 0) return out;

  const isWeapon = slot === "Wp" || slot === "WpSi";
  const tier = starTier(level, superior);

  // DEF% is counted in whole stars and scaled once at the end — accumulating
  // 0.05 per star in floating point produces values like 1.1000000000000003.
  let defStars = 0;

  // ── Superior / Tyrant ─────────────────────────────────────────────────────
  if (superior) {
    const applied = Math.min(stars, SUPERIOR_GAINS.length);
    for (let s = 0; s < applied; s += 1) {
      const row = SUPERIOR_GAINS[s];
      const allStat = row.allStat?.[tier] ?? 0;
      const att = row.att?.[tier] ?? 0;
      out.str += allStat;
      out.dex += allStat;
      out.int += allStat;
      out.luk += allStat;
      out.att += att;
      out.matt += att;
    }
    out.defP = applied * 0.05;
    return out;
  }

  const highTier = tier > 0 ? HIGH_STAR_TIERS[tier - 1] : null;

  for (let s = 0; s < stars; s += 1) {
    defStars += 1;

    // ── Main stats ──────────────────────────────────────────────────────────
    if (s < 5) {
      out.str += 2;
      out.dex += 2;
      out.int += 2;
      out.luk += 2;
    } else if (s < 15) {
      out.str += 3;
      out.dex += 3;
      out.int += 3;
      out.luk += 3;
    } else if (s < 22 && highTier) {
      // Stars 16-22 grant flat stat; 23+ grant attack only.
      const v = highTier.stat;
      out.str += v;
      out.dex += v;
      out.int += v;
      out.luk += v;
    }

    // ── Attack at 16+ ───────────────────────────────────────────────────────
    if (s >= 15 && highTier && gainsAtt) {
      const table = isWeapon ? highTier.attWeapon : highTier.att;
      const v = table[s - 15] ?? 0;
      out.att += v;
      out.matt += v;
    }

    // ── HP / MP ─────────────────────────────────────────────────────────────
    // Weapons and armour disagree at the third star only: a weapon's third star
    // is still worth 5, armour's is already 10.
    if (s < 15 && !SLOTS_WITHOUT_STAR_HP.has(slot)) {
      let hp = 0;
      if (s < (isWeapon ? 3 : 2)) hp = 5;
      else if (s < 5) hp = 10;
      else if (s < 7) hp = 15;
      else if (s < 9) hp = 20;
      else hp = 25;
      out.hp += hp;
      // Only weapons gain MP alongside HP.
      if (isWeapon) out.mp += hp;
    }

    // ── Slot quirks below 15 stars ──────────────────────────────────────────
    if (slot === "Gv") {
      // Gloves gain +1 attack at these specific stars, but only for the attack
      // type the glove already has.
      if ([4, 6, 8, 10, 12, 13, 14].includes(s)) {
        if (baseAttack > 0) out.att += 1;
        if (baseMagic > 0) out.matt += 1;
      }
    } else if (slot === "So") {
      if (s >= 2 && s < 10) {
        out.speed += 1;
        out.jump += 1;
      } else if (s >= 10 && s < 15) {
        out.speed += 2;
        out.jump += 2;
      }
    }
  }

  // ── Weapon attack below 15 stars ──────────────────────────────────────────
  // Weapons gain compounding percentage attack rather than the flat values
  // above, so it is computed in one pass over the whole 1-15 range.
  if (isWeapon) {
    out.att += starForceWeaponAttack(baseAttack, stars);
    out.matt += starForceWeaponAttack(baseMagic, stars);
  }

  // DEF scales per star; overalls get double because they cover two slots.
  // Badges have no DEF row at all.
  if (slot !== BADGE_SLOT) {
    out.defP = defStars * (slot === "MaPn" ? 0.1 : 0.05);
  }

  return out;
}

/** True when the gain tables for this level are known to be unverified. */
export function starForceGainsAreUnverified(level, superior = false) {
  const tier = starTier(level, superior);
  return (
    !superior && tier > 0 && Boolean(HIGH_STAR_TIERS[tier - 1]?.unverified)
  );
}
