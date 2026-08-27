/**
 * Burning Field projection maths.
 *
 * Game rules this encodes:
 *  - A map's burning level rises ~1 level per hour while nobody is hunting there,
 *    capped at level 10 (100% bonus EXP).
 *  - It falls 1 level per 15 minutes while a character is hunting in it.
 *  - Burning levels cannot RISE between 00:00 and 08:00 UTC ("burning curfew").
 *    They can still fall during curfew - a curfew is not a freeze.
 *  - The level is per-map AND per-channel, which is why we track a whole world.
 *
 * Assumptions this adds on top of the rules (they are guesses, not game rules,
 * and are surfaced to the user in the "Rules & assumptions" panel):
 *  - Somebody else found sitting in a map is assumed to still be there until
 *    somebody re-scouts the channel. We never see a stranger leave, so guessing
 *    a session length only invented levels that were never observed; a `taken`
 *    channel drains for as long as the reading is old, and its projection is a
 *    floor (they may well have left and let it climb).
 *  - A channel marked `camped` drains the same way, but is a stronger claim:
 *    the point of the status is that this one is not being vacated, so it sorts
 *    below `taken` and its level reads as a ceiling rather than a floor.
 */

export const MAX_LEVEL = 10;

/**
 * How many players a burning field map holds. A fifth cannot get in, which is
 * why the board tracks who is standing where at all - a channel at level 10
 * with four people in it is no use to you.
 */
export const MAP_CAPACITY = 4;

export const GROWTH_MS = 60 * 60 * 1000; // +1 level / hour when unvisited
export const DECAY_MS = 15 * 60 * 1000; // -1 level / 15 min while occupied

/** Burning cannot climb between these UTC hours - the nightly burning curfew. */
export const CURFEW_START_HOUR = 0;
export const CURFEW_END_HOUR = 8;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Milliseconds between two instants during which burning is allowed to climb,
 * i.e. wall-clock time minus any overlap with the 00:00-08:00 UTC curfew.
 */
export function growthMsBetween(startMs, endMs) {
  if (!(endMs > startMs)) return 0;

  let total = 0;
  // Walk UTC day by UTC day; each day contributes its [08:00, 24:00) window.
  let dayStart = Math.floor(startMs / DAY_MS) * DAY_MS;
  while (dayStart < endMs) {
    const windowStart = dayStart + CURFEW_END_HOUR * 60 * 60 * 1000;
    const windowEnd = dayStart + DAY_MS;
    const from = Math.max(windowStart, startMs);
    const to = Math.min(windowEnd, endMs);
    if (to > from) total += to - from;
    dayStart += DAY_MS;
  }
  return total;
}

/** True if `now` falls inside the nightly curfew window. */
export function isCurfew(now = Date.now()) {
  const hour = new Date(now).getUTCHours();
  return hour >= CURFEW_START_HOUR && hour < CURFEW_END_HOUR;
}

/** Ms until the curfew window ends (0 if we aren't in it). */
export function msUntilCurfewEnd(now = Date.now()) {
  if (!isCurfew(now)) return 0;
  const d = new Date(now);
  const end = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    CURFEW_END_HOUR,
  );
  return end - now;
}

/** Ms until the curfew window starts (0 if we're already in it). */
export function msUntilCurfewStart(now = Date.now()) {
  if (isCurfew(now)) return 0;
  const d = new Date(now);
  const next = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
    CURFEW_START_HOUR,
  );
  return next - now;
}

/**
 * How confident we are in a projection, purely as a function of how long ago
 * the observation was made. Growth itself is deterministic - the risk is that
 * somebody else wandered into the map since we last looked.
 */
export function confidenceFor(ageMs, status, derived = false) {
  const tier = confidenceTier(ageMs, status);
  // A derived reading is a projection frozen at the moment somebody moved a
  // marker - nobody actually looked at the map - so it never counts as fresh.
  return derived && tier === "high" ? "medium" : tier;
}

