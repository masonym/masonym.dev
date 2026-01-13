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

// Chest tier order (lowest to highest): Blue < Purple < Orange < Green < White
export const CHEST_TIERS = ['Blue', 'Purple', 'Orange', 'Green', 'White'];

export const CHEST_TIER_CONFIG = {
  Blue: { color: '#60a5fa', label: 'Blue', order: 0 },
  Purple: { color: '#a855f7', label: 'Purple', order: 1 },
  Orange: { color: '#f97316', label: 'Orange', order: 2 },
  Green: { color: '#22c55e', label: 'Green', order: 3 },
  White: { color: '#f5f5f5', label: 'White', order: 4 },
};

// Starting tiers (no White pouch exists)
export const STARTING_TIERS = ['Blue', 'Purple', 'Orange', 'Green'];

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
