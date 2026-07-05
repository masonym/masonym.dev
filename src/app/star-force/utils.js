// Constants for star force probabilities
export const STAR_FORCE_RATES = {
  0: { success: 0.95, maintain: 0.05, decrease: 0, destroy: 0 },
  1: { success: 0.9, maintain: 0.1, decrease: 0, destroy: 0 },
  2: { success: 0.85, maintain: 0.15, decrease: 0, destroy: 0 },
  3: { success: 0.85, maintain: 0.15, decrease: 0, destroy: 0 },
  4: { success: 0.8, maintain: 0.2, decrease: 0, destroy: 0 },
  5: { success: 0.75, maintain: 0.25, decrease: 0, destroy: 0 },
  6: { success: 0.7, maintain: 0.3, decrease: 0, destroy: 0 },
  7: { success: 0.65, maintain: 0.35, decrease: 0, destroy: 0 },
  8: { success: 0.6, maintain: 0.4, decrease: 0, destroy: 0 },
  9: { success: 0.55, maintain: 0.45, decrease: 0, destroy: 0 },
  10: { success: 0.5, maintain: 0.5, decrease: 0, destroy: 0 },
  11: { success: 0.45, maintain: 0.55, decrease: 0, destroy: 0 },
  12: { success: 0.4, maintain: 0.6, decrease: 0, destroy: 0 },
  13: { success: 0.35, maintain: 0.65, decrease: 0, destroy: 0 },
  14: { success: 0.3, maintain: 0.7, decrease: 0, destroy: 0 },
  15: { success: 0.3, maintain: 0.679, decrease: 0, destroy: 0.021 },
  16: { success: 0.3, maintain: 0.679, decrease: 0, destroy: 0.021 },
  17: { success: 0.15, maintain: 0.782, decrease: 0, destroy: 0.068 },
  18: { success: 0.15, maintain: 0.782, decrease: 0, destroy: 0.068 },
  19: { success: 0.15, maintain: 0.765, decrease: 0, destroy: 0.085 },
  20: { success: 0.3, maintain: 0.595, decrease: 0, destroy: 0.105 },
  21: { success: 0.15, maintain: 0.7225, decrease: 0, destroy: 0.1275 },
  22: { success: 0.15, maintain: 0.68, decrease: 0, destroy: 0.17 },
  23: { success: 0.1, maintain: 0.72, decrease: 0, destroy: 0.18 },
  24: { success: 0.1, maintain: 0.72, decrease: 0, destroy: 0.18 },
  25: { success: 0.1, maintain: 0.72, decrease: 0, destroy: 0.18 },
  26: { success: 0.07, maintain: 0.744, decrease: 0, destroy: 0.186 },
  27: { success: 0.05, maintain: 0.76, decrease: 0, destroy: 0.19 },
  28: { success: 0.03, maintain: 0.776, decrease: 0, destroy: 0.194 },
  29: { success: 0.01, maintain: 0.792, decrease: 0, destroy: 0.198 },
  30: { success: 0.01, maintain: 0.792, decrease: 0, destroy: 0.198 },
};

