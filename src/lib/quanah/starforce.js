// Quanah Star Force: the same success / destroy rates as everywhere else in GMS (the rate table,
// default Star Catch bonus and boom recovery stars come from src/app/star-force/utils.js), but
// paid in Quanah Crystals (equipment) or Mapae Fragments (the Inspector's Mapae) instead of mesos.
//
// - Sunny Sunday's 30% destruction reduction applies (to 21★, like the meso version).
// - Its 30% cost reduction does NOT apply to crystals or fragments.
// - Enhancement Modes (15★-21★) work as in the meso version: the same success / destroy rates per
//   mode (ENHANCE_MODE in src/app/star-force/utils.js) and the same cost multipliers, applied to
//   the crystal or fragment cost and rounded down (e.g. Mode 2 at 16★, ×1.5, on a 43-crystal
//   attempt is floor(64.5) = 64).
// - Equipment goes to 30★. Quanah's own gear can be starred past 22★ and still equipped; the
//   "23-star or higher equipment cannot be equipped" rule (UI/GL_QuanahBurning.img notice) is for
//   items that leap back to regular worlds afterwards (pitched boss gear, Eternal, ...).
// - The Inspector's Mapae is capped at 22★ (observed in game).
//
// The per-attempt cost is not in the client or the hotfix Data.wz (it is server side). The crystal
// formula below is fitted to costs read off the enhancement window in game (Nov 2026), and the
// page lets you overwrite every cost.
import {
  ENHANCE_MODE,
  ENHANCE_MODE_STARS,
  enhanceFrontier,
  evaluateStrategy,
  getEnhanceModeInfo,
  getRecoveredStars,
  optimizeModesOverActions,
  simulateStarForceFast,
} from "../../app/star-force/utils.js";

export { ENHANCE_MODE_STARS };
export const MODES = [1, 2, 3, 4];

export const MAX_STAR = 30;
export const EQUIP_CAP = 22; // the most a leap-out item can have and still be equipped in Quanah
export const MAPAE_MAX_STAR = 22;

// Quanah Crystals per attempt, by current star and item level.
//
// From 15★: round(level³ × (star+1)^2.7 / 200,000,000). This is the meso formula's shape
// (src/app/star-force/utils.js calculateMesoCost) with one divisor for every star instead of the
// meso table's per-star divisors. It reproduces all 15 observed costs (level 160: 16->17 = 43,
// 18 = 58, 19 = 67, 21 = 86; level 200: 17 = 98, 18 = 113, 19 = 130, 20 = 149, 21 = 169,
// 24 = 238). The level is rounded down to a multiple of 10 like the meso formula; only levels 160
// and 200 have been checked, so that part is an assumption.
//
// Below 15★ the formula is far too low (level 160 12->13 would be 21, but costs 30). The observed
// costs there are flat tiers: 10 for 0-4★, 20 for 5-9★, 30 for 10-14★ (level 160: 3 = 10,
// 7 = 20, 8 = 20, 12 = 30, 14 = 30). Only seen on a level 160 item; whether they change with
// level is unknown. At low levels this makes 15★ cheaper than 14★ (level 140: 24 vs 30), which
// may mean the tiers or formula differ there.
export const crystalLevel = (level) => Math.floor(level / 10) * 10;

export function defaultCrystalCost(star, level) {
  if (star < 15) return 10 * (Math.floor(star / 5) + 1);
  return Math.round((crystalLevel(level) ** 3 * (star + 1) ** 2.7) / 2e8);
}

// Mapae Fragments per attempt on the Inspector's Mapae (1182311, a level 160 badge).
//
// From 15★: round(level³ × (star+1)^2.7 / 2,000,000,000), the crystal formula with a divisor ten
// times larger. It reproduces every observed cost (15->16 = 4, 17 = 5, 18 = 6, 19 = 7, 20 = 8,
// 21 = 9) and gives 4 for 16->17, which wasn't read. Below 15★ is a guess: the crystal tiers
// divided by ten (1 / 2 / 3).
export const MAPAE_LEVEL = 160;

export function defaultFragmentCost(star, level = MAPAE_LEVEL) {
  if (star < 15) return Math.floor(star / 5) + 1;
  return Math.round((crystalLevel(level) ** 3 * (star + 1) ** 2.7) / 2e9);
}

// Restoring a destroyed Mapae costs 100 Quanah Crystals (observed in game), paid in a different
// currency from the fragments, so it's reported separately.
export const MAPAE_RESTORE_CRYSTALS = 100;

