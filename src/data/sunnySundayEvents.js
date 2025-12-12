// predefined sunny sunday event types with their display properties
export const SUNNY_SUNDAY_EVENT_TYPES = {
  MONSTER_PARK_EXP: {
    id: 'monster_park_exp',
    name: '+250% Monster Park Clear EXP',
    shortName: 'Monster Park EXP',
    category: 'hunting',
    icon: '/sunnySundayIcons/monster-park.png',
  },
  RUNE_COOLDOWN: {
    id: 'rune_cooldown',
    name: 'Rune Cooldown Reduction (to 10min)',
    shortName: 'Rune Cooldown',
    category: 'hunting',
    icon: '/sunnySundayIcons/rune-cooldown.png',
  },
  RUNE_EXP: {
    id: 'rune_exp',
    name: '+100% Rune EXP',
    shortName: 'Rune EXP',
    category: 'hunting',
    icon: '/sunnySundayIcons/rune-exp.png',
  },
  TREASURE_HUNTER_EXP: {
    id: 'treasure_hunter_exp',
    name: 'Treasure Hunter EXP x3',
    shortName: 'Treasure Hunter',
    category: 'hunting',
    icon: '/sunnySundayIcons/treasure-hunter.png',
  },
  SOL_ERDA_2X: {
    id: 'sol_erda_2x',
    name: '2x Sol Erda from Hunting',
    shortName: 'Sol Erda 2x',
    category: 'hunting',
    icon: '/sunnySundayIcons/sol-erda.png',
  },
  COMBO_KILL_EXP: {
    id: 'combo_kill_exp',
    name: 'Combo Kill EXP +300%',
    shortName: 'Combo Kill EXP',
    category: 'hunting',
    icon: '/sunnySundayIcons/combo-kill.png',
  },
  HEXA_ENHANCEMENT: {
    id: 'hexa_enhancement',
    name: '[HEXA Matrix] +20% Main Stat Enhancement Rate Past Level 5',
    shortName: 'HEXA Enhancement',
    category: 'hexa',
    icon: '/sunnySundayIcons/hexa-enhancement.png',
  },
  ABILITY_RESET_DISCOUNT: {
    id: 'ability_reset_discount',
    name: '50% off Ability Resets',
    shortName: 'Ability Reset',
    category: 'enhancement',
    icon: '/sunnySundayIcons/ability-reset.png',
  },
  MAGNIFICENT_SOULS: {
    id: 'magnificent_souls',
    name: '5x Chance for Magnificent Souls',
    shortName: 'Magnificent Souls',
    category: 'enhancement',
    icon: '/sunnySundayIcons/magnificent-souls.png',
  },
  SPELL_TRACE_DISCOUNT: {
    id: 'spell_trace_discount',
    name: '50% off Spell Trace Enhancements',
    shortName: 'Spell Trace',
    category: 'enhancement',
    icon: '/sunnySundayIcons/spell-trace.png',
  },
  MONSTER_COLLECTION: {
    id: 'monster_collection',
    name: '+100% Monster Collection Registration Rate',
    shortName: 'Monster Collection',
    category: 'moncol',
    icon: '/sunnySundayIcons/monster-collection.png',
  },
  MONSTERBLOOMS: {
    id: 'monsterblooms',
    name: 'Claim x3 Mysterious Monsterblooms',
    shortName: 'Monsterblooms x3',
    category: 'moncol',
    icon: '/sunnySundayIcons/monsterblooms.png',
  },
  ELITE_MONSTER_SPAWN: {
    id: 'elite_monster_spawn',
    name: 'Elite monster appearance chance increase',
    shortName: 'Elite Monsters',
    category: 'hunting',
    icon: '/sunnySundayIcons/elite-monster.png',
  },
  BOUNTY_HUNTER_EXP: {
    id: 'bounty_hunter_exp',
    name: '5x EXP for Pollo, Fritto, and Especia Bounty Hunting',
    shortName: 'Bounty Hunter 5x',
    category: 'hunting',
    icon: '/sunnySundayIcons/treasure-hunter.png',
  },
  INFERNO_WOLF_EXP: {
    id: 'inferno_wolf_exp',
    name: '5x EXP Inferno Wolf Exit EXP',
    shortName: 'Inferno Wolf 5x',
    category: 'hunting',
    icon: '/sunnySundayIcons/inferno-wolf.png',
  },
  STAR_FORCE_DISCOUNT: {
    id: 'star_force_discount',
    name: '30% off Star Force Enhancements',
    shortName: 'Star Force -30%',
    category: 'starforce',
    icon: '/sunnySundayIcons/star-force-discount.png',
  },
  STAR_FORCE_PROTECTION: {
    id: 'star_force_protection',
    name: '30% reduced chance of item destruction when enhancing items below 21-Stars',
    shortName: 'SF Protection',
    category: 'starforce',
    icon: '/sunnySundayIcons/star-force-protection.png',
  },
  STAR_FORCE_51015: {
    id: 'star_force_51015',
    name: '100% success on 5, 10, and 15-Star Force Enhancements',
    shortName: '5/10/15 Event',
    category: 'starforce',
    icon: '/sunnySundayIcons/star-force-discount.png',
  },
  STAR_FORCE_ONEPLUSONE: {
    id: 'star_force_oneplusone',
    name: '2 stars for successful 10-Star Force enhancements and lower',
    shortName: '1+1 Star Force',
    category: 'starforce',
    icon: '/sunnySundayIcons/star-force-discount.png',
  },
  // special combined event
  SHINING_STAR_FORCE: {
    id: 'shining_star_force',
    name: 'Shining Star Force (30% off + 30% destruction protection)',
    shortName: 'Shining Star Force',
    category: 'starforce',
    icon: '/sunnySundayIcons/special-sunny-sunday.png',
    isCombo: true,
    comboOf: ['star_force_discount', 'star_force_protection'],
  },
  OLD_SHINING_STAR_FORCE: {
    id: 'old_shining_star_force',
    name: 'Shining Star Force (30% off + 5/10/15)',
    shortName: 'Shining Star Force',
    category: 'starforce',
    icon: '/sunnySundayIcons/special-sunny-sunday.png',
    isCombo: true,
    comboOf: ['star_force_discount', 'star_force_51015'],
  },
};

