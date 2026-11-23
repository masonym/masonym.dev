// Quanah Season Jewels. The numbers are client data (Etc GMSSeasonalWorldInfo.img/SeasonJewel,
// as `jewels` in src/data/quanah.json); "color" is the five colours, "multi" is Prismatic.
//
// - Dismantling a jewel gives baseCost × typeCoef × recoveryRate%: 125 dust for a colour jewel and
//   750 for a Prismatic (confirmed in game). Dismantling equipment gives equipBonus.
// - UI/Enchant.img/GL_seasonJewel/tabDismantle/formula has a different set of numbers (40%, a 1000
//   cap, Prismatic ×2); it doesn't match the game and isn't used.
// - Which jewel rolls which line isn't in the client; it's hand-written in build-quanah.mjs.

export const TYPE_NAMES = { color: "Colour jewel", multi: "Prismatic Jewel" };

export const dismantleDust = (d, type) =>
  (d.baseCost * d.typeCoef[type] * d.recoveryRate) / 100;

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
