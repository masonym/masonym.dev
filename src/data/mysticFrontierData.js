export const SITE_RANKS = ['Common', 'Rare', 'Epic', 'Unique', 'Legendary'];

export const SITE_RANK_CONFIG = {
  Common: { tileCount: 2, duration: 6, color: '#9ca3af' },
  Rare: { tileCount: [2, 3], duration: 8, color: '#60a5fa' },
  Epic: { tileCount: [2, 4], duration: 12, color: '#a78bfa' },
  Unique: { tileCount: [3, 4], duration: 18, color: '#fbbf24' },
  Legendary: { tileCount: 4, duration: 24, color: '#22c55e' },
};

export const TILE_TYPES = ['Hunting', 'Encounter', 'Lucky'];

export const TILE_RARITIES = ['Normal', 'Intermediate', 'Advanced'];

export const TILE_RARITY_CONFIG = {
  Normal: { color: '#6b7280', label: 'Normal (Grey)' },
  Intermediate: { color: '#fbbf24', label: 'Intermediate (Gold)' },
  Advanced: { color: '#a855f7', label: 'Advanced (Purple)' },
};

export const TILE_TYPE_CONFIG = {
  Hunting: { icon: '🏹', description: 'Obtain items by using action points' },
  Encounter: { icon: '⚔️', description: 'Obtain items by using action points' },
  Lucky: { icon: '🍀', description: 'Restores action points' },
};

export const MAX_ROUNDS = 5;

// Chest tier order (lowest to highest): Glowing < Blue < Purple < Orange < Green < White
export const CHEST_TIERS = ['Glowing', 'Blue', 'Purple', 'Orange', 'Green', 'White'];

export const CHEST_TIER_CONFIG = {
  Glowing: { color: '#fcd34d', label: 'Glowing', order: 0 },
  Blue: { color: '#60a5fa', label: 'Blue', order: 1 },
  Purple: { color: '#a855f7', label: 'Purple', order: 2 },
  Orange: { color: '#f97316', label: 'Orange', order: 3 },
  Green: { color: '#22c55e', label: 'Green', order: 4 },
  White: { color: '#f5f5f5', label: 'White', order: 5 },
};

// Pouch types (no White pouch exists) - maps to chest tiers
export const POUCH_TYPES = ['Glowing', 'Blue', 'Purple', 'Orange', 'Green'];

export const POUCH_CONFIG = {
  Glowing: { color: '#fcd34d', label: 'Mysterious Glowing Pouch', order: 0, image: '/mysticfrontier/mysteriousglowingpouch.png' },
  Blue: { color: '#60a5fa', label: 'Mysterious Blue Pouch', order: 1, image: '/mysticfrontier/mysteriousbluepouch.png' },
  Purple: { color: '#a855f7', label: 'Mysterious Purple Pouch', order: 2, image: '/mysticfrontier/mysteriouspurplepouch.png' },
  Orange: { color: '#f97316', label: 'Mysterious Orange Pouch', order: 3, image: '/mysticfrontier/mysteriousorangepouch.png' },
  Green: { color: '#22c55e', label: 'Mysterious Green Pouch', order: 4, image: '/mysticfrontier/mysteriousgreenpouch.png' },
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
