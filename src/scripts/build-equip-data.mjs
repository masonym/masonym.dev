/**
 * build-equip-data.mjs
 *
 * Transforms the raw WzDataExtractor output into the slim, site-ready JSON that
 * /equip-compare fetches at runtime from public/equip-data/.
 *
 * Run: node src/scripts/build-equip-data.mjs [--src <dir>]
 *
 * Input  (from EquipmentExtractor --dump-options):
 *   equipment.json, item_options.json, set_items.json
 * Output (public/equip-data/):
 *   items.json, potentials.json, sets.json, meta.json
 *
 * See docs/equip-compare-data.md for the WZ schema this relies on.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");

const DEFAULT_SRC =
  "/mnt/c/Users/Mason/Documents/coding_projects/WzDataExtractor/output/equipment";

const argv = process.argv.slice(2);
const srcIdx = argv.indexOf("--src");
const SRC_DIR = srcIdx !== -1 ? argv[srcIdx + 1] : DEFAULT_SRC;
const OUT_DIR = join(REPO_ROOT, "public", "equip-data");

// ─── Stat vocabulary ──────────────────────────────────────────────────────────
// Raw WZ keys → the normalized names the engine works in. Everything the game
// exposes is mapped; anything unmapped is reported at the end rather than
// silently dropped, so a future WZ update can't quietly lose a stat.

const STAT_MAP = {
  // flat main stats
  incSTR: "str",
  incDEX: "dex",
  incINT: "int",
  incLUK: "luk",
  incAllStat: "allStat",
  // % main stats
  incSTRr: "strP",
  incDEXr: "dexP",
  incINTr: "intP",
  incLUKr: "lukP",
  // per-character-level stats
  incSTRlv: "strPerLv",
  incDEXlv: "dexPerLv",
  incINTlv: "intPerLv",
  incLUKlv: "lukPerLv",
  // attack
  incPAD: "att",
  incMAD: "matt",
  incPADr: "attP",
  incMADr: "mattP",
  // hp / mp
  incMHP: "hp",
  incMMP: "mp",
  incMHPr: "hpP",
  incMMPr: "mpP",
  // defence
  incPDD: "def",
  incMDD: "mdef",
  incPDDr: "defP",
  // damage-relevant percentages
  bdR: "boss",
  nbdR: "boss",
  boss_damage_percent: "boss",
  imdR: "ied",
  ignoreTargetDEF: "ied",
  ignore_enemy_def_percent: "ied",
  incDAMr: "dmg",
  damR: "dmg",
  incCriticaldamage: "critDmg",
  incCriticaldamageMin: "critDmgMin",
  incCriticaldamageMax: "critDmgMax",
  incCr: "critRate",
  incAttackCount: "attackCount",
  incMHPlv: "hpPerLv",
  // `icnSTR` is a WZ typo for incSTR, present on both Special Casa Crow records.
  icnSTR: "str",
  // utility
  incSpeed: "speed",
  incJump: "jump",
  incACC: "acc",
  incEVA: "eva",
  incTerR: "elemResist",
  incAsrR: "statusResist",
  incAllskill: "allSkill",
  incMesoProp: "meso",
  incRewardProp: "drop",
  incEXPr: "exp",
  mpconReduce: "mpCost",
  reduceCooltime: "cooldown",
  incPQEXPr: "pqExp",
};

/** Stats that combine multiplicatively rather than additively. */
const MULTIPLICATIVE = new Set(["ied"]);

/**
 * Keys that describe *how* a line behaves rather than contributing a stat.
 * Kept out of the stat block so they can't be summed by accident.
 */
const MODIFIER_KEYS = new Set([
  "prop", // proc chance
  "time", // proc duration
  "level", // proc skill level
  "attackType",
  "boss", // flag: pairs with incDAMr to mean boss-only damage
  "HP",
  "MP",
  "RecoveryHP",
  "RecoveryMP",
  "RecoveryUP",
  "ignoreDAM",
  "ignoreDAMr",
  "DAMreflect",
]);

/**
 * Non-stat `info` keys — trade rules, pricing, cosmetics, animation indices,
 * requirements. Listed explicitly so the unmapped-key report at the end of the
 * run only ever surfaces genuinely unrecognised keys.
 *
 * `attack` is in here deliberately: it is an attack-animation index (all Spirit
 * Walker Fans carry 16), not an attack stat.
 */
