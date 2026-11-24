// The two games' cash shops. They share item ids and SNs for different items, so
// each has its own API snapshot and its own icons - never mix them.
const CLOUDFRONT_URL = "https://dkxt2zgwekugu.cloudfront.net";

export const SHOPS = {
  gms: {
    id: "gms",
    name: "GMS",
    title: "Cash Shop Sales",
    href: "/cash-shop",
    apiParams: {},
    imageUrl: `${CLOUDFRONT_URL}/images`,
    hasWorlds: true,
    // The earliest sale with dates in the game files (restored from old builds).
    historyStart: new Date(2019, 7, 1),
  },
  classic: {
    id: "classic",
    name: "Classic World",
    title: "Classic World Cash Shop Sales",
    href: "/cash-shop/classic",
    apiParams: { shop: "classic" },
    imageUrl: `${CLOUDFRONT_URL}/images-classic`,
    // Classic sales aren't restricted by world: its game files have no gameWorld.
    hasWorlds: false,
    // Founder's Access, the first build with Classic in it.
    historyStart: new Date(2026, 9, 6),
  },
};
