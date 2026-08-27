/** Shared presentation bits for the burning field board. */

import {
  DECAY_MS,
  GROWTH_MS,
  MAP_CAPACITY,
  MAX_LEVEL,
} from "@/lib/burning/projection";

export const STATUS_META = {
  free: {
    label: "Free",
    short: "free",
    hint: "Nobody hunting - burning is climbing",
  },
  ours: {
    label: "We are here",
    short: "ours",
    hint: "Our party is hunting here - burning is draining",
  },
  taken: {
    label: "Someone else",
    short: "taken",
    hint: "Another player is in the map - assumed to still be there until somebody re-scouts it",
  },
  camped: {
    label: "Camped",
    short: "camped",
    hint: "Somebody is parked here long-term, sitting on a burnt-out map. Assumed to stay put, so the channel is treated as unusable until re-scouted.",
  },
};

export const STATUS_KEYS = ["free", "ours", "taken", "camped"];

/** Glyph prefixed to a projected level to show it is a bound, not a reading. */
export const BOUND_GLYPH = {
  exact: null,
  atLeast: "≥",
  atMost: "≤",
  approx: "~",
};

/**
 * Level 0-10 mapped onto a red -> green ramp. Returned as raw hsl so the tiles
 * read the same in both site themes.
 *
 * Stale readings are drawn desaturated rather than transparent: alpha over the
 * page background inverts with the theme, and the ramp was only ever tuned
 * against the dark one.
 */
export function levelColor(level, { stale = false } = {}) {
  const clamped = Math.max(0, Math.min(MAX_LEVEL, level));
  const hue = 4 + (clamped / MAX_LEVEL) * 122; // red -> green
  const light = 32 + (clamped / MAX_LEVEL) * 14;
  if (stale) return `hsl(${hue}, 20%, ${light - 4}%)`;
  return `hsl(${hue}, 62%, ${light}%)`;
}

export function levelTextColor(level, { stale = false } = {}) {
  if (stale) return "hsl(0, 0%, 78%)";
  return level >= 7 ? "hsl(120, 70%, 82%)" : "hsl(0, 0%, 96%)";
}

export const CONFIDENCE_META = {
  high: { label: "fresh", className: "text-green-400" },
  medium: { label: "aging", className: "text-yellow-400" },
  low: { label: "stale", className: "text-red-400" },
};

/** EXP bonus for a given burning level: 10% per level. */
export function bonusPercent(level) {
  return level * 10;
}

const MINUTES = (ms) => Math.round(ms / 60000);

/** The game's rules, stated as facts. Rendered as a list in the rules panel. */
export const GAME_RULES = [
  `An empty map gains +1 burning level every ${MINUTES(GROWTH_MS)} minutes, up to level ${MAX_LEVEL}.`,
  `Each level is +10% EXP, so level ${MAX_LEVEL} is +${MAX_LEVEL * 10}% EXP.`,
  `A map loses 1 level every ${MINUTES(DECAY_MS)} minutes while somebody is hunting in it.`,
  `Burning curfew: between 00:00 and 08:00 UTC burning level cannot climb.`,
  `Maps have instanced mobs for up to ${MAP_CAPACITY} characters.`,
];

/** Guesses the projection makes that the game does not guarantee. */
export const SITE_ASSUMPTIONS = [
  `A channel logged as "Someone else" is assumed to still have them in it, so it keeps draining until somebody re-scouts it. Nobody sees a stranger leave, so its level is a floor (≥) - if they did leave, it has been climbing back since.`,
  `A channel logged as "Camped" is assumed to stay occupied indefinitely, so it drains to 0 and stays there until somebody re-scouts it.`,
  `A channel logged as "We are here" is assumed to still have our party in it, so its level is a floor (≥).`,
  `The board shows you what was last logged, not what the maths thinks is true now. The projection is the small "may be N" under it, and it carries a bound where the guess is one-sided: ≥ at least, ≤ at most, ~ approximate.`,
  `Who is standing in a channel is marked by hand, by whoever saw them. Markers never expire on their own - the age next to a name is how long ago somebody placed it.`,
  `Markers and status are one thing, not two: moving somebody in or out of a map logs that channel's projected level under the status the markers now imply, and logging "Free" or "We are here" moves the markers to match. Those inferred readings are shown as such and never count as fresh.`,
  `Nothing here reads the game - every number comes from what your group last logged, projected forward.`,
];

/**
 * Parse the quick-entry syntax used by the log bar.
 *   "12 7"        -> channel 12, level 7, status free
 *   "12 7 ours"   -> explicit status
 *   "12 7o"       -> shorthand: o = ours, t = taken, c = camped, f = free
 * Returns null when the string can't be read.
 */
export function parseQuickEntry(input, channelCount) {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase().replace(/[,/]+/g, " ");
  const match = cleaned.match(/^(\d{1,3})\s+(10|\d)\s*([a-z]*)$/);
  if (!match) return null;

  const channel = Number(match[1]);
  const level = Number(match[2]);
  if (channel < 1 || channel > channelCount) return null;

  const word = match[3];
  let status = "free";
  if (word.startsWith("o") || word.startsWith("u")) status = "ours";
  else if (word.startsWith("t") || word.startsWith("x")) status = "taken";
  else if (word.startsWith("c") || word.startsWith("b")) status = "camped";
  else if (word && !word.startsWith("f")) return null;

  return { channel, level, status };
}

/**
 * A name for an unnamed stranger, unique within the group. Labels are the only
 * identity a non-member has, so "Random 2" has to not collide with an existing
 * "Random 2" - the database rejects that outright.
 */
export function nextStrangerLabel(occupants) {
  const used = new Set(
    occupants
      .map((occupant) => /^random (\d+)$/i.exec(occupant.label || ""))
      .filter(Boolean)
      .map((match) => Number(match[1])),
  );
  let n = 1;
  while (used.has(n)) n += 1;
  return `Random ${n}`;
}
