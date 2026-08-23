/**
 * End-to-end checks for the equip comparison engine against the real
 * public/equip-data/ output. Run: npm run verify-equip-engine
 */

import { readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
  buildIndexes,
  resolveItem,
  resolveLoadout,
  diffLoadouts,
  diffItemSwap,
  resolveSetEffects,
  potentialLevelIndex,
  potentialValueAt,
  occupiedSlots,
  equippableSlots,
  itemFitsSlot,
  exceptionalGains,
  exceptionalSlots,
  LOADOUT_SLOTS,
  setProgress,
} from "../lib/equip/engine.js";
import { itemMatchesClass } from "../lib/equip/classes.js";
import {
  acceptsFlames,
  flameContext,
  flameLineValue,
  flameLinesFor,
  isFlameAdvantaged,
  migrateFlameLines,
} from "../lib/equip/flames.js";
import {
  maxStars,
  starCap,
  starFloor,
  isStarForceable,
} from "../lib/equip/starforce.js";
import { itemPreset, configForItem } from "../lib/equip/specialItems.js";
import {
  filterItemsForSlot,
  slotCandidates,
  byPower,
  itemScore,
  DEFAULT_FILTERS,
} from "../lib/equip/itemFilter.js";
import {
  EQUIP_SLOT_LAYOUT,
  SLOT_SIZE,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
} from "../lib/equip/uiLayout.js";
import {
  flattenStats,
  combineIed,
  diffStats,
  formatStat,
} from "../lib/equip/stats.js";
import {
  describePotential,
  isInertPotential,
  potentialOptions,
  potentialTextIsComplete,
} from "../lib/equip/potentialText.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, "../../public/equip-data");
const load = (n) => JSON.parse(readFileSync(join(DATA, n), "utf8"));

const items = load("items.json");
const potentials = load("potentials.json");
const sets = load("sets.json");
const data = buildIndexes({ items, potentials, sets });

let fails = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails += 1;
  console.log(
    `${ok ? "  ok  " : " FAIL "} ${label}: ${JSON.stringify(got)}${ok ? "" : ` (want ${JSON.stringify(want)})`}`,
  );
};

// ── IED stacks multiplicatively ──────────────────────────────────────────────
console.log("=== IED combination ===");
eq("two 30% sources", Math.round(combineIed([30, 30])), 51);
eq("30 + 10", Math.round(combineIed([30, 10]) * 10) / 10, 37);
eq("empty", combineIed([]), 0);

// 1 - (1 - 5/100) does not round trip in binary floating point; unrounded it is
// 5.000000000000004, which used to reach the screen verbatim.
eq("single 5% source is exact", combineIed([5]), 5);
eq("single 5% source formats clean", formatStat("ied", combineIed([5])), "5%");
eq(
  "no phantom row from float dust",
  diffStats({ values: {}, ied: [5] }, { values: {}, ied: [5] }),
  [],
);
eq(
  "a real IED gain still shows",
  diffStats({ values: {}, ied: [5] }, { values: {}, ied: [5, 10] }).map(
    (r) => r.key,
  ),
  ["ied"],
);
eq(
  "one decimal, not seventeen",
  formatStat("ied", combineIed([30, 10])),
  "37%",
);

// ── Potential level index ────────────────────────────────────────────────────
console.log("\n=== potential level index ===");
eq("lvl 200 → 20", potentialLevelIndex(200), 20);
eq("lvl 150 → 15", potentialLevelIndex(150), 15);
eq("lvl 141 → 15", potentialLevelIndex(141), 15);
eq("clamped low", potentialLevelIndex(3), 1);

const bossLine = potentials.find((p) => p.id === 40601);
eq("legendary boss line @ lvl200 index", potentialValueAt(bossLine, 20), {
  boss: 30,
});
eq("legendary boss line @ lvl250 index", potentialValueAt(bossLine, 25), {
  boss: 35,
});

// ── Multi-slot items ─────────────────────────────────────────────────────────
console.log("\n=== multi-slot items ===");
const twoHander = items.find((i) => i.slot === "WpSi");
const overall = items.find((i) => i.slot === "MaPn");
eq("WpSi occupies weapon+secondary", occupiedSlots(twoHander, "weapon"), [
  "weapon",
  "secondary",
]);
eq("MaPn occupies top+bottom", occupiedSlots(overall, "top"), [
  "top",
  "bottom",
]);

// Occupancy is not the same as pickability: a two-hander covers the secondary
// slot but can only be equipped into the weapon slot. Conflating them put every
// two-handed weapon in the Secondary picker.
eq("WpSi is only equippable as a weapon", equippableSlots(twoHander), [
  "weapon",
]);
eq("MaPn is only equippable as a top", equippableSlots(overall), ["top"]);
eq(
  "no two-hander fits secondary",
  items.filter((i) => i.slot === "WpSi" && itemFitsSlot(i, "secondary")).length,
  0,
);
eq(
  "no overall fits bottom",
  items.filter((i) => i.slot === "MaPn" && itemFitsSlot(i, "bottom")).length,
  0,
);

