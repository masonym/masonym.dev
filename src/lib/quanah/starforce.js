// Quanah Star Force: the same success / destroy rates as everywhere else in GMS (the rate table,
// default Star Catch bonus and boom recovery stars come from src/app/star-force/utils.js), but
// paid in Quanah Crystals (equipment) or Mapae Fragments (the Inspector's Mapae) instead of mesos.
//
// - Sunny Sunday's 30% destruction reduction applies (to 21★, like the meso version).
// - Its 30% cost reduction does NOT apply to crystals or fragments.
// - Quanah gear can't be equipped at 23★ or higher (UI/GL_QuanahBurning.img notice), so 22★ is
//   the useful cap, but the Star Force missions go to 30★, so targets up to 30 are allowed.
//
// The per-attempt cost is not in the client or the hotfix Data.wz (it is server side). The
// defaults below are community-reported (Altord/QuanahWorldUtilities, Nov 2026) and the page lets
// you overwrite every one of them.
import {
  evaluateStrategy,
  getEnhanceModeInfo,
  getRecoveredStars,
  simulateStarForceFast,
} from "../../app/star-force/utils.js";

export const MAX_STAR = 30;
export const EQUIP_CAP = 22;

// Quanah Crystals per attempt, by current star.
export function defaultCrystalCost(star) {
  if (star < 15) return 25;
  if (star < 20) return 50;
  if (star === 20) return 60;
  if (star === 21) return 70;
  return 90;
}

// Mapae Fragments per attempt. Not reported anywhere yet: 1 is a placeholder so the page still
// shows expected attempts until someone enters the real numbers.
export const defaultFragmentCost = () => 1;

export const ITEMS = {
  equip: {
    id: "equip",
    name: "Equipment",
    currency: "Quanah Crystals",
    short: "crystals",
    icon: "/quanah/items/2833794.png",
    defaultCost: defaultCrystalCost,
  },
  mapae: {
    id: "mapae",
    name: "Inspector's Mapae",
    currency: "Mapae Fragments",
    short: "fragments",
    icon: "/quanah/items/2833663.png",
    itemIcon: "/quanah/items/1182311.png",
    defaultCost: defaultFragmentCost,
  },
};

// Per-star table in the shape src/app/star-force/utils.js's solver and simulator take.
// `costs[star]` overrides the item's default cost; `boomReduction` is Sunny Sunday's -30%.
export function buildQuanahTable({ item, costs = {}, boomReduction = false }) {
  const table = new Array(MAX_STAR + 1);
  for (let star = 0; star <= MAX_STAR; star++) {
    const info = getEnhanceModeInfo(star, 1);
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
      cost: costs[star] ?? item.defaultCost(star),
      successStars: 1,
      // getRecoveredStars falls back to 12 for stars that can't boom, which would point past
      // the end of a short (e.g. one-star) solve
      recoverStar: pBoom > 0 ? getRecoveredStars(star) : star,
    };
  }
  return table;
}

// Expected cost (in the item's currency, with each boom also costing `boomCost`), attempts and
// booms from `from` to `to`, exactly from the Markov chain.
export function expected(table, from, to, boomCost = 0) {
  const cost = evaluateStrategy(table, from, to);
  const attempts = evaluateStrategy(
    table.map((e) => ({ ...e, cost: 1 })),
    from,
    to,
  );
  return {
    cost: cost.expectedCost + cost.expectedBooms * boomCost,
    attempts: attempts.expectedCost,
    booms: cost.expectedBooms,
  };
}

const pick = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];

// Monte Carlo spread of the total cost: the median and the unlucky tail.
export function simulate(table, from, to, boomCost = 0, runs = 10000) {
  const costs = new Float64Array(runs);
  const booms = new Float64Array(runs);
  for (let i = 0; i < runs; i++) {
    const r = simulateStarForceFast(table, from, to);
    costs[i] = r.totalCost + r.booms * boomCost;
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
