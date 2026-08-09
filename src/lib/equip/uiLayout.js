/**
 * Equipment window geometry, taken verbatim from UI.wz.
 *
 * Source: `UI/UIEquip.img/Equip/EquipTab`, extracted by WzDataExtractor/UIExtractor.
 *   - `canvas:equip`  the window background, 342x349, origin (-12,-61)
 *   - `Slots/<n>`     per-slot canvas whose origin gives the slot position
 *   - `SlotName/<n>`  the 42x42 label tile drawn in an empty slot
 *   - `SlotsText/<n>` the slot's display name
 *   - `SlotSize`      42
 *
 * WZ origins are negated positions, and are absolute within the window's
 * coordinate space. Subtracting the background's own origin (12, 61) converts
 * them to pixel offsets inside the background image, which is what the DOM
 * needs. Those converted values are what `x` / `y` hold below.
 */

export const SLOT_SIZE = 42;
export const WINDOW_WIDTH = 342;
export const WINDOW_HEIGHT = 349;

/**
 * Slots as the game lays them out.
 *
 * `wzIndex` is the WZ slot number, and doubles as the label sprite filename.
 * `slotKey` ties the slot to the engine's loadout keys; slots with no key are
 * real in game but have no items in our dataset (Android, which is purely
 * cosmetic), so they render as inert.
 *
 * `labelSprite` differs from `wzIndex` only where the WZ ships a single shared
 * label — every ring slot reuses sprite 12, the second pendant reuses 17.
 */
export const EQUIP_SLOT_LAYOUT = [
  // Left column: rings, belt, pocket
  { wzIndex: 16, slotKey: 'ring1', name: 'Ring', x: 15, y: 39, labelSprite: 12 },
  { wzIndex: 15, slotKey: 'ring2', name: 'Ring', x: 15, y: 84, labelSprite: 12 },
  { wzIndex: 13, slotKey: 'ring3', name: 'Ring', x: 15, y: 129, labelSprite: 12 },
  { wzIndex: 12, slotKey: 'ring4', name: 'Ring', x: 15, y: 174, labelSprite: 12 },
  { wzIndex: 22, slotKey: 'belt', name: 'Belt', x: 15, y: 219 },
  { wzIndex: 26, slotKey: 'pocket', name: 'Pocket Item', x: 15, y: 264 },

  // Second column: face / eye / earrings / pendants
  { wzIndex: 2, slotKey: 'face', name: 'Face Accessory', x: 60, y: 39 },
  { wzIndex: 3, slotKey: 'eye', name: 'Eye Accessory', x: 60, y: 84 },
  { wzIndex: 4, slotKey: 'earrings', name: 'Earrings', x: 60, y: 129 },
  { wzIndex: 31, slotKey: 'pendant2', name: 'Pendant', x: 60, y: 174, labelSprite: 17 },
  { wzIndex: 17, slotKey: 'pendant', name: 'Pendant', x: 60, y: 219 },

  // Centre row: weapon / secondary / emblem
  { wzIndex: 11, slotKey: 'weapon', name: 'Weapon', x: 105, y: 219 },
  { wzIndex: 10, slotKey: 'secondary', name: 'Secondary Weapon', x: 150, y: 219 },
  { wzIndex: 30, slotKey: 'emblem', name: 'Emblem', x: 195, y: 219 },

  // Right block: armour
  { wzIndex: 1, slotKey: 'hat', name: 'Hat', x: 240, y: 39 },
  { wzIndex: 5, slotKey: 'top', name: 'Top', x: 240, y: 84 },
  { wzIndex: 6, slotKey: 'bottom', name: 'Bottom', x: 240, y: 129 },
  { wzIndex: 23, slotKey: 'shoulder', name: 'Shoulder Accessory', x: 240, y: 174 },
  { wzIndex: 27, slotKey: null, name: 'Android', x: 240, y: 219 },

  { wzIndex: 9, slotKey: 'cape', name: 'Cape', x: 285, y: 39 },
  { wzIndex: 8, slotKey: 'gloves', name: 'Gloves', x: 285, y: 84 },
  { wzIndex: 7, slotKey: 'shoes', name: 'Shoes', x: 285, y: 129 },
  { wzIndex: 21, slotKey: 'medal', name: 'Medal', x: 285, y: 174 },
  { wzIndex: 28, slotKey: 'heart', name: 'Heart', x: 285, y: 219 },
  { wzIndex: 29, slotKey: 'badge', name: 'Badge', x: 285, y: 264 },
];

/** Loadout slot key → its layout entry. */
export const LAYOUT_BY_SLOT_KEY = Object.fromEntries(
  EQUIP_SLOT_LAYOUT.filter((s) => s.slotKey).map((s) => [s.slotKey, s]),
);

/** Public path of the 42x42 label tile drawn in an empty slot. */
export function slotLabelSprite(slot) {
  return `/equip-ui/slots/${slot.labelSprite ?? slot.wzIndex}.png`;
}

/**
 * Overall (`MaPn`) has no slot of its own — it occupies top and bottom. When one
 * is equipped the game shows it in the top slot and blanks the bottom.
 */
export const OVERALL_PRIMARY_SLOT = 'top';