// ── Slots synthesised from ambiguous WZ islots ───────────────────────────────
console.log("\n=== emblems and hearts ===");
{
  const emblems = items.filter((i) => i.slot === "Em");
  const hearts = items.filter((i) => i.slot === "Ht");

  eq("emblems were split out of Si", emblems.length > 0, true);
  eq(
    "every emblem keeps its WZ islot",
    emblems.every((i) => i.islot === "Si"),
    true,
  );
  eq(
    "emblems fit only the emblem slot",
    emblems.every(
      (i) => itemFitsSlot(i, "emblem") && !itemFitsSlot(i, "secondary"),
    ),
    true,
  );

  eq("hearts are present", hearts.length > 0, true);
  eq(
    "every heart keeps its WZ islot",
    hearts.every((i) => i.islot === "Tm"),
    true,
  );
  eq(
    "hearts fit the heart slot",
    hearts.every((i) => itemFitsSlot(i, "heart")),
    true,
  );

  // Total Control is the endgame heart: +25 all stat, +15 ATT, +30% IED.
  const total = data.itemIndex.get(1672095);
  eq("Total Control resolves", total?.name, "Total Control");
  eq(
    "Total Control stats",
    { str: total.stats.str, att: total.stats.att, ied: total.stats.ied },
    { str: 25, att: 15, ied: 30 },
  );

  // Every slot in the window must have something the picker can offer.
  const empty = LOADOUT_SLOTS.filter(
    (s) => !items.some((i) => itemFitsSlot(i, s.key)),
  ).map((s) => s.key);
  eq("no loadout slot is unfillable", empty, []);
}

// ── Badges take star force stat but never attack ─────────────────────────────
console.log("\n=== badge star force ===");
{
  const badge = items.find((i) => i.slot === "Ba" && i.reqLevel >= 150);
  const at15 = flattenStats(
    resolveLoadout({ badge: { itemId: badge.id, stars: 15 } }, data).stats,
  );
  const at22 = flattenStats(
    resolveLoadout({ badge: { itemId: badge.id, stars: 22 } }, data).stats,
  );

  console.log(
    `  ${badge.name}: 15* att ${at15.att || 0}, 22* att ${at22.att || 0}`,
  );
  eq("badge gains no attack past 15", (at22.att || 0) - (at15.att || 0), 0);
  eq("badge still gains stat past 15", at22.str > at15.str, true);

  // A same-level accessory still does gain attack, so the rule is badge-specific.
  const ring = items.find((i) => i.slot === "Ri" && i.reqLevel >= 150);
  const ring15 = flattenStats(
    resolveLoadout({ ring1: { itemId: ring.id, stars: 15 } }, data).stats,
  );
  const ring22 = flattenStats(
    resolveLoadout({ ring1: { itemId: ring.id, stars: 22 } }, data).stats,
  );
  eq(
    "rings still gain attack past 15",
    (ring22.att || 0) > (ring15.att || 0),
    true,
  );
}

// ── Class filtering ──────────────────────────────────────────────────────────
console.log("\n=== class filter ===");
{
  const anyClass = items.filter((i) => itemMatchesClass(i, "all")).length;
  eq('"all" filters nothing', anyClass, items.length);

  // A magician-only item must not survive a warrior filter, and vice versa.
  const mageOnly = items.find((i) => i.reqJob === 2);
  eq(
    "magician item hidden from warrior",
    itemMatchesClass(mageOnly, "warrior"),
    false,
  );
  eq(
    "magician item shown to magician",
    itemMatchesClass(mageOnly, "magician"),
    true,
  );

  // Xenon gear is thief|pirate, so it must show under both.
  const xenon = items.find((i) => i.reqJob === 24);
  eq("Xenon gear shows for thief", itemMatchesClass(xenon, "thief"), true);
  eq("Xenon gear shows for pirate", itemMatchesClass(xenon, "pirate"), true);
  eq(
    "Xenon gear hidden from warrior",
    itemMatchesClass(xenon, "warrior"),
    false,
  );

  // Items with no requirement are equippable by everyone.
  const unrestricted = items.find((i) => !i.reqJob);
  eq(
    "unrestricted item shows for every class",
    ["warrior", "magician", "bowman", "thief", "pirate"].every((c) =>
      itemMatchesClass(unrestricted, c),
    ),
    true,
  );

  for (const c of ["warrior", "magician", "bowman", "thief", "pirate"]) {
    const n = items.filter((i) => itemMatchesClass(i, c)).length;
    console.log(`  ${c.padEnd(9)} ${n} items`);
  }
}

// ── Flame eligibility ────────────────────────────────────────────────────────
console.log("\n=== flame eligibility ===");
{
  const bySlot = (s) => items.find((i) => i.slot === s);
  for (const slot of ["Ri", "Sh", "Me", "Em", "Ba", "Ht", "Si"]) {
    eq(`${slot} takes no flames`, acceptsFlames(bySlot(slot)), false);
  }
  for (const slot of [
    "Cp",
    "Ma",
    "Pn",
    "So",
    "Gv",
    "Sr",
    "Wp",
    "WpSi",
    "Af",
    "Pe",
    "Be",
  ]) {
    eq(`${slot} takes flames`, acceptsFlames(bySlot(slot)), true);
  }

  // The two per-item exceptions must beat their slot.
  const scarlet = data.itemIndex.get(1152155);
  const immortal = data.itemIndex.get(1143471);
  eq(
    "Scarlet Shoulder is the shoulder exception",
    acceptsFlames(scarlet),
    true,
  );
  eq("Immortal Legacy is the medal exception", acceptsFlames(immortal), true);

  // A flame config left over from a previous item must contribute nothing.
  const ring = items.find((i) => i.slot === "Ri" && i.reqLevel >= 150);
  const flamed = { itemId: ring.id, flames: [{ line: "str", tier: 7 }] };
  const diff = diffLoadouts(
    { ring1: { itemId: ring.id } },
    { ring1: flamed },
    data,
  );
  eq("flames on a ring change nothing", diff.rows, []);
}