const IGNORED_KEYS = new Set([
  // identity / requirements
  "reqLevel",
  "reqJob",
  "reqJob2",
  "reqSpecJob",
  "reqSTR",
  "reqDEX",
  "reqINT",
  "reqLUK",
  "reqPOP",
  "baseLevel",
  "reduceReq",
  "setItemID",
  "tuc",
  "attackSpeed",
  "cash",
  // commerce / trade / lifecycle
  "price",
  "notSale",
  "tradeBlock",
  "tradeAvailable",
  "equipTradeBlock",
  "noDrop",
  "only",
  "onlyEquip",
  "accountSharable",
  "sharableOnce",
  "timeLimited",
  "notExtend",
  "expireOnLogout",
  "expireOnNonPremiumLogin",
  "quest",
  "reissueBan",
  "unchangeable",
  "limitBreak",
  "collabo",
  "tutorial",
  "bossReward",
  "epicItem",
  "exItem",
  // crafting / upgrade rules
  "exceptToadsHammer",
  "exceptUpgrade",
  "exceptTransmission",
  "undecomposable",
  "unsyntesizable",
  "exUpgradeBlock",
  "exUpgradeChangeBlock",
  "exUpgradeBlockShowTooltip",
  "CuttableCount",
  "slotMax",
  "IUCMax",
  "randVariation",
  "jokerToSetItem",
  "plusToSetItem",
  "setExtraOption",
  // Exceptional Enhancement consumables: application odds and icon scaling.
  "success",
  "dropIconScaleUp",
  "linkedPairItem",
  "exGrade",
  "specialGrade",
  "medalTag",
  // android / mechanical heart bookkeeping: `grade` is the heart's cosmetic tier
  // and `androidKey` pairs a heart with the android it belongs to
  "grade",
  "androidKey",
  // consumed above as item flags rather than stats
  "superiorEqp",
  "Etuc",
  "fixedPotential",
  "fixedGrade",
  "noPotential",
  "tucIgnoreForPotential",
  "AdditionalPotOff",
  // trait exp
  "charmEXP",
  "willEXP",
  "charismaEXP",
  "insightEXP",
  "craftEXP",
  "senseEXP",
  "expBuff",
  // cosmetic / animation
  "walk",
  "stand",
  "attack",
  "noLookChange",
  "invisibleFace",
  "removeEar",
  "kaiserOffsetY",
  "elemDefault",
  "noPotentialFieldtype",
  // pvp / defensive niche
  "incPVPDamage",
  "pmdR",
  "hitDamRatePlus",
  "hitDamRatePlus2",
  "incCriticalMAXDamage",
  // elemental amplification on Elemental Wands/Staves (values >100 are multipliers, not resist)
  "incRMAF",
  "incRMAS",
  "incRMAI",
  "incRMAL",
]);

const unmapped = new Map();
function noteUnmapped(key, where) {
  if (MODIFIER_KEYS.has(key) || IGNORED_KEYS.has(key)) return;
  if (!unmapped.has(key)) unmapped.set(key, { count: 0, where: new Set() });
  const e = unmapped.get(key);
  e.count += 1;
  e.where.add(where);
}

/** Maps a raw WZ stat bag into normalized names, summing collisions (e.g. bdR + nbdR). */
function normalizeStats(raw, where) {
  const out = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (typeof v !== "number" || v === 0) continue;
    if (MODIFIER_KEYS.has(k)) continue;
    const name = STAT_MAP[k];
    if (!name) {
      noteUnmapped(k, where);
      continue;
    }
    out[name] = (out[name] || 0) + v;
  }
  return out;
}

function isEmpty(obj) {
  for (const _ in obj) return false;
  return true;
}

// ─── Slot model ───────────────────────────────────────────────────────────────
// islot is the game's own equip-slot code and is present on every record. Multi-
// slot codes are concatenations: WpSi = two-handed weapon (takes weapon AND
// secondary), MaPn = overall (takes top AND bottom).

