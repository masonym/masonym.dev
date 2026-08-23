/**
 * The bucketed stat model.
 *
 * Stats are never pre-summed into a single "power" number, because they combine
 * differently: flat stat is additive, %stat multiplies a base that includes AP
 * and every other flat source, and IED stacks multiplicatively. Keeping the
 * buckets separate is what lets the Tier 2 effective-damage output drop in later
 * without reworking any of this.
 *
 * IED is the awkward one. Two 30% IED sources are not 60% - they are
 * 1 - (0.7 * 0.7) = 51%. So IED is carried as a list of individual sources and
 * only combined at the point of display.
 */

/** kind: 'flat' additive integer | 'percent' additive % | 'mult' multiplicative % */
export const STAT_META = {
  // main stats
  str: { label: "STR", kind: "flat", group: "stat" },
  dex: { label: "DEX", kind: "flat", group: "stat" },
  int: { label: "INT", kind: "flat", group: "stat" },
  luk: { label: "LUK", kind: "flat", group: "stat" },
  allStat: { label: "All Stats", kind: "flat", group: "stat" },
  strP: { label: "STR %", kind: "percent", group: "stat" },
  dexP: { label: "DEX %", kind: "percent", group: "stat" },
  intP: { label: "INT %", kind: "percent", group: "stat" },
  lukP: { label: "LUK %", kind: "percent", group: "stat" },
  allStatP: { label: "All Stats %", kind: "percent", group: "stat" },
  // Max HP sits with the main stats rather than under survivability: for HP-scaling
  // classes (Demon Avenger) it *is* the main stat, and everyone reads it next to them.
  hp: { label: "Max HP", kind: "flat", group: "stat" },

  // attack
  att: { label: "Attack Power", kind: "flat", group: "attack" },
  matt: { label: "Magic ATT", kind: "flat", group: "attack" },
  attP: { label: "Attack Power %", kind: "percent", group: "attack" },
  mattP: { label: "Magic ATT %", kind: "percent", group: "attack" },
  attackCount: { label: "Attack Count", kind: "flat", group: "attack" },

  // damage multipliers
  boss: { label: "Boss Damage %", kind: "percent", group: "damage" },
  dmg: { label: "Damage %", kind: "percent", group: "damage" },
  ied: { label: "Ignore DEF %", kind: "mult", group: "damage" },
  critDmg: { label: "Critical Damage %", kind: "percent", group: "damage" },
  critRate: { label: "Critical Rate %", kind: "percent", group: "damage" },
  critDmgMin: { label: "Crit Damage Min %", kind: "percent", group: "damage" },
  critDmgMax: { label: "Crit Damage Max %", kind: "percent", group: "damage" },

  // survivability - carried through the engine but hidden from the diff, since
  // none of it feeds a damage comparison. See HIDDEN_DIFF_GROUPS below.
  mp: { label: "Max MP", kind: "flat", group: "survival" },
  hpP: { label: "Max HP %", kind: "percent", group: "survival" },
  mpP: { label: "Max MP %", kind: "percent", group: "survival" },
  def: { label: "DEF", kind: "flat", group: "survival" },
  mdef: { label: "Magic DEF", kind: "flat", group: "survival" },
  defP: { label: "DEF %", kind: "percent", group: "survival" },
  elemResist: {
    label: "Elemental Resistance %",
    kind: "percent",
    group: "survival",
  },
  statusResist: { label: "Status Resistance", kind: "flat", group: "survival" },

  // per-character-level scaling
  strPerLv: { label: "STR per 10 Lv", kind: "flat", group: "scaling" },
  dexPerLv: { label: "DEX per 10 Lv", kind: "flat", group: "scaling" },
  intPerLv: { label: "INT per 10 Lv", kind: "flat", group: "scaling" },
  lukPerLv: { label: "LUK per 10 Lv", kind: "flat", group: "scaling" },
  hpPerLv: { label: "HP per 10 Lv", kind: "flat", group: "scaling" },

  // utility
  acc: { label: "Accuracy", kind: "flat", group: "utility" },
  eva: { label: "Avoidability", kind: "flat", group: "utility" },
  speed: { label: "Speed", kind: "flat", group: "utility" },
  jump: { label: "Jump", kind: "flat", group: "utility" },
  allSkill: { label: "All Skill Levels", kind: "flat", group: "utility" },
  meso: { label: "Meso Obtained %", kind: "percent", group: "utility" },
  drop: { label: "Item Drop Rate %", kind: "percent", group: "utility" },
  exp: { label: "EXP %", kind: "percent", group: "utility" },
  pqExp: { label: "PQ EXP %", kind: "percent", group: "utility" },
  mpCost: { label: "MP Cost -%", kind: "percent", group: "utility" },
  cooldown: { label: "Cooldown -sec", kind: "flat", group: "utility" },
};