// ── Preset potential ─────────────────────────────────────────────────────────
console.log("\n=== preset potential ===");
{
  const withPreset = items.filter((i) => i.presetPotential);
  console.log(`  ${withPreset.length} items ship with their potential decided`);

  const unresolvable = withPreset.filter(
    (i) => !i.presetPotential.every((l) => data.lineIndex.has(l.optionId)),
  );
  // Very Sturdy Krrr Ring points at option 60047, which carries no stats and so
  // never makes it into potentials.json. It is the only one.
  eq("at most one preset line is unresolvable", unresolvable.length <= 1, true);

  // Dominator Pendant: 9% STR / 6% STR / 6% crit rate, all fixed.
  const dominator = data.itemIndex.get(1122372);
  eq(
    "Dominator Pendant has three preset lines",
    dominator.presetPotential.length,
    3,
  );
  const resolved = resolveLoadout({ pendant: { itemId: dominator.id } }, data);
  eq(
    "preset potential is counted without being entered",
    flattenStats(resolved.stats).strP,
    15,
  );

  // Entering lines by hand replaces the preset rather than stacking on it.
  const overridden = resolveLoadout(
    { pendant: { itemId: dominator.id, potentials: [{ optionId: 40001 }] } },
    data,
  );
  eq(
    "an override replaces the preset",
    flattenStats(overridden.stats).strP,
    undefined,
  );
}

// ── Notability and dedupe ────────────────────────────────────────────────────
console.log("\n=== item list filtering ===");
{
  const notable = items.filter((i) => i.notable);
  console.log(`  ${notable.length} of ${items.length} items notable`);
  eq(
    "notability narrows without emptying",
    notable.length > 0 && notable.length < items.length,
    true,
  );

  // The medal exclusion: no lv200 achievement medal may sneak in on level alone.
  const junkMedals = items.filter(
    (i) => i.slot === "Me" && i.notable && !i.bossDrop && !i.setId,
  );
  eq("no medal is notable on level alone", junkMedals.length, 0);

  // The defaults must hide nothing. This is the whole point: the notability
  // flag misses real gear, so it may narrow the list only when asked to.
  const hiding = [];
  for (const { key } of LOADOUT_SLOTS) {
    for (const classKey of [
      "all",
      "warrior",
      "magician",
      "bowman",
      "thief",
      "pirate",
    ]) {
      const shown = filterItemsForSlot(items, {
        slotKey: key,
        classKey,
        ...DEFAULT_FILTERS,
      });
      const all = slotCandidates(items, key, classKey);
      if (shown.length !== all.length) hiding.push(`${key}/${classKey}`);
    }
  }
  eq("the default filters hide nothing", hiding, []);

  // The equipped item is never filtered away even when the filters are on, or a
  // swap would hide its own starting point.
  const junk = items.find((i) => !i.notable && itemFitsSlot(i, "hat"));
  const withJunk = filterItemsForSlot(items, {
    slotKey: "hat",
    classKey: "all",
    currentId: junk.id,
    notableOnly: true,
    minLevel: 200,
  });
  eq(
    "the equipped item survives any filter",
    withJunk.some((i) => i.id === junk.id),
    true,
  );

  // ── Ordering is what replaced the filter, so it is what gets tested. ───────
  //
  // Each of these is an item the notability flag missed. They must rank near the
  // top of their slot, because that is now the only thing keeping them findable.
  // Stated as relative orderings rather than absolute ranks: "top 5" is brittle
  // against ties and against the next patch, and what actually matters is that
  // the endgame piece sits above the one nobody equips.
  const outranks = (slotKey, classKey, better, worse) => {
    const list = filterItemsForSlot(items, {
      slotKey,
      classKey,
      ...DEFAULT_FILTERS,
    })
      .sort(byPower(classKey))
      .map((i) => i.name);
    const a = list.indexOf(better);
    const b = list.indexOf(worse);
    eq(`${better} > ${worse}`, a !== -1 && b !== -1 && a < b, true);
  };

  // The regression that started all this: the notability flag hid every Princess
  // No secondary, leaving a bowman with nothing but old event gear.
  outranks(
    "secondary",
    "bowman",
    "Princess No's Floral Jewel",
    "Maple Treasure Ereve Brilliance",
  );
  outranks("secondary", "magician", "Astra Talisman", "Timeless Prelude");
  outranks("hat", "warrior", "Eternal Knight Helm", "Arcane Umbra Knight Hat");
  outranks("hat", "warrior", "Arcane Umbra Knight Hat", "Royal Warrior Helm");
  outranks(
    "pendant",
    "all",
    "Superior Engraved Gollux Pendant",
    "Reinforced Engraved Gollux Pendant",
  );
  outranks("badge", "all", "Genesis Badge", "Badge of Mano");
  outranks("medal", "all", "Immortal Legacy", "Gallant Warrior");

  // Attack and main stat are counted once, not once per variant. Black Heart
  // carries 77 ATT *and* 77 MATT, and no class gets both.
  const blackHeart = items.find(
    (i) => i.name === "Black Heart" && i.stats.att === 77,
  );
  eq(
    "att and matt are not both counted",
    itemScore(blackHeart) < 77 * 5 + 100,
    true,
  );
  eq(
    "a magician scores it off MATT alone",
    itemScore(blackHeart, "magician"),
    itemScore(blackHeart, "warrior"),
  );

  for (const key of [
    "hat",
    "weapon",
    "secondary",
    "pendant",
    "badge",
    "ring1",
  ]) {
    const top = filterItemsForSlot(items, {
      slotKey: key,
      classKey: "magician",
      ...DEFAULT_FILTERS,
    })
      .sort(byPower("magician"))
      .slice(0, 4)
      .map((i) => i.name);
    console.log(`  magician ${key.padEnd(10)} ${top.join(" · ")}`);
  }

  // Aliases: a loadout saved against a folded-away id still resolves.
  const aliased = items.find((i) => i.aliases?.length);
  eq(
    "folded duplicates still resolve",
    data.itemIndex.get(aliased.aliases[0])?.id,
    aliased.id,
  );
  const ids = new Set(items.map((i) => i.id));
  eq(
    "no alias collides with a live id",
    items.flatMap((i) => i.aliases ?? []).filter((a) => ids.has(a)).length,
    0,
  );
}