const SLOT_INFO = {
  Cp: { label: "Hat", occupies: ["hat"] },
  Ma: { label: "Top", occupies: ["top"] },
  Pn: { label: "Bottom", occupies: ["bottom"] },
  MaPn: { label: "Overall", occupies: ["top", "bottom"] },
  So: { label: "Shoes", occupies: ["shoes"] },
  Gv: { label: "Gloves", occupies: ["gloves"] },
  Sr: { label: "Cape", occupies: ["cape"] },
  Sh: { label: "Shoulder", occupies: ["shoulder"] },
  Wp: { label: "Weapon", occupies: ["weapon"] },
  WpSi: { label: "Weapon (2H)", occupies: ["weapon", "secondary"] },
  Si: { label: "Secondary", occupies: ["secondary"] },
  Af: { label: "Face Accessory", occupies: ["face"] },
  Ay: { label: "Eye Accessory", occupies: ["eye"] },
  Ae: { label: "Earrings", occupies: ["earrings"] },
  Pe: { label: "Pendant", occupies: ["pendant"] },
  Ri: { label: "Ring", occupies: ["ring"] },
  Be: { label: "Belt", occupies: ["belt"] },
  Me: { label: "Medal", occupies: ["medal"] },
  Ba: { label: "Badge", occupies: ["badge"] },
  Po: { label: "Pocket", occupies: ["pocket"] },
  // Synthetic codes; see resolveSlot().
  Em: { label: "Emblem", occupies: ["emblem"] },
  Ht: { label: "Heart", occupies: ["heart"] },
};

/**
 * Two WZ islot codes are ambiguous, and the game separates them by item id:
 *
 *   `Si` covers shields (109xxxx), secondary weapons (134/135xxxx) *and*
 *        emblems (119xxxx), which occupy a completely different slot.
 *   `Tm` covers mechanical hearts (167xxxx), androids (166xxxx) and mounts.
 *        Only hearts are gear — androids and mounts carry no combat stats and
 *        have no slot in the equipment window we model.
 *
 * Items whose slot is synthesised keep their original code on `islot`, because
 * the potential tables are keyed by the WZ code and know nothing about this.
 *
 * @returns The slot code, or null when the item is not equipment we model.
 */
function resolveSlot(itemId, islot) {
  if (islot === "Si") {
    return itemId >= 1190000 && itemId <= 1199999 ? "Em" : "Si";
  }
  if (islot === "Tm") {
    return itemId >= 1670000 && itemId <= 1679999 ? "Ht" : null;
  }
  return islot;
}

/**
 * optionType → which islots the line may roll on.
 *
 * Grades 1-4 only; on grade-6 presets optionType is vestigial (see
 * docs/equip-compare-data.md). `null` optionType means "any slot".
 *
 * The 51-55 assignments are read off line descriptions and match well-known GMS
 * restrictions (crit damage is gloves-only, Decent Haste shoes-only, Decent
 * Hyper Body bottom-only). optionType 20 is unresolved and left unrestricted.
 */
const WEAPON_SLOTS = ["Wp", "WpSi", "Si"];
const ARMOR_SLOTS = ["Cp", "Ma", "Pn", "MaPn", "So", "Gv", "Sr", "Sh"];
// `Tm` (mechanical hearts) is grouped with the accessories on inference, not on
// evidence: no optionType in the WZ names it, and hearts do take potential in
// game. Flagged as an open question in docs/equip-compare-data.md.
const ACCESSORY_SLOTS = ["Af", "Ay", "Ae", "Pe", "Ri", "Be", "Tm"];

// ─── Notability ───────────────────────────────────────────────────────────────
//
// The dump is every piece of level-100+ equipment in the game, and most of it is
// event gear, old questlines and achievement medals that nobody will ever put in
// a comparison. Nothing in the WZ says "this item matters", so notability is
// inferred from three signals and shipped as a flag the picker can filter on —
// never as a deletion, because the judgement is a heuristic and the user can
// always switch it off.

/** Stats that can move a damage comparison. Anything else is flavour. */
const COMBAT_STATS = new Set([
  "str",
  "dex",
  "int",
  "luk",
  "allStat",
  "strP",
  "dexP",
  "intP",
  "lukP",
  "allStatP",
  "att",
  "matt",
  "attP",
  "mattP",
  "attackCount",
  "boss",
  "dmg",
  "ied",
  "critDmg",
  "critRate",
  "hp",
  "hpP",
]);

