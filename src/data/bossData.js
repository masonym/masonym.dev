import { formatShortformNumber } from "@/utils";
// "UI.wz\UIWindow2.img\UserList" for little square images
//
//"C:\Users\Mason\Downloads\UI dump\UI.wz\_Canvas\UIBoss.img" // for banner images

// actual gene/destiny/astra UI elements in `UI\_Canvas\UIWeaponQuest.img`
// in KMS, boss icons are in `UI\_Canvas\UIBoss.img`

// hpPhases hold the original 30-minute HP values.
// hpReduction20Min is the approximate % HP reduction published for the bosses whose
// time limit was cut from 30 to 20 minutes (from the patch notes). Only the total
// reduction was published, so 20-min phase HP is estimated by scaling every phase by
// (1 - hpReduction20Min / 100). A phase can also set segments20Min when its HP bar
// is split differently in the 20-minute version (Will phase 1: 3 -> 2). See getHpPhases().
export const getHpPhases = (difficulty, timer = 20) => {
  const reduction = timer === 20 ? difficulty.hpReduction20Min : null;
  if (!reduction) return difficulty.hpPhases;
  const factor = 1 - reduction / 100;
  return difficulty.hpPhases.map((phase) => ({
    ...phase,
    hp: phase.hp * factor,
    segments: phase.segments20Min ?? phase.segments,
  }));
};