// ── Set effects are cumulative ───────────────────────────────────────────────
console.log("\n=== set effects (Arcane Umbra Warrior, set 617) ===");
const umbra = sets.find((s) => s.id === 617);
const umbraItems = umbra.members
  .map((id) => data.itemIndex.get(id))
  .filter(Boolean);

for (const pieces of [2, 3, 4]) {
  const entries = umbraItems.slice(0, pieces).map((item) => ({ item }));
  const { stats, active } = resolveSetEffects(entries, data.setIndex);
  const flat = flattenStats(stats);
  console.log(
    `  ${pieces}-piece → att ${flat.att || 0}, boss ${flat.boss || 0}%, ied ${Math.round(flat.ied || 0)}%  (thresholds ${active[0]?.thresholds})`,
  );
}

{
  // 2-piece is +30 ATT / +10% boss in game.
  const entries = umbraItems.slice(0, 2).map((item) => ({ item }));
  const flat = flattenStats(resolveSetEffects(entries, data.setIndex).stats);
  eq("2-piece attack", flat.att, 30);
  eq("2-piece boss", flat.boss, 10);
}
{
  // 3-piece is cumulative: 2-set + 3-set = 60 ATT, 10% boss, 10% IED, 400 DEF.
  const entries = umbraItems.slice(0, 3).map((item) => ({ item }));
  const flat = flattenStats(resolveSetEffects(entries, data.setIndex).stats);
  eq("3-piece attack is cumulative", flat.att, 60);
  eq("3-piece boss carried forward", flat.boss, 10);
  eq("3-piece ied", Math.round(flat.ied), 10);
  eq("3-piece def", flat.def, 400);
}

// ── A two-hander counts as ONE set piece despite filling two slots ───────────
console.log("\n=== two-hander counts once toward a set ===");
{
  const setWith2H = sets.find((s) =>
    s.members.some((id) => data.itemIndex.get(id)?.slot === "WpSi"),
  );
  const weapon = setWith2H.members
    .map((id) => data.itemIndex.get(id))
    .find((i) => i?.slot === "WpSi");

  const loadout = { weapon: { itemId: weapon.id } };
  const resolved = resolveLoadout(loadout, data);
  eq(`${weapon.name} counts as 1 item`, resolved.items.length, 1);
}

// ── The headline case: swapping one piece changes set bonuses on kept items ──
console.log("\n=== loadout diff: swapping out a set piece ===");
{
  const hat = umbraItems.find((i) => i.slot === "Cp");
  const glove = umbraItems.find((i) => i.slot === "Gv");
  const shoes = umbraItems.find((i) => i.slot === "So");
  const otherHat = items.find(
    (i) =>
      i.slot === "Cp" &&
      i.reqLevel === 200 &&
      i.setId !== 617 &&
      i.stats.str > 0,
  );

  const before = {
    hat: { itemId: hat.id },
    gloves: { itemId: glove.id },
    shoes: { itemId: shoes.id },
  };

  const result = diffItemSwap(before, "hat", { itemId: otherHat.id }, data);

  console.log(`  swapping ${hat.name} → ${otherHat.name}`);
  console.log(
    `  set pieces: ${result.before.sets[0]?.pieces} → ${result.after.sets.find((s) => s.setId === 617)?.pieces ?? 0}`,
  );
  for (const c of result.setChanges) {
    console.log(`  set change: ${c.name} ${c.beforePieces} → ${c.afterPieces}`);
  }
  for (const r of result.rows.slice(0, 8)) {
    const sign = r.delta > 0 ? "+" : "";
    console.log(
      `    ${r.label.padEnd(18)} ${sign}${Math.round(r.delta * 10) / 10}`,
    );
  }

  const changed = result.setChanges.find((c) => c.setId === 617);
  eq("losing a piece drops the set count", changed?.delta, -1);

  // The kept gloves/shoes lose their 3-set bonus even though they did not move.
  // That is the whole reason this is a loadout diff and not an item diff.
  const attRow = result.rows.find((r) => r.key === "att");
  eq("kept pieces lose set attack", attRow ? attRow.delta < 0 : false, true);
}

// ── Star force + flames through resolveItem ──────────────────────────────────
console.log("\n=== full item resolution ===");
{
  const hat = data.itemIndex.get(1004808); // Arcane Umbra Knight Hat
  const plain = flattenStats(
    resolveLoadout({ hat: { itemId: hat.id } }, data).stats,
  );
  const decked = flattenStats(
    resolveLoadout(
      {
        hat: {
          itemId: hat.id,
          stars: 22,
          flames: [
            { line: "str", tier: 7 },
            { line: "allStat", tier: 5 },
          ],
          potentials: [{ optionId: 40041 }],
        },
      },
      data,
    ).stats,
  );

  console.log(
    `  base:   str ${plain.str}, att ${plain.att}, ied ${Math.round(plain.ied)}%`,
  );
  console.log(
    `  22*+flame+pot: str ${decked.str}, att ${decked.att}, allStatP ${decked.allStatP || 0}%, strP ${decked.strP || 0}%`,
  );

  eq("base str", plain.str, 65);
  eq("22* adds 145 str, tier-7 flame adds 77", decked.str, 65 + 145 + 77);
  eq("tier-5 all-stat flame", decked.allStatP, 5);
  eq("legendary %STR potential at lvl 200", decked.strP, 13);
}