/**
 * Slots the level fallback below must not apply to.
 *
 * Medals are achievement rewards, so a level-200 requirement says the player was
 * level 200, not that the medal is endgame gear — 108 of them carry 3 ATT. Every
 * medal worth comparing is either a boss reward or part of a set, so those two
 * signals cover the slot on their own.
 */
const NO_LEVEL_FALLBACK = new Set(["Me"]);

const OPTION_TYPE_SLOTS = {
  10: WEAPON_SLOTS,
  11: ARMOR_SLOTS,
  20: null, // unresolved — do not restrict
  40: ACCESSORY_SLOTS,
  51: ["Cp"],
  52: ["Ma", "MaPn"],
  53: ["Pn", "MaPn"],
  54: ["Gv"],
  55: ["So"],
};

// ─── Load ─────────────────────────────────────────────────────────────────────

function load(name, optional = false) {
  try {
    return JSON.parse(readFileSync(join(SRC_DIR, name), "utf8"));
  } catch (err) {
    if (optional && err.code === "ENOENT") return null;
    throw err;
  }
}

console.log(`Reading from ${SRC_DIR}`);
const rawItems = load("equipment.json");
const rawOptions = load("item_options.json");
const rawSets = load("set_items.json");
// Written by EquipmentExtractor --dump-exceptional. Optional so a stale dump
// still builds; the exceptional bonus is simply absent from the output.
const rawExceptional = load("exceptional.json", true);
console.log(
  `  ${rawItems.length} items, ${rawOptions.length} options, ${rawSets.length} sets` +
    `, ${rawExceptional ? rawExceptional.length : "no"} exceptional enhancements`,
);

// ─── Items ────────────────────────────────────────────────────────────────────

const items = [];
const slotCounts = {};
let unknownSlot = 0;