// Enhancement Mode — the newer GMS star-force system (replaces the Safeguard
// model in-game for stars 15→21; not available on Superior equipment). A 1–4
// slider trades higher meso cost for a lower destroy chance. Modes do not
// exist below 15★ (no boom) or at 22★+.
//
// Each entry, indexed by (mode - 1), carries:
//   mult    — cost multiplier applied on top of the unchanged calculateMesoCost() formula
//   success — success chance (the in-game displayed rate, before Star Catching)
//   boom    — destroy chance; maintain = 1 - success - boom
//
// Mode 1 reproduces the vanilla STAR_FORCE_RATES and base cost exactly
// (verified against in-game values at item levels 160 and 200). Modes 2–4 are
// measured. Cost multipliers cluster into two tiers: 1/1.5/2.5/3 (15–17) and
// 1/2/3.5/6.5 (18–21). Rates are stored verbatim — the per-mode reductions are
// not a clean closed form, so a lookup table is the accurate representation.
export const ENHANCE_MODE = {
  15: [
    { mult: 1, success: 0.3, boom: 0.021 },
    { mult: 1.5, success: 0.3, boom: 0.014 },
    { mult: 2.5, success: 0.3, boom: 0.007 },
    { mult: 3, success: 0.3, boom: 0 },
  ],
  16: [
    { mult: 1, success: 0.3, boom: 0.021 },
    { mult: 1.5, success: 0.3, boom: 0.014 },
    { mult: 2.5, success: 0.3, boom: 0.007 },
    { mult: 3, success: 0.3, boom: 0 },
  ],
  17: [
    { mult: 1, success: 0.15, boom: 0.068 },
    { mult: 1.5, success: 0.15, boom: 0.0425 },
    { mult: 2.5, success: 0.15, boom: 0.017 },
    { mult: 3, success: 0.15, boom: 0 },
  ],
  18: [
    { mult: 1, success: 0.15, boom: 0.068 },
    { mult: 2, success: 0.12, boom: 0.044 },
    { mult: 3.5, success: 0.1, boom: 0.018 },
    { mult: 6.5, success: 0.08, boom: 0 },
  ],
  19: [
    { mult: 1, success: 0.15, boom: 0.085 },
    { mult: 2, success: 0.12, boom: 0.0616 },
    { mult: 3.5, success: 0.1, boom: 0.036 },
    { mult: 6.5, success: 0.08, boom: 0 },
  ],
  20: [
    { mult: 1, success: 0.3, boom: 0.105 },
    { mult: 2, success: 0.25, boom: 0.075 },
    { mult: 3.5, success: 0.2, boom: 0.04 },
    { mult: 6.5, success: 0.15, boom: 0 },
  ],
  21: [
    { mult: 1, success: 0.15, boom: 0.1275 },
    { mult: 2, success: 0.12, boom: 0.088 },
    { mult: 3.5, success: 0.1, boom: 0.045 },
    { mult: 6.5, success: 0.08, boom: 0 },
  ],
};

// Stars where an Enhancement Mode choice exists, ascending.
export const ENHANCE_MODE_STARS = Object.keys(ENHANCE_MODE)
  .map(Number)
  .sort((a, b) => a - b);

// Display info for one star/mode pair. Mode 1 (or a star without modes) falls
// back to the vanilla table so the two sources can never drift apart in the UI.
export function getEnhanceModeInfo(star, mode) {
  const modes = ENHANCE_MODE[star];
  if (modes && mode >= 2) {
    const m = modes[mode - 1];
    return {
      mult: m.mult,
      success: m.success,
      boom: m.boom,
      maintain: 1 - m.success - m.boom,
    };
  }
  const base = STAR_FORCE_RATES[star];
  return {
    mult: 1,
    success: base.success,
    boom: base.destroy,
    maintain: base.maintain,
  };
}

// Get max stars based on equipment level
export function getMaxStars(equipLevel) {
  if (equipLevel == 0) return 30;
  if (equipLevel < 95) return 5;
  if (equipLevel < 108) return 8;
  if (equipLevel < 118) return 10;
  if (equipLevel < 128) return 15;
  if (equipLevel < 138) return 20;
  return 30;
}

// Calculate meso cost for a star force attempt
export function calculateMesoCost(equipLevel, currentStar) {
  let cost;
  const roundedLevel = Math.floor(equipLevel / 10) * 10;

  if (currentStar <= 9) {
    cost =
      100 *
      Math.round((Math.pow(roundedLevel, 3) * (currentStar + 1)) / 2500 + 10);
  } else {
    const divisors = {
      10: 40000,
      11: 22000,
      12: 15000,
      13: 11000,
      14: 7500,
      15: 20000,
      16: 20000,
      17: 15000,
      18: 7000,
      19: 4500,
      20: 20000,
      21: 12500,
    };
    const divisor = divisors[currentStar] || 20000;
    cost =
      100 *
      Math.round(
        (Math.pow(roundedLevel, 3) * Math.pow(currentStar + 1, 2.7)) / divisor +
          10,
      );
  }

  return cost;
}

// Apply MVP discount
export function applyMVPDiscount(cost, mvpType, currentStar) {
  if (currentStar >= 17) return cost;

  const discounts = {
    silver: 0.03,
    gold: 0.05,
    platinum: 0.1,
    diamond: 0.1,
    red: 0.1,
    black: 0.1,
  };

  return mvpType === "none"
    ? cost
    : Math.floor(cost * (1 - discounts[mvpType]));
}

