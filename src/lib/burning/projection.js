/**
 * Burning Field projection maths.
 *
 * Game rules this encodes:
 *  - A map's burning level rises ~1 level per hour while nobody is hunting there,
 *    capped at level 10 (100% bonus EXP).
 *  - It falls 1 level per 15 minutes while a character is hunting in it.
 *  - Burning levels do NOT increase between 00:00 and 08:00 UTC.
 *  - The level is per-map AND per-channel, which is why we track a whole world.
 */

export const MAX_LEVEL = 10;
export const GROWTH_MS = 60 * 60 * 1000; // +1 level / hour when unvisited
export const DECAY_MS = 15 * 60 * 1000; // -1 level / 15 min while occupied

/** Burning does not grow between these UTC hours. */
export const FREEZE_START_HOUR = 0;
export const FREEZE_END_HOUR = 8;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Milliseconds between two instants during which burning is allowed to grow,
 * i.e. wall-clock time minus any overlap with the 00:00-08:00 UTC freeze.
 */
export function growthMsBetween(startMs, endMs) {
  if (!(endMs > startMs)) return 0;

  let total = 0;
  // Walk UTC day by UTC day; each day contributes its [08:00, 24:00) window.
  let dayStart = Math.floor(startMs / DAY_MS) * DAY_MS;
  while (dayStart < endMs) {
    const windowStart = dayStart + FREEZE_END_HOUR * 60 * 60 * 1000;
    const windowEnd = dayStart + DAY_MS;
    const from = Math.max(windowStart, startMs);
    const to = Math.min(windowEnd, endMs);
    if (to > from) total += to - from;
    dayStart += DAY_MS;
  }
  return total;
}

/** True if `now` falls inside the nightly freeze window. */
export function isFrozen(now = Date.now()) {
  const hour = new Date(now).getUTCHours();
  return hour >= FREEZE_START_HOUR && hour < FREEZE_END_HOUR;
}

/** Ms until the freeze window ends (0 if we aren't in it). */
export function msUntilThaw(now = Date.now()) {
  if (!isFrozen(now)) return 0;
  const d = new Date(now);
  const thaw = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), FREEZE_END_HOUR);
  return thaw - now;
}

/** Ms until the freeze window starts (0 if we're already in it). */
export function msUntilFreeze(now = Date.now()) {
  if (isFrozen(now)) return 0;
  const d = new Date(now);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, FREEZE_START_HOUR);
  return next - now;
}

/**
 * How confident we are in a projection, purely as a function of how long ago
 * the observation was made. Growth itself is deterministic — the risk is that
 * somebody else wandered into the map since we last looked.
 */
export function confidenceFor(ageMs, status) {
  if (status === 'ours') {
    // We know exactly what our own party is doing, for a while at least.
    if (ageMs < 20 * 60 * 1000) return 'high';
    if (ageMs < 60 * 60 * 1000) return 'medium';
    return 'low';
  }
  if (status === 'taken') {
    // Someone else's session; we have no idea when they leave.
    if (ageMs < 15 * 60 * 1000) return 'medium';
    return 'low';
  }
  if (ageMs < 30 * 60 * 1000) return 'high';
  if (ageMs < 3 * 60 * 60 * 1000) return 'medium';
  return 'low';
}

/**
 * Project a channel's burning level forward from its most recent observation.
 *
 * Returns null when there is no observation at all.
 *
 * @param {{level:number, status:string, observed_at:string|number}} log
 * @param {number} now epoch ms
 */