for (const r of rawItems) {
  const stats = r.Stats || {};
  const strings = r.Strings || {};
  const islot = strings.islot;
  const slot = resolveSlot(r.ItemId, islot);

  if (!slot || !SLOT_INFO[slot]) {
    unknownSlot += 1;
    continue;
  }
  slotCounts[slot] = (slotCounts[slot] || 0) + 1;

  // setItemID of -1 is a sentinel meaning "no set" (Synergy Ring).
  const setId = stats.setItemID > 0 ? stats.setItemID : null;

  const item = {
    id: r.ItemId,
    name: r.Name || `Item ${r.ItemId}`,
    slot,
    reqLevel: stats.reqLevel ?? r.ReqLevel ?? 0,
    stats: normalizeStats(stats, "item"),
  };

  // Only carried when the slot was synthesised, so potential lookups can still
  // reach the WZ code the option tables are keyed by.
  if (slot !== islot) item.islot = islot;

  // Icon path, normalised to a forward-slash path relative to the icon root, so
  // the site can serve it from /equip-icons/<category>/<id>.png.
  if (r.Icon) {
    item.icon = r.Icon.replace(/\\/g, "/").replace(/^equipment_icons\//, "");
  }

  if (setId) item.setId = setId;
  // Total upgrade count — the item's scroll slots. Carried even when it is zero,
  // because zero is the signal that the item cannot be enhanced at all (and so
  // cannot be star forced); see the star force section below.
  if (stats.tuc !== undefined) item.tuc = stats.tuc;
  if (stats.reqJob) item.reqJob = stats.reqJob;
  if (stats.bossReward) item.bossDrop = true;
  if (stats.attackSpeed) item.attackSpeed = stats.attackSpeed;
  if (r.Category) item.category = r.Category;

  // Flags that change how modifiers apply, not stats in themselves.
  //   superiorEqp  — Superior (Tyrant) gear, which uses a *different* star force
  //                  stat-gain table from ordinary equipment.
  //   Etuc         — exceptional upgrade slots (Exceptional Enhancement).
  //   noPotential / tucIgnoreForPotential — potential availability rules.
  if (stats.superiorEqp) item.superior = true;
  if (stats.Etuc) item.exceptionalSlots = stats.Etuc;
  if (stats.fixedPotential) item.fixedPotential = true;
  if (stats.fixedGrade) item.fixedGrade = stats.fixedGrade;
  if (stats.noPotential) item.noPotential = true;
  if (stats.tucIgnoreForPotential) item.tucIgnoreForPotential = true;

  // Fixed potential presets: [{ optionId, level }]
  const optNode = r.Nested?.option;
  if (optNode) {
    const lines = [];
    for (const entry of Object.values(optNode)) {
      if (entry && typeof entry === "object" && entry.option > 0) {
        lines.push({ optionId: entry.option, level: entry.level ?? 1 });
      }
    }
    if (lines.length) item.presetPotential = lines;
  }

  // Growth equips roll random stats per level, so they can't be resolved
  // deterministically. Flag them so the UI can ask for the actual rolled stats.
  if (r.Nested?.level) item.growth = true;
  if (r.Nested?.dayOfWeekItemStat) item.dayOfWeek = true;

  items.push(item);
}

items.sort((a, b) => a.id - b.id);
console.log(
  `  kept ${items.length} items (${unknownSlot} skipped for unrecognised islot)`,
);

// ─── Dedupe ───────────────────────────────────────────────────────────────────
//
// The game ships the same item under several ids — five Royal Warrior Helms,
// two Time Traveler's Laurels — usually because it was re-issued for a later
// event. Nothing distinguishes them to a comparison, so only the lowest id is
// kept.
//
// The key is every field that could make two same-named items behave
// differently, which is what makes this lossless. reqJob and presetPotential in
// particular must be in it: the two Dominator Pendants are identical apart from
// their preset potential lines, and collapsing them would hide the magician's.

function dedupeKey(i) {
  return JSON.stringify([
    i.name,
    i.slot,
    i.reqLevel,
    i.reqJob ?? 0,
    i.setId ?? 0,
    i.stats,
    i.presetPotential ?? null,
    i.superior ?? 0,
    i.exceptionalSlots ?? 0,
    i.growth ?? 0,
    i.fixedGrade ?? 0,
    i.tuc ?? 0,
  ]);
}

const distinct = [];
const seenItems = new Map();
for (const item of items) {
  const key = dedupeKey(item);
  const first = seenItems.get(key);
  if (first) {
    // Kept so a saved loadout referencing the dropped id can still be resolved.
    (first.aliases ??= []).push(item.id);
    continue;
  }
  seenItems.set(key, item);
  distinct.push(item);
}

const duplicatesRemoved = items.length - distinct.length;
items.length = 0;
items.push(...distinct);
console.log(
  `  ${duplicatesRemoved} duplicate re-issues folded into their original`,
);

// ─── Exceptional Enhancement ──────────────────────────────────────────────────
//
// Six items accept an Exceptional Hammer, and `Etuc` says how many times. What a
// hammer is worth lives in Item/Consume, nowhere near the equipment it modifies,
// so EquipmentExtractor dumps it separately (see --dump-exceptional).
//
// The bonus is resolved per *slot* rather than per item id. Every hammer for a
// slot grants the same stats — the boss-drop Exceptional Parts and the hammers
// bought with Exceptional Hammer coupons are two routes to one bonus — and the
// hammers' own `req` lists have not kept up with the equipment: Original Sin of
// Pride carries three Etuc slots and appears in no hammer's list, though the
// Face Acc hammer's description names it.

function applyExceptional(list) {
  if (!list?.length) return 0;

  const slotOf = new Map(items.map((i) => [i.id, i.slot]));
  const bySlot = new Map();

  for (const hammer of list) {
    const stats = normalizeStats(hammer.Stats, `exceptional:${hammer.ItemId}`);
    if (isEmpty(stats)) continue;

    for (const targetId of hammer.AppliesTo ?? []) {
      const slot = slotOf.get(targetId);
      if (!slot || bySlot.has(slot)) continue;
      bySlot.set(slot, stats);
    }
  }

  let applied = 0;
  for (const item of items) {
    if (!item.exceptionalSlots) continue;
    const stats = bySlot.get(item.slot);
    if (!stats) {
      console.warn(
        `  ! ${item.name} takes ${item.exceptionalSlots} exceptional enhancement(s) but no hammer targets its slot`,
      );
      continue;
    }
    item.exceptional = stats;
    applied += 1;
  }

  return applied;
}

const exceptionalCount = applyExceptional(rawExceptional);
if (exceptionalCount) {
  console.log(
    `  ${exceptionalCount} items given an exceptional enhancement bonus`,
  );
}

// ─── Star force limits ────────────────────────────────────────────────────────
//
// Star force normally follows the item's level (see src/lib/equip/starforce.js).
// Two things break that, and neither is recorded as such in the WZ:
//
//   1. Items that cannot be enhanced at all. `tuc` — total upgrade count — is 0
//      on every medal, pocket item, badge and quest weapon in the dump, and 0
//      upgrade slots is exactly what stops an item being star forced. That makes
//      it the one signal the game does give us, so it is used directly.
//
//   2. Items that ship at a fixed star count and cap below their level's normal
//      ceiling — the Genesis / Destiny weapons and the Red Beryl rental set, plus
//      the three Astra secondary grades. Nothing distinguishes those in the data
//      (the two Destiny weapons differ only by an unrelated `tuc` of 8 vs 9), so
//      they are curated below and matched by set, name and stat rank.
//
// Output is two optional fields per item:
//   starMin — the star count the item is granted at and cannot go below
//   starMax — its ceiling, overriding the level table (0 = cannot be starred)

/** The five Eternal sets, one per job branch, which the Genesis weapons sit in. */
const ETERNAL_SET_IDS = new Set([886, 887, 888, 889, 890]);

function statTotal(item) {
  let total = 0;
  for (const v of Object.values(item.stats)) total += v;
  return total;
}

/** Groups items by a key, preserving insertion order within each group. */
function groupBy(list, keyOf) {
  const out = new Map();
  for (const item of list) {
    const key = keyOf(item);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(item);
  }
  return out;
}

let starRuleCount = 0;
function setStarRule(item, min, max) {
  if (min) item.starMin = min;
  item.starMax = max;
  starRuleCount += 1;
}

// Genesis weapons are liberated at 22 stars and can never be enhanced further.
// The Destiny upgrade keeps those 22 and raises the ceiling — but only on its
// second stage. The two stages carry identical stats and are told apart solely
// by their upgrade count: 8 on the first, 9 on the second.
for (const item of items) {
  if (!ETERNAL_SET_IDS.has(item.setId) || !item.slot.startsWith("Wp")) continue;
  if (item.name.startsWith("Genesis ")) setStarRule(item, 22, 22);
  else if (item.name.startsWith("Destiny "))
    setStarRule(item, item.tuc >= 9 ? 0 : 22, item.tuc >= 9 ? 25 : 22);
}

// Astra secondaries come in three grades that share a name and differ only in
// how much stat they carry. The weakest caps at 15 stars, the middle at 20, the
// strongest at the usual 30.
const ASTRA_CAPS = [15, 20, 30];
for (const [name, group] of groupBy(
  items.filter((i) => i.slot === "Si" && i.name.startsWith("Astra ")),
  (i) => `${i.name}|${i.reqJob ?? 0}`,
)) {
  if (group.length !== ASTRA_CAPS.length) {
    console.warn(
      `  ! ${name}: expected ${ASTRA_CAPS.length} Astra grades, found ${group.length}`,
    );
    continue;
  }
  [...group]
    .sort((a, b) => statTotal(a) - statTotal(b))
    .forEach((item, idx) => setStarRule(item, 0, ASTRA_CAPS[idx]));
}

// The Red Beryl rental set is granted at 20 stars and cannot be enhanced.
// Identified by name because `fixedPotential` alone covers far more items.
for (const item of items) {
  if (item.name.startsWith("Red Beryl ") && item.fixedPotential)
    setStarRule(item, 20, 20);
}

// Exactly two badges can be star forced — Sengoku Hakase and Ghost Ship
// Exorcist — and both cap at 22. They are also the only two badges that take
// potential, so the same split decides both, and `tuc` picks them out on its
// own: they are the only badges in the dump with any upgrade slots.
//
// Badges use their own star force table (all stats, no attack, no HP, no DEF);
// that part lives in starforce.js.
for (const item of items) {
  if (item.slot !== "Ba") continue;
  const enhanceable = item.tuc > 0;
  if (item.starMax === undefined) setStarRule(item, 0, enhanceable ? 22 : 0);
  if (!enhanceable) item.noPotential = true;
}

// Finally the general rule, which must not overwrite any of the above.
//
// Secondaries are exempt: `tuc` is 0 on the entire Princess No and Astra
// generation, which is exactly the gear that gets starred, so for that slot the
// upgrade count plainly is not tracking star force. Every other slot holds up —
// the tuc-0 items are medals, badges, emblems, pocket items, event rings and
// quest weapons, none of which can be enhanced.
let unstarrable = 0;
for (const item of items) {
  if (item.starMax === undefined && item.tuc === 0 && item.slot !== "Si") {
    item.starMax = 0;
    unstarrable += 1;
  }
}

console.log(
  `  ${starRuleCount} items given an explicit star range, ${unstarrable} marked unstarrable`,
);

// ─── Potentials ───────────────────────────────────────────────────────────────
//
// optionId = GRADE * 10000 + KIND * 1000 + line,  KIND 0 = regular, 2 = bonus.
// Levels are indexed by ceil(reqLevel / 10), clamped 1..25. Most lines hold the
// same value across long runs of indices, so tiers are run-length encoded:
// look up the last tier whose `from` is <= the item's level index.

const GRADE_NAMES = {
  0: "legacy",
  1: "rare",
  2: "epic",
  3: "unique",
  4: "legendary",
};

function tiersFromLevels(levels, where) {
  const idx = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);
  const tiers = [];
  let prev = null;
  for (const i of idx) {
    const stats = normalizeStats(levels[String(i)], where);
    const key = JSON.stringify(stats);
    if (key !== prev) {
      tiers.push({ from: i, stats });
      prev = key;
    }
  }
  return tiers;
}