export const ITEMS = {
  equip: {
    id: "equip",
    name: "Equipment",
    currency: "Quanah Crystals",
    short: "crystals",
    icon: "/quanah/items/2833794.png",
    maxStar: MAX_STAR,
    defaultCost: defaultCrystalCost,
  },
  mapae: {
    id: "mapae",
    name: "Inspector's Mapae",
    currency: "Mapae Fragments",
    short: "fragments",
    icon: "/quanah/items/2833663.png",
    itemIcon: "/quanah/items/1182311.png",
    maxStar: MAPAE_MAX_STAR,
    defaultCost: defaultFragmentCost,
    restoreCrystals: MAPAE_RESTORE_CRYSTALS,
  },
};

// Per-star table in the shape src/app/star-force/utils.js's solver and simulator take.
// `costs[star]` overrides the item's default (Mode 1) cost; `modes[star]` is the Enhancement Mode
// (1-4) for 15★-21★, which multiplies that cost (rounded down) and changes the rates;
// `boomReduction` is Sunny Sunday's -30%, applied after the mode like the meso version.
export function buildQuanahTable({
  item,
  level = 200,
  costs = {},
  modes = {},
  boomReduction = false,
}) {
  const table = new Array(MAX_STAR + 1);
  for (let star = 0; star <= MAX_STAR; star++) {
    const mode = ENHANCE_MODE[star] ? modes[star] || 1 : 1;
    const info = getEnhanceModeInfo(star, mode);
    const baseCost = costs[star] ?? item.defaultCost(star, level);
    let pBoom = info.boom;
    let pMaintain = info.maintain;
    if (boomReduction && star <= 21 && pBoom > 0) {
      pMaintain += pBoom * 0.3;
      pBoom *= 0.7;
    }
    table[star] = {
      pSuccess: info.success,
      pCumNoChange: info.success + pMaintain,
      pBoom,
      cost: Math.floor(baseCost * info.mult),
      baseCost,
      mode,
      mult: info.mult,
      successStars: 1,
      // getRecoveredStars falls back to 12 for stars that can't boom, which would point past
      // the end of a short (e.g. one-star) solve
      recoverStar: pBoom > 0 ? getRecoveredStars(star) : star,
    };
  }
  return table;
}

// Expected cost (in the item's currency), attempts and booms from `from` to `to`, exactly from the
// Markov chain.
export function expected(table, from, to) {
  const cost = evaluateStrategy(table, from, to);
  const attempts = evaluateStrategy(
    table.map((e) => ({ ...e, cost: 1 })),
    from,
    to,
  );
  return {
    cost: cost.expectedCost,
    attempts: attempts.expectedCost,
    booms: cost.expectedBooms,
  };
}

// Enhancement Mode strategies: every mode selection that is an efficient trade between expected
// cost (in the item's currency) and expected booms, cheapest first, each with the [spareFrom,
// spareTo) range of what a boom is worth to you, in that currency, for it to be the best pick.
// The same search as the meso page (enhanceFrontier in src/app/star-force/utils.js).
//
// The first point is the cheapest on average once the climb back after a boom is counted, so it
// is the right pick whenever a boom costs nothing else: restoring Quanah equipment is free, and
// items like the Inspector's Mapae or Libae gear have spares to hand. The Mapae's 100-crystal
// restore is in another currency and is left out of the search.
export function modeFrontier({ item, level, costs, boomReduction, from, to }) {
  const allIn = (m) => Object.fromEntries(ENHANCE_MODE_STARS.map((s) => [s, m]));
  const tables = MODES.map((m) =>
    buildQuanahTable({ item, level, costs, boomReduction, modes: allIn(m) }),
  );
  const actions = [];
  for (let s = 0; s < to; s++) {
    const options = ENHANCE_MODE_STARS.includes(s) ? tables : tables.slice(0, 1);
    actions.push(
      options.map((t) => ({ ...t[s], pMaintain: t[s].pCumNoChange - t[s].pSuccess })),
    );
  }
  return enhanceFrontier({
    startingStar: from,
    targetStar: to,
    optimize: (lambda) => optimizeModesOverActions(actions, from, to, lambda).modes,
    evaluate: (modes) =>
      evaluateStrategy(
        buildQuanahTable({ item, level, costs, boomReduction, modes }),
        from,
        to,
      ),
  });
}

const pick = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];

// Monte Carlo spread of the total cost: the median and the unlucky tail.
export function simulate(table, from, to, runs = 10000) {
  const costs = new Float64Array(runs);
  const booms = new Float64Array(runs);
  for (let i = 0; i < runs; i++) {
    const r = simulateStarForceFast(table, from, to);
    costs[i] = r.totalCost;
    booms[i] = r.booms;
  }
  costs.sort();
  booms.sort();
  let noBoom = 0;
  for (let i = 0; i < runs; i++) if (booms[i] === 0) noBoom++;
  return {
    p50: pick(costs, 0.5),
    p75: pick(costs, 0.75),
    p90: pick(costs, 0.9),
    p99: pick(costs, 0.99),
    noBoomChance: noBoom / runs,
  };
}