// Apply event discount
export function applyEventDiscount(cost, eventTypes) {
  if (eventTypes.includes("thirtyOff")) {
    return Math.floor(cost * 0.7);
  }
  return cost;
}

// Get recovered stars from Equipment Traces
export function getRecoveredStars(destructionLevel) {
  if (destructionLevel >= 15 && destructionLevel <= 19) return 12;
  if (destructionLevel === 20) return 15;
  if (destructionLevel >= 21 && destructionLevel <= 22) return 17;
  if (destructionLevel >= 23 && destructionLevel <= 25) return 19;
  if (destructionLevel >= 26 && destructionLevel <= 30) return 20;
  return 12; // Default fallback
}

// Final probabilities and cost for a single attempt at `star` under `mode`
// with all modifiers applied. The one shared source of attempt math for the
// simulator table, the strategy evaluator, and the optimizer.
//
// Mode cost multiplier is applied to the base formula first, then MVP and
// event discounts on the multiplied amount (the mode premium is part of the
// enhancement cost itself, unlike the old Safeguard surcharge).
function computeAttempt(level, star, mode, { starCatch, eventTypes, mvpType }) {
  const info = getEnhanceModeInfo(star, mode);
  let pSuccess = info.success;
  let pMaintain = info.maintain;
  let pBoom = info.boom;

  // Star catch: +5% multiplicative to success, redistribute remainder
  if (starCatch) {
    pSuccess = Math.min(1, info.success * 1.05);
    const remaining = 1 - pSuccess;
    const origFail = info.maintain + info.boom;
    if (origFail > 0) {
      pMaintain = remaining * (info.maintain / origFail);
      pBoom = remaining * (info.boom / origFail);
    } else {
      pMaintain = 0;
      pBoom = 0;
    }
  }

  // Destruction reduction event: 30% multiplicative cut to destroy
  if (eventTypes.includes("destructionReduction") && star <= 21 && pBoom > 0) {
    const reduction = pBoom * 0.3;
    pBoom -= reduction;
    pMaintain += reduction;
  }

  const baseCost = Math.round(calculateMesoCost(level, star) * info.mult);
  let cost = applyMVPDiscount(baseCost, mvpType, star);
  cost = applyEventDiscount(cost, eventTypes);

  const successStars = eventTypes.includes("twoStars") && star < 11 ? 2 : 1;

  return {
    pSuccess,
    pMaintain,
    pBoom,
    cost,
    successStars,
    recoverStar: getRecoveredStars(star),
  };
}

// Build a per-star lookup table of final probabilities and costs for a given
// set of settings. This is computed once before a simulation batch so the
// inner loop performs only a table lookup + one Math.random().
//
// `enhanceModes` maps star -> Enhancement Mode (1–4) for stars 15–21; missing
// or out-of-range stars use Mode 1 (vanilla rates and cost).
//
// Each entry:
//   pSuccess     - probability of advancing
//   pCumNoChange - pSuccess + P(no star change); a single random roll is
//                  classified with two comparisons against pSuccess and this
//   pBoom        - probability of being destroyed
//   cost         - total meso cost of the attempt (mode multiplier + MVP + event)
//   successStars - stars gained on success (2 under the twoStars event <11)
//   recoverStar  - star level to snap to after a boom
export function buildStarTable({
  level,
  enhanceModes = {},
  starCatchStars = [],
  eventTypes = [],
  mvpType = "none",
}) {
  const scSet = new Set(starCatchStars);

  const table = new Array(31);
  for (let star = 0; star <= 30; star++) {
    const mode = ENHANCE_MODE[star] ? enhanceModes[star] || 1 : 1;
    const a = computeAttempt(level, star, mode, {
      starCatch: scSet.has(star),
      eventTypes,
      mvpType,
    });

    table[star] = {
      pSuccess: a.pSuccess,
      pCumNoChange: a.pSuccess + a.pMaintain,
      pBoom: a.pBoom,
      cost: a.cost,
      successStars: a.successStars,
      recoverStar: a.recoverStar,
    };
  }
  return table;
}