const potentials = [];
for (const o of rawOptions) {
  const grade = o.GradeCode;
  const kind = Math.floor(o.OptionId / 1000) % 10 === 2 ? "bonus" : "regular";
  const source =
    o.LevelsNormalized && Object.keys(o.LevelsNormalized).length
      ? o.LevelsNormalized
      : o.Levels;

  const tiers = tiersFromLevels(source || {}, `option:${o.OptionId}`);
  // Lines whose every tier is empty carry only proc/flavour data and contribute
  // nothing a stat comparison can use.
  if (!tiers.length || tiers.every((t) => isEmpty(t.stats))) continue;

  const optionType = o.OptionType ?? null;
  const line = {
    id: o.OptionId,
    grade,
    gradeName: GRADE_NAMES[grade] ?? String(grade),
    kind,
    desc: (o.Description || "").trim(),
    tiers,
  };
  if (optionType !== null) line.optionType = optionType;
  const allowed = optionType === null ? null : OPTION_TYPE_SLOTS[optionType];
  if (allowed) line.slots = allowed;
  if (o.ReqLevel) line.reqLevel = o.ReqLevel;

  potentials.push(line);
}

potentials.sort((a, b) => a.id - b.id);
const rollable = potentials.filter((p) => p.grade >= 1 && p.grade <= 4);
console.log(
  `  ${potentials.length} usable potential lines (${rollable.length} rollable, grades 1-4)`,
);

