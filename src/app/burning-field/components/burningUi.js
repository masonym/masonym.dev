/** Shared presentation bits for the burning field board. */

export const STATUS_META = {
  free: { label: 'Free', short: 'free', hint: 'Nobody hunting — burning is climbing' },
  ours: { label: 'We are here', short: 'ours', hint: 'Our party is hunting here — burning is draining' },
  taken: { label: 'Someone else', short: 'taken', hint: 'Another player is in the map' },
};

export const STATUS_KEYS = ['free', 'ours', 'taken'];

/**
 * Level 0-10 mapped onto a red -> green ramp. Returned as raw hsl so the tiles
 * read the same in both site themes.
 */
export function levelColor(level, alpha = 1) {
  const clamped = Math.max(0, Math.min(10, level));
  const hue = 4 + (clamped / 10) * 122; // red -> green
  const light = 32 + (clamped / 10) * 14;
  return `hsla(${hue}, 62%, ${light}%, ${alpha})`;
}

export function levelTextColor(level) {
  return level >= 7 ? 'hsl(120, 70%, 82%)' : 'hsl(0, 0%, 96%)';
}

export const CONFIDENCE_META = {
  high: { label: 'fresh', className: 'text-green-400' },
  medium: { label: 'aging', className: 'text-yellow-400' },
  low: { label: 'stale', className: 'text-red-400' },
};

/** EXP bonus for a given burning level: 10% per level. */
export function bonusPercent(level) {
  return level * 10;
}

/**
 * Parse the quick-entry syntax used by the log bar.
 *   "12 7"        -> channel 12, level 7, status free
 *   "12 7 ours"   -> explicit status
 *   "12 7o"       -> shorthand: o = ours, t = taken, f = free
 * Returns null when the string can't be read.
 */
export function parseQuickEntry(input, channelCount) {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase().replace(/[,/]+/g, ' ');
  const match = cleaned.match(/^(\d{1,3})\s+(10|\d)\s*([a-z]*)$/);
  if (!match) return null;

  const channel = Number(match[1]);
  const level = Number(match[2]);
  if (channel < 1 || channel > channelCount) return null;

  const word = match[3];
  let status = 'free';
  if (word.startsWith('o') || word.startsWith('u')) status = 'ours';
  else if (word.startsWith('t') || word.startsWith('x')) status = 'taken';
  else if (word && !word.startsWith('f')) return null;

  return { channel, level, status };
}