function confidenceTier(ageMs, status) {
  if (status === "ours") {
    // We know exactly what our own party is doing, for a while at least.
    if (ageMs < 20 * 60 * 1000) return "high";
    if (ageMs < 60 * 60 * 1000) return "medium";
    return "low";
  }
  if (status === "taken") {
    // Someone else's session. Nobody sees a stranger leave, so the reading is
    // only worth much while it is fresh.
    if (ageMs < 15 * 60 * 1000) return "medium";
    return "low";
  }
  if (status === "camped") {
    // A camper is a stable claim - it stays worthless until someone re-checks.
    if (ageMs < 2 * 60 * 60 * 1000) return "medium";
    return "low";
  }
  if (ageMs < 30 * 60 * 1000) return "high";
  if (ageMs < 3 * 60 * 60 * 1000) return "medium";
  return "low";
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

  const observedMs =
    typeof log.observed_at === "number"
      ? log.observed_at
      : new Date(log.observed_at).getTime();
  const ageMs = Math.max(0, now - observedMs);
  const status = log.status || "free";

  let level;
  let progress = 0; // fraction of the way to the next level change
  let bound = "exact"; // 'exact' | 'atLeast' | 'atMost' | 'approx'
  let growing = false; // is the level currently climbing?

  if (status === "free") {
    const usable = growthMsBetween(observedMs, now);
    const gained = usable / GROWTH_MS;
    level = Math.min(MAX_LEVEL, log.level + Math.floor(gained));
    progress = level >= MAX_LEVEL ? 1 : gained - Math.floor(gained);
    growing = level < MAX_LEVEL;
    // Someone else may have burned it down since we looked.
    bound = ageMs > 30 * 60 * 1000 ? "atMost" : "exact";
  } else if (status === "camped") {
    // Assumed to be occupied indefinitely, so it drains and stays drained.
    const lost = ageMs / DECAY_MS;
    level = Math.max(0, log.level - Math.floor(lost));
    progress = level <= 0 ? 1 : lost - Math.floor(lost);
    bound = "atMost";
  } else {
    // `ours` and `taken`: somebody is hunting here. Nobody has reported them
    // leaving, so assume they haven't - the level keeps draining, and what we
    // show is a floor: if they did leave, it has been climbing back since.
    const lost = ageMs / DECAY_MS;
    level = Math.max(0, log.level - Math.floor(lost));
    progress = level <= 0 ? 1 : lost - Math.floor(lost);
    bound = "atLeast";
  }

  // A derived reading was itself a projection when it was written, so it can
  // never be exact - only as good as the reading it was carried forward from.
  if (log.derived && bound === "exact") bound = "approx";

  return {
    level,
    progress,
    ageMs,
    observedMs,
    status,
    bound,
    growing,
    curfew: growing && isCurfew(now),
    confidence: confidenceFor(ageMs, status, Boolean(log.derived)),
    isProjected: level !== log.level || ageMs > 60 * 1000,
    observedLevel: log.level,
  };
}

/**
 * When will this channel next tick up a level? Null when it can't (already
 * capped, or currently assumed occupied and draining).
 */
export function msUntilNextLevel(projection, now = Date.now()) {
  if (!projection || !projection.growing) return null;
  if (projection.level >= MAX_LEVEL) return null;

  const remainingGrowthMs = GROWTH_MS * (1 - projection.progress);
  // Convert "growth ms still needed" into wall-clock ms, skipping the curfew.
  let cursor = now;
  let needed = remainingGrowthMs;
  for (let guard = 0; guard < 40 && needed > 0; guard += 1) {
    if (isCurfew(cursor)) {
      cursor += msUntilCurfewEnd(cursor);
      continue;
    }
    const untilCurfew = msUntilCurfewStart(cursor);
    const spend = Math.min(needed, untilCurfew);
    cursor += spend;
    needed -= spend;
  }
  return cursor - now;
}

/**
 * The status the occupancy markers imply for a channel, ignoring whatever the
 * last reading said. Markers are the more direct evidence: a reading is a claim
 * about a moment in the past, a marker is a claim about right now.
 *
 * A member marker means our party is in the map; strangers only, and somebody
 * else is. No markers means nobody is marked - which is only the same as "the
 * map is empty" for our own members, since nobody has to mark a stranger.
 */
export function statusFromOccupants(occupants = []) {
  if (occupants.length === 0) return "free";
  return occupants.some((occupant) => occupant.user_id) ? "ours" : "taken";
}

/**
 * Does the last reading contradict who is marked in the map? `camped` is not a
 * contradiction of a marked stranger - it is a claim about that same stranger
 * not leaving - and an unmarked map does not contradict `taken`/`camped`,
 * because strangers are only marked when somebody bothers to.
 *
 * The one thing we can always tell is where our own members are, so `ours` with
 * nobody from the group marked is always wrong.
 */
export function statusMismatch(logStatus, occupancyStatus) {
  if (!logStatus) return false;
  if (occupancyStatus === "ours") return logStatus !== "ours";
  if (occupancyStatus === "taken")
    return logStatus !== "taken" && logStatus !== "camped";
  return logStatus === "ours";
}

/**
 * What to log after somebody moves a marker, or null when the reading already
 * agrees with the markers and nothing needs writing.
 *
 * Unlike `statusMismatch` this is answering a narrower question - a marker on
 * *this* channel just changed, so the marker count is known to be current, and
 * an emptied map really does mean free.
 */