// Fast Monte-Carlo run using a precomputed table.
//
// There is no attempt cap: every star has pSuccess > 0, so the chain is a
// positive-recurrent Markov process with a single absorbing state and
// terminates with probability 1 in finite expected time. Capping the loop
// biases downstream statistics because capped (unlucky) runs are dropped
// from the reached-target population.
export function simulateStarForceFast(table, startingStar, targetStar) {
  let currentStar = startingStar;
  let attempts = 0;
  let booms = 0;
  let totalCost = 0;

  while (currentStar < targetStar) {
    const e = table[currentStar];
    attempts++;
    totalCost += e.cost;

    const r = Math.random();
    if (r < e.pSuccess) {
      currentStar += e.successStars;
    } else if (r >= e.pCumNoChange) {
      booms++;
      currentStar = e.recoverStar;
    }
    // else: no change
  }

  return {
    success: currentStar >= targetStar,
    attempts,
    booms,
    totalCost,
  };
}

// Exact expected meso cost and expected boom count from startingStar to
// targetStar for the strategy baked into `table`, solved from the Markov
// chain directly (no simulation noise).
//
// For each star s below target:
//   V(s) = cost(s) + pSuccess*V(next) + pMaintain*V(s) + pBoom*V(recover)
// which after isolating V(s) is solved by Gauss–Seidel sweeps; booms feed
// back into lower stars (recover < s < next) so the system is cyclic but
// strictly contractive, converging geometrically.
export function evaluateStrategy(table, startingStar, targetStar) {
  if (startingStar >= targetStar) return { expectedCost: 0, expectedBooms: 0 };

  const Vc = new Float64Array(targetStar + 1);
  const Vb = new Float64Array(targetStar + 1);

  for (let iter = 0; iter < 10000; iter++) {
    let delta = 0;
    for (let s = targetStar - 1; s >= 0; s--) {
      const e = table[s];
      const pMaintain = e.pCumNoChange - e.pSuccess;
      const next = Math.min(s + e.successStars, targetStar);
      const denom = 1 - pMaintain;

      const vc =
        (e.cost + e.pSuccess * Vc[next] + e.pBoom * Vc[e.recoverStar]) / denom;
      const vb =
        (e.pSuccess * Vb[next] + e.pBoom * (1 + Vb[e.recoverStar])) / denom;

      delta = Math.max(
        delta,
        Math.abs(vc - Vc[s]) / (1 + Math.abs(vc)),
        Math.abs(vb - Vb[s]),
      );
      Vc[s] = vc;
      Vb[s] = vb;
    }
    if (delta < 1e-12) break;
  }

  return { expectedCost: Vc[startingStar], expectedBooms: Vb[startingStar] };
}

// Find the Enhancement Mode per star (15–21) that minimizes expected total
// cost to reach targetStar, where a boom is charged `spareCost` mesos on top
// of the meso spent re-climbing. spareCost = 0 minimizes pure meso cost —
// higher modes can still win there, because a boom resets to 12★ and the
// climb back is not free.
//
// This is value iteration on the enhancement Markov decision process:
//   V(s) = min over modes of (cost + pS*V(next) + pB*(spareCost + V(recover))) / (1 - pMaintain)
// Ties prefer the lower (cheaper-listed) mode.
export function optimizeEnhanceModes({
  level,
  startingStar,
  targetStar,
  starCatchStars = [],
  eventTypes = [],
  mvpType = "none",
  spareCost = 0,
}) {
  const scSet = new Set(starCatchStars);

  // Precompute the attempt entry for every star/mode pair below target.
  const actions = new Array(targetStar);
  for (let s = 0; s < targetStar; s++) {
    const modeCount = ENHANCE_MODE[s] ? 4 : 1;
    const list = new Array(modeCount);
    for (let m = 1; m <= modeCount; m++) {
      list[m - 1] = computeAttempt(level, s, m, {
        starCatch: scSet.has(s),
        eventTypes,
        mvpType,
      });
    }
    actions[s] = list;
  }

  const V = new Float64Array(targetStar + 1);
  const policy = new Array(targetStar).fill(1);

  for (let iter = 0; iter < 10000; iter++) {
    let delta = 0;
    for (let s = targetStar - 1; s >= 0; s--) {
      let best = Infinity;
      let bestMode = 1;
      const list = actions[s];
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        const next = Math.min(s + e.successStars, targetStar);
        const v =
          (e.cost +
            e.pSuccess * V[next] +
            e.pBoom * (spareCost + V[e.recoverStar])) /
          (1 - e.pMaintain);
        if (v < best) {
          best = v;
          bestMode = i + 1;
        }
      }
      delta = Math.max(delta, Math.abs(best - V[s]) / (1 + best));
      V[s] = best;
      policy[s] = bestMode;
    }
    if (delta < 1e-12) break;
  }

  const modes = {};
  for (const star of ENHANCE_MODE_STARS) {
    modes[star] = star < targetStar ? policy[star] : 1;
  }

  return { modes, expectedTotal: V[startingStar] };
}