// ── Item stats never leak between loadouts ───────────────────────────────────
console.log("\n=== purity ===");
{
  const hat = data.itemIndex.get(1004808);
  const before = JSON.stringify(hat.stats);
  resolveLoadout({ hat: { itemId: hat.id, stars: 22 } }, data);
  resolveLoadout({ hat: { itemId: hat.id, stars: 5 } }, data);
  eq("source item not mutated", JSON.stringify(hat.stats), before);
}

// ── Equipment window layout ──────────────────────────────────────────────────
console.log("\n=== equip window layout ===");
{
  const slotKeys = new Set(LOADOUT_SLOTS.map((s) => s.key));
  const seenKeys = new Set();
  const seenPositions = new Set();
  let offGrid = 0;
  let outOfBounds = 0;
  let unknownKey = 0;
  let duplicateKey = 0;
  let duplicatePos = 0;

  for (const slot of EQUIP_SLOT_LAYOUT) {
    // Positions come from WZ origins and sit on a 45px grid starting at (15, 39).
    if ((slot.x - 15) % 45 !== 0 || (slot.y - 39) % 45 !== 0) offGrid += 1;
    if (
      slot.x < 0 ||
      slot.y < 0 ||
      slot.x + SLOT_SIZE > WINDOW_WIDTH ||
      slot.y + SLOT_SIZE > WINDOW_HEIGHT
    )
      outOfBounds += 1;

    if (slot.slotKey) {
      if (!slotKeys.has(slot.slotKey)) unknownKey += 1;
      if (seenKeys.has(slot.slotKey)) duplicateKey += 1;
      seenKeys.add(slot.slotKey);
    }

    const pos = `${slot.x},${slot.y}`;
    if (seenPositions.has(pos)) duplicatePos += 1;
    seenPositions.add(pos);
  }

  eq("all slots on the 45px grid", offGrid, 0);
  eq("all slots inside the window", outOfBounds, 0);
  eq("every slotKey is a real loadout slot", unknownKey, 0);
  eq("no slotKey used twice", duplicateKey, 0);
  eq("no two slots share a position", duplicatePos, 0);

  // Emblem is weapon-category and must be reachable, so the picker can fill it.
  const emblem = EQUIP_SLOT_LAYOUT.find((s) => s.slotKey === "emblem");
  eq("emblem slot present", Boolean(emblem), true);

  const unmapped = LOADOUT_SLOTS.filter((s) => !seenKeys.has(s.key)).map(
    (s) => s.key,
  );
  eq("every loadout slot has a window position", unmapped, []);
}

// ── Per-item star force ranges ───────────────────────────────────────────────
console.log("\n=== star force ranges ===");
{
  const named = (name) => items.find((i) => i.name === name);

  const outranks = (slotKey, classKey, better, worse) => {
    const list = filterItemsForSlot(items, {
      slotKey,
      classKey,
      ...DEFAULT_FILTERS,
    })
      .sort(byPower(classKey))
      .map((i) => i.name);
    const a = list.indexOf(better);
    const b = list.indexOf(worse);
    eq(`${better} > ${worse}`, a !== -1 && b !== -1 && a < b, true);
  };

  // Genesis weapons are handed over at 22★ and stop there; the Destiny upgrade
  // keeps the 22 and raises the ceiling, but only on its second stage.
  const genesis = named("Genesis Sword");
  eq(
    "Genesis weapon is fixed at 22★",
    [starFloor(genesis), starCap(genesis)],
    [22, 22],
  );
  eq("a fixed-star item offers no choice", isStarForceable(genesis), false);

  const destiny = items
    .filter((i) => i.name === "Destiny Sword")
    .sort((a, b) => starCap(a) - starCap(b));
  eq("two Destiny stages", destiny.length, 2);
  eq(
    "Destiny stage 1 stops at 22★",
    [starFloor(destiny[0]), starCap(destiny[0])],
    [22, 22],
  );
  eq(
    "Destiny stage 2 reaches 25★",
    [starFloor(destiny[1]), starCap(destiny[1])],
    [22, 25],
  );

  // The three Astra secondary grades share a name and differ only in stats.
  const astra = items
    .filter((i) => i.name === "Astra Talisman")
    .sort((a, b) => a.id - b.id);
  eq(
    "three Astra grades",
    astra.map((i) => starCap(i)),
    [15, 20, 30],
  );
  eq(
    "the weakest Astra grade is the lowest cap",
    astra[0].stats.int < astra[2].stats.int,
    true,
  );

  // Astra and Princess No secondaries all carry tuc 0 and are star forced anyway.
  const princessNo = named("Princess No's Floral Jewel");
  eq(
    "secondaries are exempt from the no-upgrade-slots rule",
    [princessNo.tuc, starCap(princessNo)],
    [0, 30],
  );

  const redBeryl = named("Red Beryl Pendant");
  eq(
    "Red Beryl is granted at 20★",
    [starFloor(redBeryl), starCap(redBeryl)],
    [20, 20],
  );

  for (const [name, slot] of [
    ["Genesis Badge", "Ba"],
    ["Immortal Legacy", "Me"],
    ["Mitra's Rage: Warrior", "Em"],
    ["Inverse Codex", "Po"],
  ]) {
    const item = named(name);
    eq(`${slot} cannot be star forced (${name})`, starCap(item), 0);
  }

  // Nothing outside the curated exceptions may lose its level-table ceiling.
  const wrongCap = items.filter(
    (i) =>
      i.starMax === undefined &&
      starCap(i) !== maxStars(i.reqLevel, Boolean(i.superior)),
  );
  eq("the level table still governs everything else", wrongCap.length, 0);

  // Ordering: an item you can star must not be beaten by one you cannot, on the
  // strength of base stats it only has because it is unenhanceable.
  // The two star-forceable badges are the two best badges, by a distance: 22★ is
  // +145 All Stat and no other badge can be enhanced at all.
  outranks("badge", "all", "Sengoku Hakase Badge", "Genesis Badge");
  outranks("badge", "all", "Ghost Ship Exorcist", "Shackles of Resentment");
  outranks("weapon", "warrior", "Genesis Sword", "Sealed Genesis Sword");
  outranks(
    "secondary",
    "magician",
    "Astra Talisman",
    "Princess No's Flaming Book",
  );
}

