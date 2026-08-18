'use client';

import React from 'react';

/**
 * Semantic highlighting for familiar / Mystic Frontier line descriptions.
 *
 * Categories:
 *  - value+ / value-  : numeric deltas (+1, -1, x2, +1.4x, +5%)
 *  - element / type   : Mystic Frontier familiar elements and types (rendered with their icon)
 *  - condition        : qualifiers a line's trigger hinges on (same, different, odd, dice faces...)
 *  - event            : the [EVENT] / [~expiry] prefix on limited-time lines
 *
 * Note: the icon folders are named the opposite of what they hold — elements live
 * in /types and types live in /elements. The rest of the page does the same.
 */

const ELEMENT_ICON_DIR = '/familiar_data/familiars/types';
const TYPE_ICON_DIR = '/familiar_data/familiars/elements';

const ELEMENTS = {
  fire: { icon: `${ELEMENT_ICON_DIR}/fire.png`, styles: 'bg-red-500/15 text-red-300' },
  ice: { icon: `${ELEMENT_ICON_DIR}/ice.png`, styles: 'bg-cyan-500/15 text-cyan-300' },
  lightning: { icon: `${ELEMENT_ICON_DIR}/lightning.png`, styles: 'bg-amber-500/15 text-amber-300' },
  electric: { icon: `${ELEMENT_ICON_DIR}/lightning.png`, styles: 'bg-amber-500/15 text-amber-300' },
  poison: { icon: `${ELEMENT_ICON_DIR}/poison.png`, styles: 'bg-green-500/15 text-green-300' },
  holy: { icon: `${ELEMENT_ICON_DIR}/holy.png`, styles: 'bg-yellow-500/15 text-yellow-300' },
  dark: { icon: `${ELEMENT_ICON_DIR}/dark.png`, styles: 'bg-purple-500/15 text-purple-300' },
  'non-elemental': { icon: `${ELEMENT_ICON_DIR}/none.png`, styles: 'bg-gray-500/15 text-gray-300' },
};

const TYPES = {
  human: { icon: `${TYPE_ICON_DIR}/human.png`, styles: 'bg-orange-500/15 text-orange-300' },
  beast: { icon: `${TYPE_ICON_DIR}/beast.png`, styles: 'bg-emerald-500/15 text-emerald-300' },
  aquatic: { icon: `${TYPE_ICON_DIR}/aquatic.png`, styles: 'bg-blue-500/15 text-blue-300' },
  mechanical: { icon: `${TYPE_ICON_DIR}/machine.png`, styles: 'bg-slate-400/15 text-slate-300' },
  fairy: { icon: `${TYPE_ICON_DIR}/fairy.png`, styles: 'bg-pink-500/15 text-pink-300' },
  devil: { icon: `${TYPE_ICON_DIR}/devil.png`, styles: 'bg-rose-500/15 text-rose-300' },
  plant: { icon: `${TYPE_ICON_DIR}/plant.png`, styles: 'bg-lime-500/15 text-lime-300' },
  reptile: { icon: `${TYPE_ICON_DIR}/reptile.png`, styles: 'bg-teal-500/15 text-teal-300' },
  undead: { icon: `${TYPE_ICON_DIR}/undead.png`, styles: 'bg-indigo-500/15 text-indigo-300' },
};

const POSITIVE_CLASS = 'text-emerald-400 font-semibold';
const NEGATIVE_CLASS = 'text-rose-400 font-semibold';
const CONDITION_CLASS = 'text-emerald-300 font-medium';
const DICE_CLASS = 'text-sky-300 font-semibold';
const EVENT_CLASS = 'text-amber-400/80 font-medium';
const CHIP_CLASS =
  'inline-flex items-center gap-1 align-baseline px-1 py-px rounded font-medium';

// Lines where a smaller number is the buff, so a leading "-" is still good news.
const REDUCTION_IS_GOOD = /(cost|expedition time|cooldown|damage taken)/i;

const TOKEN_RE = new RegExp(
  [
    // [EVENT] / [~06/16 11:59 PM]
    '(\\[EVENT\\]|\\[~[^\\]]*\\])',
    // signed or multiplied values: +1, -3, +1.4x, x2, +12%
    '([+\\-]\\s?\\d+(?:\\.\\d+)?x?%?|\\bx\\s?\\d+(?:\\.\\d+)?%?)',
    // elements
    '(\\bnon-elemental\\b|\\b(?:Fire|Ice|Lightning|Electric|Poison|Holy|Dark)\\b)',
    // types
    '(\\b(?:Human|Beast|Aquatic|Mechanical|Fairy|Devil|Plant|Reptile|Undead)\\b)',
    // condition qualifiers
    '(\\b(?:same|different|consecutive|even|odd|match|matches)\\b)',
    // bare numbers (dice faces / thresholds on MF lines, plain values elsewhere)
    '(\\d+(?:\\.\\d+)?%?)',
  ].join('|'),
  'g'
);

const IconChip = ({ entry, label }) => (
  <span className={`${CHIP_CLASS} ${entry ? entry.styles : ''}`}>
    {entry && (
      <img
        src={entry.icon}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        className="w-3.5 h-3.5 shrink-0 object-contain"
        loading="lazy"
      />
    )}
    {label}
  </span>
);

/**
 * Turns a fully-formatted description string into an array of React nodes with
 * per-token coloring. Returns the plain string when nothing matches.
 */
export const highlightDescription = (text) => {
  if (!text || typeof text !== 'string') return text;

  const reductionIsGood = REDUCTION_IS_GOOD.test(text);
  // Bare numbers mean dice faces / thresholds only on dice-driven lines.
  const isDiceLine = /\b(dice|die|roll)/i.test(text);

  const nodes = [];
  let lastIndex = 0;
  let key = 0;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const [raw, event, value, element, type, condition, bareNumber] = match;
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    lastIndex = match.index + raw.length;

    if (element || type) {
      const entry = element ? ELEMENTS[element.toLowerCase()] : TYPES[type.toLowerCase()];
      nodes.push(<IconChip key={`t${key++}`} entry={entry} label={raw} />);
      continue;
    }

    let className = null;
    if (event) {
      className = EVENT_CLASS;
    } else if (value) {
      const isNegative = value.startsWith('-') && !reductionIsGood;
      className = isNegative ? NEGATIVE_CLASS : POSITIVE_CLASS;
    } else if (condition) {
      className = CONDITION_CLASS;
    } else if (bareNumber) {
      className = isDiceLine ? DICE_CLASS : POSITIVE_CLASS;
    }

    nodes.push(
      <span key={`t${key++}`} className={className || undefined}>
        {raw}
      </span>
    );
  }

  if (nodes.length === 0) return text;
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

export const HIGHLIGHT_LEGEND = [
  { label: 'Buff', node: <span className={POSITIVE_CLASS}>+1</span> },
  { label: 'Penalty', node: <span className={NEGATIVE_CLASS}>-1</span> },
  { label: 'Dice', node: <span className={DICE_CLASS}>6</span> },
  { label: 'Element', node: <IconChip entry={ELEMENTS.fire} label="Fire" /> },
  { label: 'Type', node: <IconChip entry={TYPES.beast} label="Beast" /> },
];

export default highlightDescription;