export const bossData = [
  {
    name: "Zakum",
    category: "pre-lomien",
    frequency: "weekly",
    level: 180,

    pdr: "100%",
    difficulties: [
      {
        name: "Chaos",
        hpReduction20Min: 32.5,
        intensePowerCrystalValue: 16200000,
        hpPhases: [{ hp: formatShortformNumber("84B") }],
      },
    ],
  },
  {
    name: "Magnus",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "120%",
    difficulties: [
      {
        name: "Hard",
        hpReduction20Min: 31.7,
        intensePowerCrystalValue: 19012500,
        hpPhases: [{ hp: formatShortformNumber("120B") }],
      },
    ],
  },
  {
    name: "Hilla",
    category: "pre-lomien",
    frequency: "daily",
    level: 190,

    pdr: "100%",
    difficulties: [
      {
        name: "Hard",
        intensePowerCrystalValue: 11250000,
        hpPhases: [{ hp: formatShortformNumber("16.8B") }],
      },
    ],
  },
  {
    name: "Papulatus",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "250%",
    difficulties: [
      {
        name: "Chaos",
        hpReduction20Min: 31.3,
        intensePowerCrystalValue: 26450000,
        hpPhases: [
          { hp: formatShortformNumber("378B") },
          { hp: formatShortformNumber("126B") },
        ],
      },
    ],
  },
  {
    name: "Pierre",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "80%",
    difficulties: [
      {
        name: "Chaos",
        intensePowerCrystalValue: 16200000,
        hpPhases: [{ hp: formatShortformNumber("80B") }],
      },
    ],
  },
  {
    name: "Von Bon",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "100%",
    difficulties: [
      {
        name: "Chaos",
        intensePowerCrystalValue: 16200000,
        hpPhases: [{ hp: formatShortformNumber("100B") }],
      },
    ],
  },
  {
    name: "Crimson Queen",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "120%",
    difficulties: [
      {
        name: "Chaos",
        intensePowerCrystalValue: 16200000,
        hpPhases: [{ hp: formatShortformNumber("140B") }],
      },
    ],
  },
  {
    name: "Vellum",
    category: "pre-lomien",
    frequency: "weekly",
    level: 190,

    pdr: "200%",
    difficulties: [
      {
        name: "Chaos",
        intensePowerCrystalValue: 21012500,
        hpPhases: [{ hp: formatShortformNumber("200B") }],
      },
    ],
  },
  {
    name: "Pink Bean",
    category: "pre-lomien",
    frequency: "daily",
    level: 190,

    pdr: "100%",
    difficulties: [
      {
        name: "Chaos",
        intensePowerCrystalValue: 12800000,
        hpPhases: [{ hp: formatShortformNumber("69.3B") }],
      },
    ],
  },
  {
    name: "Cygnus",
    category: "pre-lomien",
    frequency: "daily",
    level: 140,

    pdr: "100%",
    difficulties: [
      {
        name: "Normal",
        intensePowerCrystalValue: 14450000,
        hpPhases: [{ hp: formatShortformNumber("63B") }],
      },
    ],
  },
  {
    name: "Princess No",
    category: "pre-lomien",
    frequency: "weekly",
    level: 160,

    pdr: "100%",
    difficulties: [
      {
        name: "Normal",
        intensePowerCrystalValue: 16200000,
        hpPhases: [{ hp: formatShortformNumber("500B") }],
      },
    ],
  },
  {
    name: "Akechi Mitsuhide",
    category: "pre-lomien",
    frequency: "weekly",
    level: 210,

    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        intensePowerCrystalValue: 28800000,
        hpPhases: [
          { hp: formatShortformNumber("350B") },
          { hp: formatShortformNumber("350B") },
        ],
      },
    ],
  },
  {
    name: "Gollux",
    category: "pre-lomien",
    frequency: "weekly",
    difficulties: [
      {
        name: "Hard",
        level: 190,
        pdr: "150%",
        hpPhases: [
          { hp: formatShortformNumber("75B") },
          { hp: formatShortformNumber("75B") },
          { hp: formatShortformNumber("15B") },
        ],
      },
      {
        name: "Hell",
        level: 200,
        pdr: "250%",
        hpPhases: [
          { hp: formatShortformNumber("350B") },
          { hp: formatShortformNumber("350B") },
          { hp: formatShortformNumber("70B") },
        ],
      },
    ],
  },
  {
    name: "Lotus",
    category: "lomien-arcane",
    frequency: "weekly",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 31.6,
        intensePowerCrystalValue: 32512500,
        hpPhases: [
          { hp: formatShortformNumber("470B") },
          { hp: formatShortformNumber("470B") },
          { hp: formatShortformNumber("630B") },
        ],
        level: 210,
        pdr: "300%",
      },
      {
        name: "Hard",
        hpReduction20Min: 31.6,
        intensePowerCrystalValue: 88935000,
        hpPhases: [
          { hp: formatShortformNumber("10T") },
          { hp: formatShortformNumber("10T") },
          { hp: formatShortformNumber("13.5T") },
        ],
        level: 210,
        pdr: "300%",
      },
      {
        name: "Extreme",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 279500000,
        hpPhases: [
          { hp: formatShortformNumber("545T") },
          { hp: formatShortformNumber("545T") },
          { hp: formatShortformNumber("720T") },
        ],
        level: 285,
        pdr: "380%",
      },
    ],
  },
  {
    name: "Damien",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 210,
    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 31.5,
        intensePowerCrystalValue: 33800000,
        hpPhases: [
          { hp: formatShortformNumber("840B") },
          { hp: formatShortformNumber("360B") },
        ],
      },
      {
        name: "Hard",
        hpReduction20Min: 31.5,
        intensePowerCrystalValue: 84375000,
        hpPhases: [
          { hp: formatShortformNumber("25.2T") },
          { hp: formatShortformNumber("10.8T") },
        ],
      },
    ],
  },
  {
    name: "Guardian Angel Slime",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 220,
    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 31.4,
        intensePowerCrystalValue: 46334700,
        hpPhases: [{ hp: formatShortformNumber("5T") }],
      },
      {
        name: "Chaos",
        hpReduction20Min: 31.4,
        intensePowerCrystalValue: 120115625,
        hpPhases: [{ hp: formatShortformNumber("90T") }],
      },
    ],
  },
  {
    name: "Lucid",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 230,
    pdr: "300%",
    difficulties: [
      {
        name: "Easy",
        hpReduction20Min: 31.5,
        intensePowerCrystalValue: 47401875,
        hpPhases: [
          { hp: formatShortformNumber("6T") },
          { hp: formatShortformNumber("6T") },
        ],
        afRequirement: 360,
      },
      {
        name: "Normal",
        hpReduction20Min: 31.5,
        intensePowerCrystalValue: 50765625,
        hpPhases: [
          { hp: formatShortformNumber("12T") },
          { hp: formatShortformNumber("12T") },
        ],
        afRequirement: 360,
      },
      {
        name: "Hard",
        hpReduction20Min: 28.5,
        intensePowerCrystalValue: 100800000,
        hpPhases: [
          { hp: formatShortformNumber("50.8T") },
          { hp: formatShortformNumber("54T") },
          { hp: formatShortformNumber("12.8T") },
        ],
        afRequirement: 360,
      },
    ],
  },
  {
    name: "Will",
    category: "lomien-arcane",
    frequency: "weekly",
    pdr: "300%",
    difficulties: [
      {
        name: "Easy",
        hpReduction20Min: 32.9,
        intensePowerCrystalValue: 49348950,
        hpPhases: [
          {
            hp: formatShortformNumber("2.8T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Blue Dimension",
          },
          {
            hp: formatShortformNumber("2.8T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Purple Dimension",
          },
          { hp: formatShortformNumber("4.2T"), segments: 2, note: "Phase 2" },
          { hp: formatShortformNumber("7T"), note: "Phase 3" },
        ],
        level: 235,
        afRequirement: 560,
      },
      {
        name: "Normal",
        hpReduction20Min: 32.9,
        intensePowerCrystalValue: 55815000,
        hpPhases: [
          {
            hp: formatShortformNumber("4.2T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Blue Dimension",
          },
          {
            hp: formatShortformNumber("4.2T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Purple Dimension",
          },
          { hp: formatShortformNumber("6.3T"), segments: 2, note: "Phase 2" },
          { hp: formatShortformNumber("10.5T"), note: "Phase 3" },
        ],
        level: 250,
        afRequirement: 760,
      },
      {
        name: "Hard",
        hpReduction20Min: 32.9,
        intensePowerCrystalValue: 124362000,
        hpPhases: [
          {
            hp: formatShortformNumber("21T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Blue Dimension",
          },
          {
            hp: formatShortformNumber("21T"),
            segments: 3,
            segments20Min: 2,
            note: "Phase 1: Purple Dimension",
          },
          { hp: formatShortformNumber("31.5T"), segments: 2, note: "Phase 2" },
          { hp: formatShortformNumber("52.5T"), note: "Phase 3" },
        ],
        level: 250,
        afRequirement: 760,
      },
    ],
  },
  {
    name: "Gloom",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 255,
    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32.3,
        intensePowerCrystalValue: 59535000,
        hpPhases: [{ hp: formatShortformNumber("25.5T") }],
        afRequirement: 730,
      },
      {
        name: "Chaos",
        hpReduction20Min: 32.3,
        intensePowerCrystalValue: 112789000,
        hpPhases: [{ hp: formatShortformNumber("127.5T") }],
        afRequirement: 730,
      },
    ],
  },
  {
    name: "Darknell",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 265,
    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 31.3,
        intensePowerCrystalValue: 63375000,
        hpPhases: [{ hp: formatShortformNumber("26T") }],
        afRequirement: 850,
      },
      {
        name: "Hard",
        hpReduction20Min: 31.3,
        intensePowerCrystalValue: 133584000,
        hpPhases: [{ hp: formatShortformNumber("157.5T") }],
        afRequirement: 850,
      },
    ],
  },
  {
    name: "Verus Hilla",
    category: "lomien-arcane",
    frequency: "weekly",
    level: 250,
    pdr: "300%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 31.4,
        intensePowerCrystalValue: 116376000,
        hpPhases: [{ hp: formatShortformNumber("88T"), segments: 4 }],
        afRequirement: 820,
      },
      {
        name: "Hard",
        hpReduction20Min: 31.4,
        intensePowerCrystalValue: 152421000,
        hpPhases: [{ hp: formatShortformNumber("176T"), segments: 4 }],
        afRequirement: 900,
      },
    ],
  },
  {
    name: "Chosen Seren",
    category: "grandis",
    frequency: "weekly",
    pdr: "380%",
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32.1,
        intensePowerCrystalValue: 177804375,
        hp: formatShortformNumber("208T"),
        hpPhases: [
          { hp: formatShortformNumber("52.5T"), sac: 150 },
          { hp: formatShortformNumber("155.5T") },
        ],
        sacRequirement: 200,
        level: 270,
      },
      {
        name: "Hard",
        hpReduction20Min: 32.1,
        intensePowerCrystalValue: 219312000,
        hpPhases: [
          { hp: formatShortformNumber("126T"), sac: 150 },
          { hp: formatShortformNumber("357T") },
        ],
        sacRequirement: 200,
        level: 275,
      },
      {
        name: "Extreme",
        hpReduction20Min: 32.1,
        intensePowerCrystalValue: 847000000,
        hpPhases: [
          { hp: formatShortformNumber("1.32Q"), level: 275, sac: 150 },
          { hp: formatShortformNumber("5.16Q") },
        ],
        sacRequirement: 200,
        level: 280,
      },
    ],
  },
  {
    name: "Kalos the Guardian",
    category: "grandis",
    frequency: "weekly",
    pdr: "380%",
    difficulties: [
      {
        name: "Easy",
        hpReduction20Min: 33.2,
        intensePowerCrystalValue: 187500000,
        hpPhases: [
          { hp: formatShortformNumber("94.5T") },
          { hp: formatShortformNumber("262.5T"), segments: 4 },
        ],
        level: 270,
        sacRequirement: 200,
      },
      {
        name: "Normal",
        hpReduction20Min: 33.2,
        intensePowerCrystalValue: 260000000,
        hpPhases: [
          { hp: formatShortformNumber("336T"), sac: 250, level: 275 },
          { hp: formatShortformNumber("720T"), segments: 4 },
        ],
        level: 280,
        sacRequirement: 300,
      },
      {
        name: "Chaos",
        hpReduction20Min: 33.2,
        intensePowerCrystalValue: 520000000,
        hpPhases: [
          { hp: formatShortformNumber("1.06Q") },
          { hp: formatShortformNumber("4.06Q"), segments: 4 },
        ],
        level: 285,
        sacRequirement: 330,
      },
      {
        name: "Extreme",
        hpReduction20Min: 33.2,
        intensePowerCrystalValue: 1040000000,
        hpPhases: [
          { hp: formatShortformNumber("5.97Q") },
          { hp: formatShortformNumber("15.6Q"), segments: 4 },
        ],

        level: 285,
        sacRequirement: 440,
      },
    ],
  },
  {
    name: "First Adversary",
    category: "grandis",
    frequency: "weekly",
    pdr: "380%",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Easy",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 197000000,
        hpPhases: [
          { hp: formatShortformNumber("171T") },
          { hp: formatShortformNumber("171T") },
          { hp: formatShortformNumber("228T") },
        ],
        level: 270,
        sacRequirement: 220,
      },
      {
        name: "Normal",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 273000000,
        hpPhases: [
          { hp: formatShortformNumber("495T") },
          { hp: formatShortformNumber("495T") },
          { hp: formatShortformNumber("660T") },
        ],
        level: 280,
        sacRequirement: 320,
      },
      {
        name: "Hard",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 588000000,
        hpPhases: [
          { hp: formatShortformNumber("3.135Q") },
          { hp: formatShortformNumber("3.135Q") },
          { hp: formatShortformNumber("4.18Q") },
        ],
        level: 285,
        sacRequirement: 340,
      },
      {
        name: "Extreme",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 1176000000,
        hpPhases: [
          { hp: formatShortformNumber("10.08Q") },
          { hp: formatShortformNumber("10.08Q") },
          { hp: formatShortformNumber("13.4Q") },
        ],
        level: 290,
        sacRequirement: 460,
      },
    ],
  },
  {
    name: "Kaling",
    category: "grandis",
    frequency: "weekly",
    pdr: "380%",
    difficulties: [
      {
        name: "Easy",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 206250000,
        hpPhases: [
          {
            hp: formatShortformNumber("288T"),
            segments: 3,
            note: "Phase 1: Perils",
          },
          { hp: formatShortformNumber("105T") },
          { hp: formatShortformNumber("111T"), note: "Phase 3: Kaling" },
          {
            hp: formatShortformNumber("279.7T"),
            segments: 3,
            note: "Phase 3: Perils",
          },
        ],
        sacRequirement: 230,
        level: 275,
      },
      {
        name: "Normal",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 301300000,
        hpPhases: [
          {
            hp: formatShortformNumber("1.2Q"),
            segments: 3,
            note: "Phase 1: Perils",
          },
          { hp: formatShortformNumber("468T") },
          { hp: formatShortformNumber("462T"), note: "Phase 3: Kaling" },
          {
            hp: formatShortformNumber("1.198Q"),
            segments: 3,
            note: "Phase 3: Perils",
          },
        ],
        sacRequirement: 330,
        level: 285,
      },
      {
        name: "Hard",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 598000000,
        hpPhases: [
          {
            hp: formatShortformNumber("2.76Q"),
            segments: 3,
            note: "Phase 1: Perils",
          },
          { hp: formatShortformNumber("1.4Q") },
          { hp: formatShortformNumber("1.883Q"), note: "Phase 3: Kaling" },
          {
            hp: formatShortformNumber("4.22Q"),
            segments: 3,
            note: "Phase 3: Perils",
          },
        ],
        sacRequirement: 350,
        level: 285,
      },
      {
        name: "Extreme",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 1205200000,
        hpPhases: [
          {
            hp: formatShortformNumber("18.2Q"),
            segments: 3,
            note: "Phase 1: Perils",
          },
          { hp: formatShortformNumber("6.93Q") },
          { hp: formatShortformNumber("6.497Q"), note: "Phase 3: Kaling" },
          {
            hp: formatShortformNumber("15.6Q"),
            segments: 3,
            note: "Phase 3: Perils",
          },
        ],
        sacRequirement: 480,
        level: 285,
      },
    ],
  },
  {
    name: "Malefic Star",
    category: "grandis",
    frequency: "weekly",
    level: 280,
    pdr: "380%",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32,
        intensePowerCrystalValue: 290400000,
        sacRequirement: 400,
        hpPhases: [
          { hp: formatShortformNumber("657.6T") },
          { hp: formatShortformNumber("1.315Q") },
          { hp: formatShortformNumber("1.315Q") },
        ],
      },
      {
        name: "Hard",
        hpReduction20Min: 32,
        intensePowerCrystalValue: 798000000,
        sacRequirement: 550,
        hpPhases: [
          { hp: formatShortformNumber("2.948Q") },
          { hp: formatShortformNumber("5.896Q") },
          { hp: formatShortformNumber("5.896Q") },
        ],
      },
    ],
  },
  {
    name: "Limbo",
    category: "grandis",
    frequency: "weekly",
    pdr: "380%",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32.5,
        intensePowerCrystalValue: 420000000,
        hpPhases: [
          { hp: formatShortformNumber("1.94Q") },
          { hp: formatShortformNumber("1.94Q"), segments: 2 },
          { hp: formatShortformNumber("2.6Q") },
        ],
        level: 285,
        sacRequirement: 500,
      },
      {
        name: "Hard",
        hpReduction20Min: 32.5,
        intensePowerCrystalValue: 749000000,
        hpPhases: [
          { hp: formatShortformNumber("3.78Q") },
          { hp: formatShortformNumber("3.78Q"), segments: 2 },
          { hp: formatShortformNumber("4.99Q") },
        ],
        level: 285,
        sacRequirement: 500,
      },
    ],
  },
  {
    name: "Baldrix",
    category: "grandis",
    frequency: "weekly",
    level: 290,
    sacRequirement: 700,
    pdr: "380%",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 560000000,
        hpPhases: [
          { hp: formatShortformNumber("2.3798Q") },
          { hp: formatShortformNumber("2.5317Q") },
          { hp: formatShortformNumber("4.1454Q") },
        ],
      },
      {
        name: "Hard",
        hpReduction20Min: 32.2,
        intensePowerCrystalValue: 840000000,
        hpPhases: [
          { hp: formatShortformNumber("5.3446Q") },
          { hp: formatShortformNumber("5.6858Q") },
          { hp: formatShortformNumber("9.309Q") },
        ],
      },
    ],
  },

  {
    name: "Jupiter",
    category: "grandis",
    frequency: "weekly",
    level: 295,
    sacRequirement: 810,
    pdr: "380%",
    maxPartySize: 3,
    difficulties: [
      {
        name: "Normal",
        hpReduction20Min: 32,
        intensePowerCrystalValue: 591_000_000,
        hpPhases: [
          { hp: formatShortformNumber("2.0532Q") },
          { hp: formatShortformNumber("4.1064Q") },
          { hp: formatShortformNumber("4.1064Q") },
        ],
      },
      {
        name: "Hard",
        hpReduction20Min: 32,
        intensePowerCrystalValue: 1_205_200_000,
        hpPhases: [
          { hp: formatShortformNumber("9.88Q") },
          { hp: formatShortformNumber("19.76Q") },
          { hp: formatShortformNumber("19.76Q") },
        ],
      },
    ],
  },
  {
    name: "Kai",
    category: "seasonal",
    frequency: "weekly",
    pdr: "380%",
    maxPartySize: 1,
    difficulties: [
      {
        name: "Normal",
        hpPhases: [
          { hp: formatShortformNumber("63T") },
          { hp: formatShortformNumber("63T") },
        ],
        level: 270,
      },
      {
        name: "Hard",
        hpPhases: [
          { hp: formatShortformNumber("241.5T") },
          { hp: formatShortformNumber("241.5T") },
        ],
        level: 280,
      },
    ],
  },
  {
    name: "Mayrin",
    category: "seasonal",
    frequency: "weekly",
    pdr: "380%",
    difficulties: [
      {
        name: "Normal",
        hpPhases: [
          { hp: formatShortformNumber("58.925T") },
          { hp: formatShortformNumber("58.925T") },
        ],
        level: 270,
      },
      {
        name: "Hard",
        hpPhases: [
          { hp: formatShortformNumber("290T") },
          { hp: formatShortformNumber("290T") },
        ],
        level: 280,
      },
    ],
  },
  {
    name: "Black Mage",
    category: "lomien-arcane",
    frequency: "monthly",
    pdr: "300%",
    difficulties: [
      {
        name: "Hard",
        hpReduction20Min: 64.9,
        intensePowerCrystalValue: 900000000,
        hpPhases: [
          { hp: formatShortformNumber("63T"), level: 265 },
          { hp: formatShortformNumber("115.5T") },
          { hp: formatShortformNumber("157.5T") },
          { hp: formatShortformNumber("136.5T"), level: 265 },
        ],
        level: 275,
        afRequirement: 1320,
      },
      {
        name: "Extreme",
        hpReduction20Min: 32.3,
        intensePowerCrystalValue: 3600000000,
        hpPhases: [
          { hp: formatShortformNumber("1.18Q"), level: 275 },
          { hp: formatShortformNumber("1.19Q") },
          { hp: formatShortformNumber("1.285Q") },
          { hp: formatShortformNumber("1.152Q") },
        ],
        level: 280,
        afRequirement: 1320,
      },
    ],
  },
];
