// Quanah Season Jewels. The numbers are client data (Etc GMSSeasonalWorldInfo.img/SeasonJewel,
// as `jewels` in src/data/quanah.json); "color" is the five colours, "multi" is Prismatic.
//
// - Dismantling a jewel gives baseCost × typeCoef × recoveryRate% for every copy that went into it
//   (the jewel itself plus every copy used enhancing it), plus equipBonus when it's on equipment.
//   Jewels only level up on equipment and can't be taken off, so a loose jewel is always Lv. 1:
//   125 for a colour jewel, 750 for a Prismatic. A Lv. 2 colour jewel on equipment is
//   100 + 125 × 6 = 850 (confirmed in game).
// - UI/Enchant.img/GL_seasonJewel/tabDismantle/formula has a different set of numbers (40%, a 1000
//   cap, Prismatic ×2); it doesn't match the game and isn't used.
// - Which jewel rolls which line isn't in the client; it's hand-written in build-quanah.mjs.

// Copies used to enhance from Lv. 1: [{ level, copies, total }] for levels 2 to max.
export function enhanceSteps({ maxLevel, cost }) {
  const steps = [];
  let total = 0;
  for (let level = 2; level <= maxLevel; level++) {
    total += cost[level];
    steps.push({ level, copies: cost[level], total });
  }
  return steps;
}

// Copies in a jewel at each level, counting itself: [{ level: 1, copies: 1 }, { level: 2, copies: 6 }, ...]
export const copiesByLevel = (enhance) => [
  { level: 1, copies: 1 },
  ...enhanceSteps(enhance).map((s) => ({
    level: s.level,
    copies: s.total + 1,
  })),
];

export const dismantleDust = (d, type, copies = 1, onEquipment = false) =>
  (d.baseCost * d.typeCoef[type] * d.recoveryRate * copies) / 100 +
  (onEquipment ? d.equipBonus[1] : 0);