export function projectLevel(log, now = Date.now()) {
  if (!log) return null;

  const observedMs = typeof log.observed_at === 'number'
    ? log.observed_at
    : new Date(log.observed_at).getTime();
  const ageMs = Math.max(0, now - observedMs);
  const status = log.status || 'free';

  let level;
  let progress = 0; // fraction of the way to the next level change
  let bound = 'exact'; // 'exact' | 'atLeast' | 'atMost'

  if (status === 'free') {
    const usable = growthMsBetween(observedMs, now);
    const gained = usable / GROWTH_MS;
    level = Math.min(MAX_LEVEL, log.level + Math.floor(gained));
    progress = level >= MAX_LEVEL ? 1 : gained - Math.floor(gained);
    // Someone else may have burned it down since we looked.
    bound = ageMs > 30 * 60 * 1000 ? 'atMost' : 'exact';
  } else {
    // Occupied — assume whoever was there kept hunting, so this is a floor.
    const lost = ageMs / DECAY_MS;
    level = Math.max(0, log.level - Math.floor(lost));
    progress = level <= 0 ? 1 : lost - Math.floor(lost);
    bound = 'atLeast';
  }

  return {
    level,
    progress,
    ageMs,
    observedMs,
    status,
    bound,
    frozen: status === 'free' && isFrozen(now) && level < MAX_LEVEL,
    confidence: confidenceFor(ageMs, status),
    isProjected: level !== log.level || ageMs > 60 * 1000,
    observedLevel: log.level,
  };
}

/**
 * When will this channel next tick up a level? Null when it can't (already
 * capped, or currently occupied and draining).
 */
export function msUntilNextLevel(projection, now = Date.now()) {
  if (!projection || projection.status !== 'free') return null;
  if (projection.level >= MAX_LEVEL) return null;

  const remainingGrowthMs = GROWTH_MS * (1 - projection.progress);
  // Convert "growth ms still needed" into wall-clock ms, skipping the freeze.
  let cursor = now;
  let needed = remainingGrowthMs;
  for (let guard = 0; guard < 40 && needed > 0; guard += 1) {
    if (isFrozen(cursor)) {
      cursor += msUntilThaw(cursor);
      continue;
    }
    const untilFreeze = msUntilFreeze(cursor);
    const spend = Math.min(needed, untilFreeze);
    cursor += spend;
    needed -= spend;
  }
  return cursor - now;
}

/**
 * Build the full board: one entry per channel, newest observation projected to
 * `now`, sorted however the caller likes.
 *
 * @param {Array} logs all logs for the group, any order
 * @param {number} channelCount
 */
export function buildBoard(logs, channelCount, now = Date.now()) {
  const latest = new Map();
  for (const log of logs) {
    const existing = latest.get(log.channel);
    if (!existing || new Date(log.observed_at) > new Date(existing.observed_at)) {
      latest.set(log.channel, log);
    }
  }

  const board = [];
  for (let channel = 1; channel <= channelCount; channel += 1) {
    const log = latest.get(channel) || null;
    board.push({
      channel,
      log,
      projection: projectLevel(log, now),
    });
  }
  return board;
}

/** Sort comparator: most useful channel to hop to first. */
export function compareByValue(a, b) {
  const pa = a.projection;
  const pb = b.projection;
  if (!pa && !pb) return a.channel - b.channel;
  if (!pa) return 1;
  if (!pb) return -1;

  // Channels someone is sitting in are worth less than free ones.
  const occupied = (p) => (p.status === 'taken' ? 1 : 0);
  if (occupied(pa) !== occupied(pb)) return occupied(pa) - occupied(pb);

  if (pb.level !== pa.level) return pb.level - pa.level;
  return pa.ageMs - pb.ageMs;
}

const RELATIVE_UNITS = [
  [60 * 1000, 'sec', 1000],
  [60 * 60 * 1000, 'min', 60 * 1000],
  [24 * 60 * 60 * 1000, 'hr', 60 * 60 * 1000],
  [Infinity, 'day', 24 * 60 * 60 * 1000],
];

/** "just now" / "12 min ago" style formatting. */
export function formatAge(ms) {
  if (ms < 45 * 1000) return 'just now';
  for (const [limit, unit, divisor] of RELATIVE_UNITS) {
    if (ms < limit) {
      const value = Math.round(ms / divisor);
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }
  return 'a while ago';
}

/** "in 12 min" style formatting for countdowns. */
export function formatCountdown(ms) {
  if (ms == null) return null;
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  if (totalMinutes < 1) return '<1 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