export const STAT_GROUPS = [
  "stat",
  "attack",
  "damage",
  "survival",
  "scaling",
  "utility",
];

/**
 * Groups the difference panel does not render.
 *
 * Defence, resistances and MP still resolve and still sit in the stat block -
 * item tooltips show them, matching the game - but they are noise in a
 * "should I equip this?" comparison, so the diff leaves them out.
 */
export const HIDDEN_DIFF_GROUPS = new Set(["survival"]);

/** Stats that must not be added together. Only `ied` today, but kept general. */
const MULTIPLICATIVE = new Set(
  Object.entries(STAT_META)
    .filter(([, m]) => m.kind === "mult")
    .map(([k]) => k),
);

export function isMultiplicative(key) {
  return MULTIPLICATIVE.has(key);
}

/** An empty stat block. Additive stats live in `values`; IED sources in `ied`. */
export function emptyStats() {
  return { values: {}, ied: [] };
}

/**
 * True for a full stat block, false for a plain {key: value} bag.
 *
 * The two are told apart by shape rather than by a marker: a block always has
 * both a `values` object and an `ied` *array*. A bag may well carry a numeric
 * `ied` key, which is a single source rather than a source list.
 */
function isStatBlock(src) {
  return src && typeof src.values === "object" && Array.isArray(src.ied);
}

/** Adds `src` into `dest` in place. Multiplicative keys are appended, not summed. */
export function addInto(dest, src) {
  if (!src) return dest;

  if (isStatBlock(src)) {
    for (const [k, v] of Object.entries(src.values)) {
      if (v) dest.values[k] = (dest.values[k] || 0) + v;
    }
    for (const s of src.ied) if (s) dest.ied.push(s);
    return dest;
  }

  for (const [k, v] of Object.entries(src)) {
    if (!v) continue;
    if (isMultiplicative(k)) dest.ied.push(v);
    else dest.values[k] = (dest.values[k] || 0) + v;
  }
  return dest;
}

/** Sums any number of stat blocks or plain bags into a new block. */
export function sumStats(...parts) {
  const out = emptyStats();
  for (const p of parts) addInto(out, p);
  return out;
}

/**
 * Rounds away binary-floating-point dust.
 *
 * Six decimals is several orders of magnitude finer than anything the game
 * exposes, so this can only ever remove noise, never a real value.
 */
function clean(value, places = 6) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Combines IED sources the way the game does: 1 - Π(1 - x).
 *
 * The result is cleaned because the division and multiplication do not round
 * trip: a single 5% source comes back as 5.000000000000004, which then reads as
 * a real difference in diffStats and prints in full.
 *
 * @param {number[]} sources Percentages, e.g. [30, 10].
 * @returns Combined percentage, e.g. 37.
 */
export function combineIed(sources = []) {
  let remaining = 1;
  for (const s of sources) {
    if (!s) continue;
    remaining *= 1 - s / 100;
  }
  return clean((1 - remaining) * 100);
}

/** Flattens a stat block into a plain {key: value} bag with IED combined. */
export function flattenStats(block) {
  const out = { ...block.values };
  const ied = combineIed(block.ied);
  if (ied) out.ied = ied;
  return out;
}

/**
 * Per-stat difference between two loadout stat blocks.
 *
 * IED is diffed on the *combined* value, which is the only meaningful
 * comparison - the raw source lists are not commensurable.
 *
 * @returns Array of { key, label, group, kind, before, after, delta } sorted by
 *          group order, then by descending absolute delta.
 */
export function diffStats(before, after) {
  const a = flattenStats(before);
  const b = flattenStats(after);

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const rows = [];

  for (const key of keys) {
    const from = a[key] || 0;
    const to = b[key] || 0;
    const delta = clean(to - from);
    // Anything smaller than this is float dust, not a stat the game can grant.
    if (Math.abs(delta) < 1e-6) continue;

    const meta = STAT_META[key] || {
      label: key,
      kind: "flat",
      group: "utility",
    };
    rows.push({
      key,
      label: meta.label,
      group: meta.group,
      kind: meta.kind,
      before: from,
      after: to,
      delta,
    });
  }

  rows.sort((x, y) => {
    const g = STAT_GROUPS.indexOf(x.group) - STAT_GROUPS.indexOf(y.group);
    if (g !== 0) return g;
    return Math.abs(y.delta) - Math.abs(x.delta);
  });

  return rows;
}

/**
 * Formats a stat value for display; percent stats get one decimal when needed.
 *
 * Rounding happens unconditionally. The earlier version returned the raw value
 * whenever it was already close to an integer, which is exactly the case where
 * float dust survives - 5.000000000000004 printed in full.
 */
export function formatStat(key, value) {
  const meta = STAT_META[key];
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  if (meta && (meta.kind === "percent" || meta.kind === "mult"))
    return `${text}%`;
  return text;
}
