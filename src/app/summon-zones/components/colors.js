// Overlay colours. Fixed hsl rather than theme variables: they sit on the minimap image, which
// looks the same in both themes.
export const LINE_BOUNDARY = "hsl(300, 75%, 62%)";
export const LINE_TRANSITION = "hsl(185, 80%, 55%)";
export const SPAWN = "hsl(0, 85%, 58%)";
// markers by kind (see KINDS in lib/fieldsplit/summons.js), and Sol Janus: Dusk's range
export const KIND_COLOR = {
  you: "hsl(330, 90%, 70%)",
  dawn: "hsl(50, 100%, 60%)",
  other: "hsl(195, 90%, 70%)",
};
export const DUSK_COLOR = "hsl(275, 85%, 72%)";
export const rangeColor = (s) => (s.kind === "you" ? DUSK_COLOR : KIND_COLOR[s.kind]);
export const tint = (hsl, alpha) => hsl.replace("hsl(", "hsla(").replace(")", `, ${alpha})`);

export const ZONE_FILL = {
  visible: "hsla(126, 60%, 50%, 0.28)",
  depends: "hsla(38, 95%, 55%, 0.38)",
  hidden: "hsla(0, 75%, 50%, 0.42)",
};
export const SAFE_SPOT = "hsl(126, 60%, 55%)";
// a summon's state from where your character idles, as a ring around its marker
export const STANDING = {
  visible: "hsl(126, 70%, 55%)",
  depends: "hsl(38, 95%, 55%)",
  hidden: "hsl(0, 85%, 55%)",
};

export const STATUS = {
  hides: { label: "Map can hide summons", short: "Can hide", dot: "bg-progress-red" },
  unknown: { label: "Grid unknown", short: "Unknown", dot: "bg-progress-orange" },
  safe: { label: "Summons always visible", short: "Safe", dot: "bg-progress-green" },
};
