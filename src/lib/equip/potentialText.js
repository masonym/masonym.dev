/**
 * Reading a potential line the way the game prints it.
 *
 * The WZ stores a potential's description as a template with the value left out:
 * `STR: +#incSTR`, `Boss Damage +#incDAMr%`. The number is not in the string
 * because one line covers every item level - the same `#incSTR` is +6 on a
 * level-10 item and +18 on a level-200 one, and which it is comes from the
 * line's own tier table.
 *
 * So the raw `desc` cannot be shown as-is, and the first attempt at fixing that
 * printed both halves - `STR: +#incSTR (str +18)` - which reads as an escaped
 * placeholder followed by a debug dump. This substitutes instead, so a line
 * shows what the item would actually get: `STR: +18`.
 */

import { potentialValueAt } from "./engine.js";
import { STAT_META, STAT_GROUPS } from "./stats.js";

/**
 * Template token → the normalized stat key it resolves to.
 *
 * A subset of STAT_MAP in build-equip-data.mjs, covering the tokens that occur
 * in `desc` (the build's map also carries keys that only ever appear as item
 * stats). It is a hint rather than an authority: a token that resolves to
 * nothing falls back to positional matching below, which is what makes the
 * cases where the two genuinely disagree come out right. See `describePotential`.
 *
 * verify-equip-tables.mjs checks every line in the dataset resolves, so a WZ
 * update that introduces a token cannot slip through unnoticed.
 */
const TOKEN_STATS = {
  incSTR: "str",
  incDEX: "dex",
  incINT: "int",
  incLUK: "luk",
  incSTRr: "strP",
  incDEXr: "dexP",
  incINTr: "intP",
  incLUKr: "lukP",
  incSTRlv: "strPerLv",
  incDEXlv: "dexPerLv",
  incINTlv: "intPerLv",
  incLUKlv: "lukPerLv",
  incMHPlv: "hpPerLv",
  incPAD: "att",
  incMAD: "matt",
  incPADr: "attP",
  incMADr: "mattP",
  incMHP: "hp",
  incMMP: "mp",
  incMHPr: "hpP",
  incMMPr: "mpP",
  incPDD: "def",
  incPDDr: "defP",
  incDAMr: "dmg",
  ignoreTargetDEF: "ied",
  incCr: "critRate",
  incCriticaldamage: "critDmg",
  incCriticaldamageMin: "critDmgMin",
  incCriticaldamageMax: "critDmgMax",
  incSpeed: "speed",
  incJump: "jump",
  incTerR: "elemResist",
  incAsrR: "statusResist",
  incAllskill: "allSkill",
  incMesoProp: "meso",
  incRewardProp: "drop",
  incEXPr: "exp",
  incPQEXPr: "pqExp",
  mpconReduce: "mpCost",
  reduceCooltime: "cooldown",
};

const TOKEN_PATTERN = /#([A-Za-z0-9_]+)/g;

/** Bare number for substitution - the template already carries any % or unit. */
function formatValue(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * The line's description with its tokens replaced by the values it grants at
 * `levelIndex`.
 *
 * Tokens are matched to stats by name first and then positionally, because the
 * two can legitimately disagree: `incDAMr` is the damage key, but a line
 * carrying the WZ `boss` flag resolves it to boss damage instead - so
 * "Boss Damage +#incDAMr%" has a token naming `dmg` and a value under `boss`.
 * Matching whatever is left over in order gets that right without teaching this
 * module about the flag, and it degrades to a `?` rather than to a wrong number
 * if a future line has more tokens than values.
 */
export function describePotential(line, levelIndex) {
  const desc = String(line?.desc ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const stats = potentialValueAt(line, levelIndex) || {};

  const tokens = [...desc.matchAll(TOKEN_PATTERN)].map((m) => m[1]);
  if (!tokens.length) return desc;

  const unclaimed = new Set(Object.keys(stats));
  const values = tokens.map((token) => {
    const key = TOKEN_STATS[token];
    if (key && unclaimed.has(key)) {
      unclaimed.delete(key);
      return stats[key];
    }
    return undefined;
  });

  const leftovers = [...unclaimed];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === undefined && leftovers.length)
      values[i] = stats[leftovers.shift()];
  }

  let next = 0;
  return desc.replace(TOKEN_PATTERN, () => {
    const value = values[next];
    next += 1;
    return value === undefined ? "?" : formatValue(value);
  });
}

/** True when the line still has an unresolved token at this level. */
export function potentialTextIsComplete(line, levelIndex) {
  return !describePotential(line, levelIndex).includes("?");
}

/**
 * True when a line grants nothing at this item level.
 *
 * The tier tables do not all start at index 1, so a line can be real and still
 * have no row for a low-level item. Those are the only lines dropped: a
 * defensive line is a line someone's item can genuinely have rolled, and the
 * editor has to be able to represent it even though the diff does not print it.
 */
export function isInertPotential(line, levelIndex) {
  const stats = potentialValueAt(line, levelIndex);
  return !stats || Object.keys(stats).length === 0;
}

/** Sort rank: the stat group the line leads with, for ordering a picker. */
function groupRank(line, levelIndex) {
  const stats = potentialValueAt(line, levelIndex) || {};
  let best = STAT_GROUPS.length;
  for (const key of Object.keys(stats)) {
    const rank = STAT_GROUPS.indexOf(STAT_META[key]?.group);
    if (rank >= 0 && rank < best) best = rank;
  }
  return best;
}

/**
 * The lines worth offering for an item, resolved, deduplicated and ordered.
 *
 * Duplicates are the reason this exists rather than a `.map()` at the call site.
 * The WZ carries the same line several times over - Legendary alone has 49
 * regular lines and 34 distinct ones, with "Boss Damage +40%" appearing three
 * times - and a dropdown that lists a line once per copy makes the user pick
 * between identical rows.
 *
 * Ordering is by stat group, so the lines that decide a swap (stats, attack,
 * damage) come before the ones that do not (speed, EXP, cooldown).
 *
 * @param {Array}  lines      Candidate lines, already filtered by grade and slot.
 * @param {number} levelIndex The item's potential level index.
 * @returns {Array<{ id: number, label: string }>}
 */
export function potentialOptions(lines, levelIndex) {
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    if (isInertPotential(line, levelIndex)) continue;

    const label = describePotential(line, levelIndex);
    if (seen.has(label)) continue;
    seen.add(label);

    out.push({ id: line.id, label, rank: groupRank(line, levelIndex) });
  }

  out.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));
  return out.map(({ id, label }) => ({ id, label }));
}

/** One line's resolved text, for showing a potential that is already set. */
export function potentialLabel(lineIndex, optionId, levelIndex) {
  const line = lineIndex.get(optionId);
  if (!line) return `Line ${optionId}`;
  return describePotential(line, levelIndex) || `Line ${optionId}`;
}
