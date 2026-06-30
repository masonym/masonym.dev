// Shared scheduling engine for the Liberation calculators.
//
// It models a "base" boss configuration (what you clear right now) plus a list
// of dated "scheduled changes". Each scheduled change is an incremental delta:
// on its effective date, the listed bosses switch to a new difficulty / party
// size and STAY that way going forward until a later change overrides them.
//
// Bosses can only be killed once per weekly (or monthly) reset, so each boss
// contributes exactly one clear per reset at whatever difficulty is active for
// that reset date — you never stack two difficulties of the same boss.

// Parse a 'YYYY-MM-DD' string as UTC midnight.
export function parseUTCDate(str) {
  return new Date(str + 'T00:00:00.000Z');
}

// The 1st of the next month (monthly resets happen on the 1st, 00:00 UTC).
export function getNextMonthlyResetDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

// Generate a stable-ish unique id for a scheduled change.
export function makeChangeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `chg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) + ' (UTC)';

// Build the effective per-boss config that applies on a given date.
// Returns a map of bossId -> { difficulty, partySize }.
export function getConfigAtDate(baseSelections, changes, dateObj) {
  const config = {};
  baseSelections.forEach((s) => {
    config[s.id] = {
      difficulty: s.isCleared ? s.selectedDifficulty : 'None',
      partySize: s.partySize || 1,
    };
  });

  (changes || [])
    .filter((c) => c.date && parseUTCDate(c.date) <= dateObj)
    .sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date))
    .forEach((c) => {
      Object.entries(c.overrides || {}).forEach(([bossId, ov]) => {
        if (!ov || !ov.difficulty) return;
        config[bossId] = { difficulty: ov.difficulty, partySize: ov.partySize || 1 };
      });
    });

  return config;
}

// Compute traces produced by a single config, split into weekly / monthly bosses.
export function computeTraces(config, bossData, multiplier = 1) {
  const weeklyBosses = [];
  const monthlyBosses = [];

  bossData.forEach((boss) => {
    const cfg = config[boss.id];
    const diff = cfg ? boss.difficulties.find((d) => d.name === cfg.difficulty) : null;
    const tracesPerClear =
      !diff || diff.name === 'None' ? 0 : Math.floor(diff.traces / (cfg.partySize || 1)) * multiplier;

    const entry = {
      bossId: boss.id,
      bossName: boss.name,
      isMonthly: !!boss.monthlyReset,
      tracesPerClear,
    };

    if (boss.monthlyReset) {
      entry.tracesPerMonth = tracesPerClear;
      entry.tracesPerWeek = 0;
      monthlyBosses.push(entry);
    } else {
      entry.tracesPerWeek = tracesPerClear;
      weeklyBosses.push(entry);
    }
  });

  const totalWeekly = weeklyBosses.reduce((sum, b) => sum + b.tracesPerWeek, 0);
  const totalMonthly = monthlyBosses.reduce((sum, b) => sum + b.tracesPerClear, 0);

  return { weeklyBosses, monthlyBosses, totalWeekly, totalMonthly };
}

// Simulate accrual reset-by-reset, honoring scheduled config changes.
//
// Weekly bosses reset Thursday 00:00 UTC; monthly bosses (e.g. Black Mage)
// reset on the 1st 00:00 UTC. The config active at each reset date determines
// that reset's payout, so future difficulty/party changes are applied exactly
// when they take effect.
export function simulateSchedule({
  bossData,
  baseSelections,
  changes,
  startDateStr,
  totalTracesNeeded,
  multiplier = 1,
}) {
  const startDateObj = parseUTCDate(startDateStr);

  // Config + per-boss breakdown shown for the *current* week (start date).
  const startConfig = getConfigAtDate(baseSelections, changes, startDateObj);
  const startTraces = computeTraces(startConfig, bossData, multiplier);

  const timeline = [];
  let remaining = totalTracesNeeded;

  const record = (date, label, payout) => {
    const amt = Math.min(payout, remaining);
    remaining -= amt;
    timeline.push({ date: new Date(date), label, amount: amt, remaining });
  };

  const build = (completionDateObj, weeksNeeded) => ({
    weeklyTraces: [...startTraces.weeklyBosses, ...startTraces.monthlyBosses],
    totalWeeklyTraces: startTraces.totalWeekly,
    totalMonthlyTraces: startTraces.totalMonthly,
    weeksNeeded,
    completionDate: completionDateObj ? fmtDate(completionDateObj) : 'Never (no traces)',
    totalTracesNeeded,
    timeline,
  });

  if (totalTracesNeeded <= 0) {
    return build(startDateObj, 0);
  }

  // Immediate traces: bosses not yet cleared this reset can be killed right now,
  // using whatever config is active on the start date.
  let immediateWeekly = 0;
  let immediateMonthly = 0;
  baseSelections.forEach((s) => {
    if (s.clearedThisWeek) return;
    const cfg = startConfig[s.id];
    const boss = bossData.find((b) => b.id === s.id);
    const diff = boss.difficulties.find((d) => d.name === cfg.difficulty);
    const tpc = !diff || diff.name === 'None' ? 0 : Math.floor(diff.traces / (cfg.partySize || 1)) * multiplier;
    if (boss.monthlyReset) immediateMonthly += tpc;
    else immediateWeekly += tpc;
  });

  // Step A — immediate payouts on the start date (monthly first, then weekly).
  if (immediateMonthly > 0) {
    record(startDateObj, 'Monthly', immediateMonthly);
    if (remaining <= 0) return build(startDateObj, 0);
  }
  if (immediateWeekly > 0) {
    record(startDateObj, 'Weekly', immediateWeekly);
    if (remaining <= 0) return build(startDateObj, 0);
  }

  // Step B — walk forward through weekly (Thursday) and monthly (1st) resets.
  const dayOfWeek = startDateObj.getUTCDay();
  const daysUntilReset = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;

  let weeklyResetDate = new Date(startDateObj);
  weeklyResetDate.setUTCDate(weeklyResetDate.getUTCDate() + daysUntilReset);
  let monthlyResetDate = getNextMonthlyResetDate(startDateObj);

  let weeksElapsed = 0;
  const MAX_ITER = 520 * 2; // ~10 years of resets; guards against no-trace configs.
  let iter = 0;

  while (remaining > 0 && iter < MAX_ITER) {
    iter++;

    if (monthlyResetDate <= weeklyResetDate) {
      const cfg = getConfigAtDate(baseSelections, changes, monthlyResetDate);
      const { totalMonthly } = computeTraces(cfg, bossData, multiplier);
      if (totalMonthly > 0) {
        record(monthlyResetDate, 'Monthly', totalMonthly);
        if (remaining <= 0) return build(monthlyResetDate, weeksElapsed);
      }
      monthlyResetDate = getNextMonthlyResetDate(monthlyResetDate);
    } else {
      const cfg = getConfigAtDate(baseSelections, changes, weeklyResetDate);
      const { totalWeekly } = computeTraces(cfg, bossData, multiplier);
      weeksElapsed++;
      if (totalWeekly > 0) {
        record(weeklyResetDate, 'Weekly', totalWeekly);
        if (remaining <= 0) return build(weeklyResetDate, weeksElapsed);
      }
      weeklyResetDate = new Date(weeklyResetDate);
      weeklyResetDate.setUTCDate(weeklyResetDate.getUTCDate() + 7);
    }
  }

  // Never reaches the goal within the horizon (no traces being earned).
  return build(null, Infinity);
}