// ── Preset gear ──────────────────────────────────────────────────────────────
console.log("\n=== preset gear (Red Beryl) ===");
{
  const redBeryl = items.find((i) => i.name === "Red Beryl Earrings");
  const ordinary = items.find((i) => i.name === "Superior Gollux Earrings");

  eq("ordinary gear has no preset", itemPreset(ordinary, "warrior"), null);
  eq(
    "no preset without a main stat to key it to",
    itemPreset(redBeryl, "all"),
    null,
  );

  const warrior = configForItem(redBeryl, "warrior");
  eq("granted at 20★", warrior.stars, 20);
  eq(
    "Unique 10% then two epic 7% main stat lines",
    warrior.potentials.map((p) => p.optionId),
    [30041, 20041, 20041],
  );
  eq("four tier-5 bonus stat lines", warrior.flames, [
    { line: "str", tier: 5 },
    { line: "strDex", tier: 5 },
    { line: "allStat", tier: 5 },
    { line: "att", tier: 5 },
  ]);

  const magician = configForItem(redBeryl, "magician");
  eq(
    "a magician gets INT and magic attack",
    magician.flames.map((f) => f.line),
    ["int", "intLuk", "allStat", "matt"],
  );
  eq(
    "and INT potential lines",
    magician.potentials.map((p) => p.optionId),
    [30043, 20043, 20043],
  );

  // The preset must actually resolve, not just be recorded.
  const stats = flattenStats(
    resolveLoadout({ earrings: configForItem(redBeryl, "warrior") }, data)
      .stats,
  );
  eq("the preset potential reaches the stat block", stats.strP, 24);
  eq("and the preset bonus stats do too", stats.allStatP, 5);

  // Swapping gear keeps what was already entered, but never an unreachable star.
  const kept = configForItem(ordinary, "warrior", {
    stars: 17,
    flames: [{ line: "str", tier: 7 }],
  });
  eq("a swap keeps the stars", kept.stars, 17);
  eq("a swap keeps the flames", kept.flames.length, 1);
  const clamped = configForItem(
    items.find((i) => i.name === "Genesis Sword"),
    "warrior",
    { stars: 30 },
  );
  eq("stars are clamped into the new item’s range", clamped.stars, 22);
}

// ── Exceptional Enhancement ──────────────────────────────────────────────────
console.log("\n=== exceptional enhancement ===");
{
  const withHammers = items.filter((i) => i.exceptional);
  eq("six items take an Exceptional Hammer", withHammers.length, 6);
  eq(
    "every one of them says how many",
    withHammers.every((i) => exceptionalSlots(i) > 0),
    true,
  );

  // Original Sin of Pride is the one whose hammer does not name it in `req`; it
  // gets the Face Accessory block off the slot, which is what the hammer's own
  // description says.
  const pride = items.find((i) => i.name === "Original Sin of Pride");
  const berserked = items.find((i) => i.name === "Berserked");
  eq(
    "the slot fallback reached Original Sin of Pride",
    pride.exceptional,
    berserked.exceptional,
  );
  eq("and it takes three hammers", exceptionalSlots(pride), 3);

  const medal = items.find((i) => i.name === "Immortal Legacy");
  eq("one hammer", exceptionalGains(medal, 1), {
    matt: 15,
    att: 15,
    str: 20,
    dex: 20,
    int: 20,
    luk: 20,
    hp: 1000,
    mp: 1000,
  });
  eq("three hammers multiply", exceptionalGains(medal, 3).att, 45);
  eq("a fourth is clamped away", exceptionalGains(medal, 4).att, 45);
  eq("none is nothing", exceptionalGains(medal, 0), null);
  eq("ordinary gear takes none", exceptionalGains(berserked, 1).att, 10);

  const before = flattenStats(
    resolveLoadout({ medal: { itemId: medal.id } }, data).stats,
  );
  const after = flattenStats(
    resolveLoadout({ medal: { itemId: medal.id, exceptional: 3 } }, data).stats,
  );
  eq("hammers reach the loadout", after.att - before.att, 45);
  eq("and the stat with them", after.str - before.str, 60);
}