// ─── Sets ─────────────────────────────────────────────────────────────────────
//
// Membership is built from each item's setItemID backlink, NOT from the set's
// own ItemIds list — that list is stale (286 items are omitted from the set they
// belong to, e.g. Root Abyss sets drop 19 of their own pieces).

const membership = new Map();
for (const it of items) {
  if (!it.setId) continue;
  if (!membership.has(it.setId)) membership.set(it.setId, []);
  membership.get(it.setId).push(it.id);
}

/**
 * What one piece of a set is worth, on average, in set bonus alone.
 *
 * Set effects are cumulative and are earned in thresholds, so no single piece
 * "grants" any of it — but the picker has to rank pieces one at a time, and a
 * piece of a set with effects is worth more than the same stats loose. Dividing
 * the whole bonus by the pieces needed to earn all of it is the plainest way to
 * put a number on that, and it is only ever used as a sort key. The engine's own
 * set resolution is exact and does not use this.
 */
function perPieceShare(effects) {
  const thresholds = Object.keys(effects).map(Number);
  const pieces = Math.max(...thresholds);

  const total = {};
  for (const t of thresholds) {
    for (const [k, v] of Object.entries(effects[String(t)]))
      total[k] = (total[k] || 0) + v;
  }

  const share = {};
  for (const [k, v] of Object.entries(total))
    share[k] = Math.round((v / pieces) * 100) / 100;
  return share;
}