// The Pareto frontier of Enhancement Mode strategies: every mode selection
// that is an efficient trade between expected meso cost and expected booms,
// cheapest-meso first. Each point carries [spareFrom, spareTo) — the range of
// per-boom valuations (spare price in mesos) for which it is the single best
// choice, so the frontier doubles as a "what is a spare worth to you" table.
//
// Found by parametric search on the boom valuation λ: each policy's expected
// total cost is linear in λ (cost + λ·booms), so the optimal policies form
// the lower envelope of lines. Starting from the λ=0 and λ=∞ optima, the
// crossing point of two known neighbors either yields a new better policy
// (recurse on both sides) or certifies the segment complete. This enumerates
// every frontier vertex with a handful of optimizer calls.
export function computeEnhanceFrontier({
  level,
  startingStar,
  targetStar,
  starCatchStars = [],
  eventTypes = [],
  mvpType = "none",
}) {
  if (startingStar >= targetStar) return [];

  const ctx = {
    level,
    startingStar,
    targetStar,
    starCatchStars,
    eventTypes,
    mvpType,
  };
  const keyOf = (modes) => ENHANCE_MODE_STARS.map((s) => modes[s]).join("");

  const optimizeAt = (lambda) => {
    const { modes } = optimizeEnhanceModes({ ...ctx, spareCost: lambda });
    const table = buildStarTable({
      level,
      enhanceModes: modes,
      starCatchStars,
      eventTypes,
      mvpType,
    });
    const { expectedCost, expectedBooms } = evaluateStrategy(
      table,
      startingStar,
      targetStar,
    );
    return { modes, key: keyOf(modes), expectedCost, expectedBooms };
  };

  const lo = optimizeAt(0);
  const hi = optimizeAt(1e15);
  const points = new Map([
    [lo.key, lo],
    [hi.key, hi],
  ]);

  const refine = (a, b, depth) => {
    if (depth > 24) return;
    const dBooms = a.expectedBooms - b.expectedBooms;
    if (dBooms <= 1e-9) return;
    const lambda = (b.expectedCost - a.expectedCost) / dBooms;
    const p = optimizeAt(lambda);
    if (points.has(p.key)) return;
    const vNew = p.expectedCost + lambda * p.expectedBooms;
    const vOld = a.expectedCost + lambda * a.expectedBooms;
    if (vNew >= vOld - 1e-6 * (1 + Math.abs(vOld))) return;
    points.set(p.key, p);
    refine(a, p, depth + 1);
    refine(p, b, depth + 1);
  };
  if (lo.key !== hi.key) refine(lo, hi, 0);

  // Sort by meso cost and drop dominated points (ties at unused stars can
  // produce distinct keys with identical outcomes).
  const sorted = [...points.values()].sort(
    (x, y) =>
      x.expectedCost - y.expectedCost || x.expectedBooms - y.expectedBooms,
  );
  const frontier = [];
  let minBooms = Infinity;
  for (const p of sorted) {
    if (p.expectedBooms < minBooms - 1e-9) {
      frontier.push(p);
      minBooms = p.expectedBooms;
    }
  }

  // Adjacent points cross at (Δcost / Δbooms): below that spare price the
  // cheaper point wins, above it the safer one does.
  for (let i = 0; i < frontier.length; i++) {
    const prev = frontier[i - 1];
    const next = frontier[i + 1];
    frontier[i].spareFrom = prev
      ? (frontier[i].expectedCost - prev.expectedCost) /
        (prev.expectedBooms - frontier[i].expectedBooms)
      : 0;
    frontier[i].spareTo = next
      ? (next.expectedCost - frontier[i].expectedCost) /
        (frontier[i].expectedBooms - next.expectedBooms)
      : Infinity;
  }
  return frontier;
}