// category display info with css variable-based colors
export const EVENT_CATEGORIES = {
  hunting: { name: 'Hunting', cssClass: 'category-hunting' },
  hexa: { name: 'HEXA Stat', cssClass: 'category-hexa' },
  starforce: { name: 'Star Force', cssClass: 'category-starforce' },
  enhancement: { name: 'Enhancement', cssClass: 'category-enhancement' },
  moncol: { name: 'Monster Collection', cssClass: 'category-moncol' },
  seasonal: { name: 'Seasonal', cssClass: 'category-seasonal' },
  item: { name: 'Item', cssClass: 'category-item' }
};

// helper to get category-based styling
export const getCategoryStyle = (category) => {
  const styles = {
    hunting: 'sunny-category-hunting',
    hexa: 'sunny-category-hexa',
    enhancement: 'sunny-category-enhancement',
    starforce: 'sunny-category-starforce',
    enhancement: 'sunny-category-enhancement',
    moncol: 'sunny-category-moncol',
    seasonal: 'sunny-category-seasonal',
    item: 'sunny-category-item'
  };
  return styles[category] || styles.utility;
};

// sunny sunday schedule data - add new sundays here
// format: { date: 'YYYY-MM-DD', events: [event ids or custom objects] }
export const sunnySundaySchedule = [
  {
    date: '2025-07-20',
    events: [
      'monster_park_exp',
      'rune_cooldown',
      'rune_exp',
      'combo_kill_exp',
      'bounty_hunter_exp',
      'inferno_wolf_exp',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-07-27',
    events: [
      'star_force_oneplusone',
      'spell_trace_discount',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-08-03',
    events: [
      'hexa_enhancement',
      {
        isCustom: true,
        name: 'Receive Sol Erda (Untradable)',
        shortName: 'Sol Erda Reward',
        icon: '/sunnySundayIcons/sol-erda.png',
        category: 'item',
      },
      'monsterblooms',
      'magnificent_souls',
      'ability_reset_discount',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-08-10',
    events: [
      'monster_park_exp',
      'rune_cooldown',
      'rune_exp',
      'combo_kill_exp',
      'bounty_hunter_exp',
      'inferno_wolf_exp',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-08-17',
    events: [
      'star_force_51015',
      'magnificent_souls',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-08-24',
    events: [
      'monster_park_exp',
      'rune_cooldown',
      'combo_kill_exp',
      'bounty_hunter_exp',
      'inferno_wolf_exp',
      {
        isCustom: true,
        name: "4x EXP obtained from Banquet's Blessing",
        shortName: 'Banquet EXP 4x',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'seasonal',
      },
      {
        isCustom: true,
        name: 'Receive Blue Hole Additional Entry Ticket',
        shortName: 'Blue Hole Ticket',
        icon: '/sunnySundayIcons/custom-event.png',
        category: 'item',
      },
    ],
    source: 'Patch Notes',
  },{
    date: '2025-08-31',
    events: ['star_force_oneplusone', 'monster_park_exp', 'bounty_hunter_exp', 'inferno_wolf_exp'],
    source: 'Patch Notes',
  },
  {
    date: '2025-09-07',
    events: ['star_force_discount', 'star_force_51015'],
    source: 'Patch Notes',
  },
  {
    date: '2025-09-14',
    events: [
      'rune_cooldown',
      'rune_exp',
      'combo_kill_exp',
      'spell_trace_discount',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-09-21',
    events: [
      'monster_park_exp',
      'bounty_hunter_exp',
      'inferno_wolf_exp',
      'ability_reset_discount',
    ],
    source: 'Patch Notes',
  },{
    date: '2025-09-28',
    events: [
      'star_force_discount',
      'hexa_enhancement',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-10-05',
    events: ['monster_park_exp', 'bounty_hunter_exp', 'inferno_wolf_exp'],
    source: 'Patch Notes',
  },
  {
    date: '2025-10-12',
    events: [
      'combo_kill_exp',
      'rune_exp',
      'rune_cooldown',
      'monster_collection',
      'monsterblooms',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-10-19',
    events: [
      'spell_trace_discount',
      'ability_reset_discount',
      'magnificent_souls',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-10-26',
    events: [
      'star_force_discount',
      'rune_cooldown',
      'rune_exp',
      'combo_kill_exp',
      'bounty_hunter_exp',
      'inferno_wolf_exp',
      'monster_park_exp',
      'sol_erda_2x',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-11-02',
    events: ['star_force_51015'],
    source: 'Patch Notes',
  },
  {
    date: '2025-11-09',
    events: [
      'monster_collection',
      'monsterblooms',
      'elite_monster_spawn',
      'spell_trace_discount',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-11-16',
    events: [
      'monster_park_exp',
      'rune_cooldown',
      'rune_exp',
      'treasure_hunter_exp',
      'sol_erda_2x',
      'combo_kill_exp',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-11-23',
    events: [
      'hexa_enhancement',
      'monster_park_exp',
      'ability_reset_discount',
      'magnificent_souls',
      'spell_trace_discount',
      'monster_collection',
      'monsterblooms',
      'elite_monster_spawn',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-11-30',
    events: [
      'star_force_discount',
      'star_force_protection',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-12-07',
    events: [
      'monster_park_exp',
      'rune_cooldown',
      'rune_exp',
      'combo_kill_exp',
      'sol_erda_2x',
    ],
    source: 'Patch Notes',
  },
  {
    date: '2025-12-14',
    events: [
      'treasure_hunter_exp',
      'monster_collection',
      'combo_kill_exp',
      'rune_cooldown',
      'star_force_discount',
      'rune_exp',
    ],
    source: 'Patch Notes',
  },
];

// helper to resolve event data from id or custom object
export const resolveEvent = (eventIdOrObject) => {
  if (typeof eventIdOrObject === 'object') {
    return eventIdOrObject;
  }

  const eventType = Object.values(SUNNY_SUNDAY_EVENT_TYPES).find(
    (e) => e.id === eventIdOrObject
  );

  return eventType || null;
};

// helper to check if a date has shining star force (both sf events)
export const hasShiningStarForce = (events) => {
  if (!Array.isArray(events)) return false;
  const resolvedEvents = events.map(resolveEvent).filter(Boolean);
  const hasDiscount = resolvedEvents.some((e) => e.id === 'star_force_discount');
  const hasProtection = resolvedEvents.some((e) => e.id === 'star_force_protection');
  const has51015 = resolvedEvents.some((e) => e.id === 'star_force_51015');
  return hasDiscount && (hasProtection || has51015);
};

// get all sundays between two dates
export const getSundaysBetween = (startDate, endDate) => {
  const sundays = [];
  const current = new Date(startDate);

  // move to first sunday
  const dayOfWeek = current.getDay();
  if (dayOfWeek !== 0) {
    current.setDate(current.getDate() + (7 - dayOfWeek));
  }

  while (current <= endDate) {
    sundays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return sundays;
};

// format date for display
export const formatSundayDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// format date short
export const formatSundayDateShort = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