const sets = [];
const setsById = new Map(rawSets.map((s) => [s.SetItemId, s]));

for (const [setId, memberIds] of membership) {
  const s = setsById.get(setId);
  if (!s) {
    console.warn(
      `  ! setItemID ${setId} referenced by ${memberIds.length} item(s) but absent from set_items.json`,
    );
    continue;
  }

  // Merge both channels: plain Effects plus the resolved ItemOption effects.
  const counts = new Set([
    ...Object.keys(s.Effects || {}),
    ...Object.keys(s.OptionEffectsNormalized || {}),
  ]);

  const effects = {};
  for (const c of counts) {
    const merged = {
      ...normalizeStats(s.Effects?.[c], `set:${setId}`),
    };
    const opt = normalizeStats(s.OptionEffectsNormalized?.[c], `set:${setId}`);
    for (const [k, v] of Object.entries(opt)) merged[k] = (merged[k] || 0) + v;
    if (!isEmpty(merged)) effects[c] = merged;
  }

  if (isEmpty(effects)) continue;

  sets.push({
    id: setId,
    name: s.Name || `Set ${setId}`,
    members: memberIds.sort((a, b) => a - b),
    effects,
    perPiece: perPieceShare(effects),
  });
}

sets.sort((a, b) => a.id - b.id);
console.log(`  ${sets.length} sets with effects`);

// ─── Notability ───────────────────────────────────────────────────────────────
// Runs last because set membership is only known once the sets are resolved.

const setsWithEffects = new Set(sets.map((s) => s.id));
let notableCount = 0;

// Recounted here rather than in the item loop so the numbers describe what
// actually ships, after the duplicate re-issues have been folded away.
for (const k of Object.keys(slotCounts)) delete slotCounts[k];

for (const item of items) {
  slotCounts[item.slot] = (slotCounts[item.slot] || 0) + 1;
  // An item that grants nothing a damage comparison reads can never be worth
  // comparing, whatever else it has going for it.
  const fightsBack = Object.keys(item.stats).some((k) => COMBAT_STATS.has(k));

  const notable =
    fightsBack &&
    (item.bossDrop ||
      (item.setId && setsWithEffects.has(item.setId)) ||
      // Fallback for gear too new to be flagged or set-bound: the Astra
      // secondaries carry neither signal but are current endgame items.
      (item.reqLevel >= 200 && !NO_LEVEL_FALLBACK.has(item.slot)));

  if (notable) {
    item.notable = true;
    notableCount += 1;
  }
}

console.log(`  ${notableCount} of ${items.length} items flagged notable`);

// ─── Write ────────────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

const meta = {
  generatedAt: new Date().toISOString(),
  region: "GMS",
  minItemLevel: Math.min(...items.map((i) => i.reqLevel)),
  counts: {
    items: items.length,
    notableItems: notableCount,
    duplicatesRemoved,
    potentials: potentials.length,
    sets: sets.length,
  },
  slots: SLOT_INFO,
  slotCounts,
  multiplicativeStats: [...MULTIPLICATIVE],
  optionTypeSlots: OPTION_TYPE_SLOTS,
};

function write(name, data) {
  const p = join(OUT_DIR, name);
  writeFileSync(p, JSON.stringify(data));
  const kb = (readFileSync(p).length / 1024).toFixed(0);
  console.log(`  wrote ${name} (${kb} KB)`);
}

write("items.json", items);
write("potentials.json", potentials);
write("sets.json", sets);
write("meta.json", meta);

if (unmapped.size) {
  console.log("\n! Unmapped stat keys (add to STAT_MAP or MODIFIER_KEYS):");
  for (const [k, v] of [...unmapped].sort((a, b) => b[1].count - a[1].count)) {
    console.log(
      `    ${k.padEnd(24)} ${String(v.count).padStart(5)}  [${[...v.where].slice(0, 3).join(", ")}]`,
    );
  }
}

console.log("\nDone.");
