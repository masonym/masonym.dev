// Which job branch (Warrior, Magician, Bowman, Thief, Pirate) each class belongs to, keyed by
// the class's 4th-job ID as the Quanah skill data uses it (src/data/quanah.json `jobs`).
//
// Most IDs encode the branch in their hundreds digit (1xx warrior ... 5xx pirate), but not all:
// Luminous (2712) is a magician, Blaster (3712) a warrior and Xenon (3612) both thief and pirate,
// so the table is spelled out rather than computed. Xenon is listed under both.

export const BRANCHES = ["Warrior", "Magician", "Bowman", "Thief", "Pirate"];

export const JOB_BRANCHES = {
  // Warrior
  112: ["Warrior"], // Hero
  122: ["Warrior"], // Paladin
  132: ["Warrior"], // Dark Knight
  1112: ["Warrior"], // Dawn Warrior
  5112: ["Warrior"], // Mihile
  2112: ["Warrior"], // Aran
  3112: ["Warrior"], // Demon Slayer
  3122: ["Warrior"], // Demon Avenger
  3712: ["Warrior"], // Blaster
  6112: ["Warrior"], // Kaiser
  4112: ["Warrior"], // Hayato
  10112: ["Warrior"], // Zero
  15112: ["Warrior"], // Adele
  16112: ["Warrior"], // Ren
  18112: ["Warrior"], // Erel

  // Magician
  212: ["Magician"], // Arch Mage (Fire, Poison)
  222: ["Magician"], // Arch Mage (Ice, Lightning)
  232: ["Magician"], // Bishop
  1212: ["Magician"], // Blaze Wizard
  2217: ["Magician"], // Evan
  2712: ["Magician"], // Luminous
  3212: ["Magician"], // Battle Mage
  4212: ["Magician"], // Kanna
  14212: ["Magician"], // Kinesis
  15212: ["Magician"], // Illium
  16212: ["Magician"], // Lara
  17212: ["Magician"], // Lynn
  18212: ["Magician"], // Sia Astelle
  19212: ["Magician"], // Lethe

  // Bowman
  312: ["Bowman"], // Bowmaster
  322: ["Bowman"], // Marksman
  332: ["Bowman"], // Pathfinder
  1312: ["Bowman"], // Wind Archer
  2312: ["Bowman"], // Mercedes
  3312: ["Bowman"], // Wild Hunter
  6312: ["Bowman"], // Kain

  // Thief
  412: ["Thief"], // Night Lord
  422: ["Thief"], // Shadower
  434: ["Thief"], // Dual Blade
  1412: ["Thief"], // Night Walker
  2412: ["Thief"], // Phantom
  6412: ["Thief"], // Cadena
  15412: ["Thief"], // Khali
  16412: ["Thief"], // Hoyoung

  // Pirate
  512: ["Pirate"], // Buccaneer
  522: ["Pirate"], // Corsair
  532: ["Pirate"], // Cannon Master
  1512: ["Pirate"], // Thunder Breaker
  2512: ["Pirate"], // Shade
  3512: ["Pirate"], // Mechanic
  6512: ["Pirate"], // Angelic Buster
  15512: ["Pirate"], // Ark
  17512: ["Pirate"], // Mo Xuan

  3612: ["Thief", "Pirate"], // Xenon
};