export function statusAfterOccupancyChange(logStatus, occupancyStatus) {
  // A camper is a marked stranger who won't leave; still true either way.
  if (occupancyStatus === "taken" && logStatus === "camped") return null;
  return occupancyStatus === logStatus ? null : occupancyStatus;
}

/**
 * Build the full board: one entry per channel, newest observation projected to
 * `now`, sorted however the caller likes.
 *
 * @param {Array} logs all logs for the group, any order
 * @param {number} channelCount
 * @param {number} now epoch ms
 * @param {Array} occupants who is currently marked as standing in each channel
 */
export function buildBoard(
  logs,
  channelCount,
  now = Date.now(),
  occupants = [],
) {
  const latest = new Map();
  for (const log of logs) {
    const existing = latest.get(log.channel);
    if (
      !existing ||
      new Date(log.observed_at) > new Date(existing.observed_at)
    ) {
      latest.set(log.channel, log);
    }
  }

  const here = new Map();
  for (const occupant of occupants) {
    if (!here.has(occupant.channel)) here.set(occupant.channel, []);
    here.get(occupant.channel).push(occupant);
  }
  // Oldest marker first, so the pips on a tile don't reorder themselves every
  // time a row arrives over realtime in a different sequence.
  for (const list of here.values()) {
    list.sort(
      (a, b) => new Date(a.placed_at) - new Date(b.placed_at) || a.id - b.id,
    );
  }

  const board = [];
  for (let channel = 1; channel <= channelCount; channel += 1) {
    const log = latest.get(channel) || null;
    const channelOccupants = here.get(channel) || [];
    const occupancyStatus = statusFromOccupants(channelOccupants);
    board.push({
      channel,
      log,
      projection: projectLevel(log, now),
      occupants: channelOccupants,
      occupancyStatus,
      // Set when the markers and the reading disagree. Occupancy edits keep the
      // two in step by themselves, so this is either a hand-logged
      // contradiction or a channel last touched before that syncing existed.
      statusMismatch: statusMismatch(log?.status, occupancyStatus),
    });
  }
  return board;
}

/** True when the channel has no room left for one more character. */
export function isFull(entry) {
  return (entry?.occupants?.length || 0) >= MAP_CAPACITY;
}

/** Lower is better: how worth hopping to a channel in this state is. */
function statusRank(status) {
  if (status === "camped") return 2; // occupied by somebody who won't leave
  if (status === "ours" || status === "taken") return 1; // occupied
  return 0; // free
}

/**
 * Lower is better, as `statusRank`, but a full map outranks everything: you
 * cannot enter it at all, however good its burning level looks.
 */
function entryRank(entry) {
  if (isFull(entry)) return 3;
  // Take whichever of the two views is the more pessimistic, so a channel with
  // people standing in it can never sort as though it were free.
  return Math.max(
    statusRank(entry.projection.status),
    statusRank(entry.occupancyStatus),
  );
}

/**
 * The status to judge a channel by: the reading, unless the markers say
 * something worse. Used for "is this worth hopping to", not for the maths -
 * the projection itself always follows the reading.
 */
export function effectiveStatus(entry) {
  if (!entry?.projection) return entry?.occupancyStatus || "free";
  return statusRank(entry.occupancyStatus) > statusRank(entry.projection.status)
    ? entry.occupancyStatus
    : entry.projection.status;
}

/** Sort comparator: most useful channel to hop to first. */
export function compareByValue(a, b) {
  const pa = a.projection;
  const pb = b.projection;
  if (!pa && !pb) return a.channel - b.channel;
  if (!pa) return 1;
  if (!pb) return -1;

  const ra = entryRank(a);
  const rb = entryRank(b);
  if (ra !== rb) return ra - rb;

  if (pb.level !== pa.level) return pb.level - pa.level;
  if (pa.ageMs !== pb.ageMs) return pa.ageMs - pb.ageMs;
  return a.channel - b.channel;
}

const RELATIVE_UNITS = [
  [60 * 1000, "sec", 1000],
  [60 * 60 * 1000, "min", 60 * 1000],
  [24 * 60 * 60 * 1000, "hr", 60 * 60 * 1000],
  [Infinity, "day", 24 * 60 * 60 * 1000],
];

/** "just now" / "12 min ago" style formatting. */
export function formatAge(ms) {
  if (ms < 45 * 1000) return "just now";
  for (const [limit, unit, divisor] of RELATIVE_UNITS) {
    if (ms < limit) {
      const value = Math.round(ms / divisor);
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "a while ago";
}

/** "in 12 min" style formatting for countdowns. */
export function formatCountdown(ms) {
  if (ms == null) return null;
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  if (totalMinutes < 1) return "<1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
