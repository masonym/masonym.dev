'use client';

import { Sword, Search, HeartPulse } from 'lucide-react';

export const TILE_ICONS = {
  Hunting: Sword,
  Encounter: Search,
  Lucky: HeartPulse,
};

export const DEFAULT_KNOWN_ITEMS = [
  'Mysterious Glowing Pouch',
  'Mysterious Blue Pouch',
  'Mysterious Purple Pouch',
  'Mysterious Orange Pouch',
  'Mysterious Green Pouch',
  'Chaos Pitched Accessory Box',
  'Pitched Star Core Coupon',
  'Star Core Coupon',
  'Damaged Black Heart Coupon',
];

export const DEFAULT_REWARD = 'Mysterious Glowing Pouch';

export const EXPEDITION_RARITY_HOTKEYS = {
  c: 'Common',
  r: 'Rare',
  e: 'Epic',
  u: 'Unique',
  l: 'Legendary',
};

export const TILE_RARITY_HOTKEYS = {
  n: 'Normal',
  i: 'Intermediate',
  a: 'Advanced',
};

export const TILE_TYPE_HOTKEYS = {
  h: 'Hunting',
  e: 'Encounter',
  l: 'Lucky',
};