// ── Badges ───────────────────────────────────────────────────────────────────
console.log("\n=== badges ===");
{
  const badges = items.filter((i) => i.slot === "Ba");
  const starrable = badges.filter((i) => starCap(i) > 0);
  eq(
    "exactly two badges can be star forced",
    starrable.map((i) => i.name).sort(),
    ["Ghost Ship Exorcist", "Sengoku Hakase Badge"],
  );
  eq(
    "both cap at 22",
    starrable.map((i) => starCap(i)),
    [22, 22],
  );
  eq(
    "and only those two take potential",
    badges
      .filter((i) => !i.noPotential)
      .map((i) => i.name)
      .sort(),
    ["Ghost Ship Exorcist", "Sengoku Hakase Badge"],
  );

  // The badge table is All Stats and nothing else.
  const hakase = items.find((i) => i.name === "Sengoku Hakase Badge");
  const at22 = flattenStats(
    resolveLoadout({ badge: { itemId: hakase.id, stars: 22 } }, data).stats,
  );
  const base = flattenStats(
    resolveLoadout({ badge: { itemId: hakase.id } }, data).stats,
  );
  // Level 160, so the 16-22 rows are worth 13 each on top of the 40 from 1-15.
  eq("22★ is +131 all stat", at22.str - base.str, 5 * 2 + 10 * 3 + 7 * 13);
  eq("and no attack", (at22.att ?? 0) - (base.att ?? 0), 0);
  eq("and no Max HP", (at22.hp ?? 0) - (base.hp ?? 0), 0);
}

// ── Flame lines resolve against real items ───────────────────────────────────
console.log("\n=== flames on real items ===");
{
  const hat = items.find((i) => i.name === "Arcane Umbra Knight Hat");
  const weapon = items.find((i) => i.name === "Arcane Umbra Whispershot");

  // The bug this was reported as: attack on an accessory read 1 at every tier,
  // because it was being scaled off a base attack of 1.
  const earrings = items.find((i) => i.name === "Superior Gollux Earrings");
  eq(
    "accessory attack flames are flat, not a share of base attack",
    [1, 4, 7].map(
      (t) => flameLineValue("att", t, flameContext(earrings))?.value,
    ),
    [1, 4, 7],
  );
  eq(
    "and the same on a hat with no attack at all",
    [7].map((t) => flameLineValue("att", t, flameContext(hat))?.value),
    [7],
  );

  const flamed = flattenStats(
    resolveItem(
      hat,
      {
        flames: [
          { line: "str", tier: 7 },
          { line: "att", tier: 7 },
        ],
      },
      data.lineIndex,
    ),
  );
  const plain = flattenStats(resolveItem(hat, {}, data.lineIndex));
  eq("a tier-7 STR flame on a lv200 hat", flamed.str - plain.str, 77);
  eq("a tier-7 attack flame on it is 7", flamed.att - plain.att, 7);

  // On a weapon the two curves differ, and which one applies is read off the
  // item's own boss-drop flag rather than picked by hand.
  eq("a boss weapon is flame advantaged", isFlameAdvantaged(weapon), true);

  const advantaged = flameContext(weapon);
  const ordinary = flameContext(weapon, { advantaged: false });
  eq(
    "the two curves disagree at tier 5",
    flameLineValue("att", 5, advantaged).value ===
      flameLineValue("att", 5, ordinary).value,
    false,
  );
  eq(
    "the best roll is a tier-7 advantaged flame",
    flameLineValue("att", 7, advantaged).value >
      flameLineValue("att", 5, ordinary).value,
    true,
  );
  eq(
    "an ordinary weapon cannot roll tier 7",
    flameLineValue("att", 7, ordinary),
    null,
  );
  eq(
    "an advantaged weapon cannot roll tier 2",
    flameLineValue("att", 2, advantaged),
    null,
  );

  // The override is what the config carries, so the resolved stats follow it.
  // At a tier both curves reach the *ordinary* one is worth more - the advantage
  // is the three tiers above it that only the advantaged curve can roll.
  const asAdvantaged = flattenStats(
    resolveItem(
      weapon,
      {
        flames: [{ line: "att", tier: 5 }],
      },
      data.lineIndex,
    ),
  );
  const asOrdinary = flattenStats(
    resolveItem(
      weapon,
      {
        advantaged: false,
        flames: [{ line: "att", tier: 5 }],
      },
      data.lineIndex,
    ),
  );
  eq(
    "the advantage override changes the resolved attack",
    asOrdinary.att > asAdvantaged.att,
    true,
  );

  // Saved loadouts still name the retired lines.
  eq(
    "attBoss migrates onto att",
    migrateFlameLines([{ line: "attBoss", tier: 7 }]),
    [{ line: "att", tier: 7 }],
  );
  eq(
    "a migration collision keeps one line",
    migrateFlameLines([
      { line: "att", tier: 4 },
      { line: "attBoss", tier: 7 },
    ]),
    [{ line: "att", tier: 4 }],
  );
  eq(
    "a line that never moved is left alone",
    migrateFlameLines([{ line: "def", tier: 7 }]),
    [{ line: "def", tier: 7 }],
  );

  // Lines the item cannot roll never appear.
  eq(
    "no boss damage flame on a hat",
    flameLinesFor(hat).includes("boss"),
    false,
  );
  eq(
    "no speed flame on a weapon",
    flameLinesFor(weapon).includes("speed"),
    false,
  );
}

// ── Potential descriptions resolve for the whole dataset ─────────────────────
console.log("\n=== potential text ===");
{
  // Every line the picker can offer must come out with its number filled in. A
  // line the picker drops (nothing at this level, or nothing the diff shows) is
  // not required to resolve, because it is never rendered.
  const unresolved = [];
  for (const line of potentials) {
    for (const levelIndex of [1, 5, 10, 15, 20, 25]) {
      if (isInertPotential(line, levelIndex)) continue;
      if (!potentialTextIsComplete(line, levelIndex)) {
        unresolved.push(`${line.id} @${levelIndex}: ${line.desc}`);
      }
    }
  }
  eq("every offered line resolves its tokens", unresolved.slice(0, 5), []);

  const byId = (id) => potentials.find((p) => p.id === id);
  // The same line, at two item levels: the value comes from the tier table, which
  // is why the raw `desc` cannot be shown on its own.
  eq(
    "a flat stat line reads as a number",
    [10, 20].map((li) => describePotential(byId(40001), li)),
    ["STR: +18", "STR: +19"],
  );
  // `incDAMr` is the damage key, but this line resolves it to boss damage -
  // positional matching is what gets the value onto the page.
  eq(
    "boss damage resolves despite the token naming damage",
    /^Boss Damage \+\d+%$/.test(describePotential(byId(40601), 20)),
    true,
  );
  // Defensive lines stay in the list - someone's item really did roll one, and
  // the editor has to be able to say so. It is the *display* of defence that is
  // suppressed, in the tooltip and the diff, not the ability to enter it.
  eq(
    "a defence line is still offered",
    isInertPotential(byId(40013), 20),
    false,
  );
  // A line whose tier table does not reach this level grants nothing, and those
  // are the only ones dropped.
  eq(
    "a line with no row at this level is dropped",
    isInertPotential(byId(70083), 1),
    true,
  );

  const legendary = potentials.filter(
    (p) => p.kind === "regular" && p.grade === 4,
  );
  const offered = potentialOptions(legendary, 20);
  eq(
    "legendary lines deduplicate",
    offered.length < legendary.length && offered.length > 0,
    true,
  );
  eq(
    "and no two read the same",
    new Set(offered.map((o) => o.label)).size,
    offered.length,
  );
}

// ── The set panel's view of a set ────────────────────────────────────────────
console.log("\n=== set progress ===");
{
  const pitched = sets.find((s) => s.name === "Pitched Boss Set");
  const belt = items.find((i) => i.name === "Dreamy Belt");
  const badge = items.find((i) => i.name === "Genesis Badge");

  // Nineteen member ids, ten pieces: five branch emblems are one emblem, four
  // coloured spellbooks are one pocket item, and the Black Heart is in twice.
  const empty = setProgress(pitched, {}, data.itemIndex);
  eq(
    "one-per-slot members collapse to the piece count",
    [pitched.members.length, empty.total],
    [19, 10],
  );
  eq("and nothing is worn yet", empty.pieces, 0);
  eq(
    "a slot that holds one names its alternatives",
    empty.groups.find((g) => g.label === "Emblem").options.length,
    5,
  );

  // The regression: a set with two rings has two ring *pieces*, because a
  // character has four ring slots to put them in.
  const brilliant = sets.find((s) => s.name === "Brilliant Boss Set");
  const shining = setProgress(brilliant, {}, data.itemIndex);
  eq(
    "two rings in one set are two pieces, not one",
    shining.groups.filter((g) => g.label === "Ring").map((g) => g.options[0]),
    ["Whisper of the Source", "Blissful Nightmare"],
  );
  eq("so the set counts five", shining.total, 5);

  // And a set whose weapons are split across two islots still has one weapon:
  // AbsoLab lists eleven one-handers under Wp and three two-handers under WpSi.
  const abso = sets.find((s) => s.name === "AbsoLab Set (Warrior)");
  const absoProgress = setProgress(abso, {}, data.itemIndex);
  eq(
    "one-handers and two-handers are the one weapon",
    absoProgress.groups.filter((g) => g.label === "Weapon").length,
    1,
  );
  eq("and the set counts seven", absoProgress.total, 7);

  // No set may print a threshold its own header says is out of reach.
  const all = sets.map((s) => setProgress(s, {}, data.itemIndex));
  const unreachable = all
    .filter((p) => p.thresholds.length && p.total < p.thresholds.at(-1).at)
    .map((p) => `${p.name}: ${p.total} of ${p.thresholds.at(-1).at}`);
  eq("no set lists a threshold it has too few pieces for", unreachable, []);

  // Where the member list falls short it is because the missing piece is not
  // equipment - a Sengoku totem, the Alchemist Set's potions - so the panel says
  // how many it could not name rather than quietly listing a short set.
  eq(
    "the Pitched set names every piece it counts",
    [empty.listed, empty.total],
    [10, 10],
  );
  const gap = all.find((p) => p.name === "Amaterasu Set");
  eq(
    "a set with a piece outside the equipment data says so",
    [gap.listed, gap.total],
    [8, 9],
  );

  const worn = setProgress(
    pitched,
    { belt: { itemId: belt.id }, badge: { itemId: badge.id } },
    data.itemIndex,
  );
  eq("wearing two counts two", worn.pieces, 2);
  eq(
    "and names them on their own rows",
    worn.groups
      .filter((g) => g.equipped)
      .map((g) => g.equipped)
      .sort(),
    ["Dreamy Belt", "Genesis Badge"],
  );
  eq(
    "thresholds at or below the count are active",
    worn.thresholds.filter((t) => t.active).map((t) => t.at),
    [2],
  );
  eq("and the rest are listed but not", worn.thresholds.length > 1, true);

  // The count has to agree with the one the effects are actually resolved from,
  // or the panel would light a threshold the diff has not granted.
  const resolved = resolveLoadout(
    { belt: { itemId: belt.id }, badge: { itemId: badge.id } },
    data,
  );
  eq(
    "the panel count matches the engine",
    resolved.sets.find((s) => s.setId === pitched.id)?.pieces,
    worn.pieces,
  );
}

console.log(`\n${fails === 0 ? "All checks passed." : `${fails} FAILURES`}`);
process.exit(fails === 0 ? 0 : 1);
