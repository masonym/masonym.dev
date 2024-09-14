// classSkillGrowth.js

export const classSkillGrowth = {
    "Hero": {
        "originSkill": {
            "name": "Spirit Calibur",
            "level1": 1147,  // Example initial damage at level 1
            "growthPerLevel": 10  // Example damage increase per level
        },
        "masterySkills": [
            { "name": "HEXA Raging Blow", "level1": 1200, "growthPerLevel": 10 },
            { "name": "HEXA Rising Rage", "level1": 1300, "growthPerLevel": 10 }
        ]
    },
    "Dark Knight": {
        "originSkill": {
            "name": "Dead Space",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Gungnir's Descent", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Dark Impale", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Nightshade Explosion", "level1": 1800, "growthPerLevel": 15 }
        ]
    },
    "Paladin": {
        "originSkill": {
            "name": "Sacred Bastion",
            "level1": 1400,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Blast", "level1": 1500, "growthPerLevel": 12 },
            { "name": "HEXA Divine Judgment", "level1": 1600, "growthPerLevel": 12 },
            { "name": "HEXA Divine Charge", "level1": 1700, "growthPerLevel": 12 },
            { "name": "HEXA Divine Mark", "level1": 1800, "growthPerLevel": 12 }
        ]
    },
    "Arch Mage (Ice, Lightning)": {
        "originSkill": {
            "name": "Frozen Lightning",
            "level1": 1250,
            "growthPerLevel": 11
        },
        "masterySkills": [
            { "name": "HEXA Chain Lightning", "level1": 1350, "growthPerLevel": 11 },
            { "name": "HEXA Frozen Orb", "level1": 1450, "growthPerLevel": 11 },
            { "name": "HEXA Blizzard", "level1": 1550, "growthPerLevel": 11 }
        ]
    },
    "Arch Mage (Fire, Poison)": {
        "originSkill": {
            "name": "Infernal Venom",
            "level1": 1250,
            "growthPerLevel": 11
        },
        "masterySkills": [
            { "name": "HEXA Flame Sweep", "level1": 1350, "growthPerLevel": 11 },
            { "name": "HEXA Flame Haze", "level1": 1450, "growthPerLevel": 11 },
            { "name": "HEXA Mist Eruption", "level1": 1550, "growthPerLevel": 11 }
        ]
    },
    "Bishop": {
        "originSkill": {
            "name": "Holy Advent",
            "level1": 1300,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Angel Ray", "level1": 1400, "growthPerLevel": 13 },
            { "name": "HEXA Big Bang", "level1": 1500, "growthPerLevel": 13 },
            { "name": "HEXA Triumph Feather", "level1": 1600, "growthPerLevel": 13 }
        ]
    },
    "Pathfinder": {
        "originSkill": {
            "name": "Forsaken Relic",
            "level1": 1270,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Cardinal Burst", "level1": 1370, "growthPerLevel": 12 },
            { "name": "HEXA Bountiful Burst", "level1": 1470, "growthPerLevel": 12 },
            { "name": "HEXA Cardinal Deluge", "level1": 1570, "growthPerLevel": 12 },
            { "name": "HEXA Bountiful Deluge", "level1": 1670, "growthPerLevel": 12 }
        ]
    },
    "Marksman": {
        "originSkill": {
            "name": "Final Aim",
            "level1": 1400,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Snipe", "level1": 1500, "growthPerLevel": 14 },
            { "name": "HEXA Piercing Arrow", "level1": 1600, "growthPerLevel": 14 }
        ]
    },
    "Bowmaster": {
        "originSkill": {
            "name": "Ascendant Shadow",
            "level1": 1380,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Hurricane", "level1": 1480, "growthPerLevel": 13 },
            { "name": "HEXA Arrow Stream", "level1": 1580, "growthPerLevel": 13 },
            { "name": "HEXA Arrow Blaster", "level1": 1680, "growthPerLevel": 13 }
        ]
    },
    "Dual Blade": {
        "originSkill": {
            "name": "Karma Blade",
            "level1": 1430,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Phantom Blow", "level1": 1530, "growthPerLevel": 14 },
            { "name": "HEXA Asura's Anger", "level1": 1630, "growthPerLevel": 14 }
        ]
    },
    "Shadower": {
        "originSkill": {
            "name": "Halve Cut",
            "level1": 1320,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Assassinate", "level1": 1420, "growthPerLevel": 13 },
            { "name": "HEXA Pulverize", "level1": 1520, "growthPerLevel": 13 },
            { "name": "HEXA Meso Explosion", "level1": 1620, "growthPerLevel": 13 }
        ]
    },
    "Night Lord": {
        "originSkill": {
            "name": "Life and Death",
            "level1": 1350,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Quad Star", "level1": 1450, "growthPerLevel": 13 },
            { "name": "Enhanced HEXA Quad Star", "level1": 1550, "growthPerLevel": 13 },
            { "name": "HEXA Assassin's Mark", "level1": 1650, "growthPerLevel": 13 }
        ]
    },
    "Cannoneer": {
        originSkill: {
            name: "Super Cannon Explosion",
            components: [
                { damage: 992, attacks: 4, triggers: 68, growthPerLevel: 32 },
                { damage: 1147, attacks: 5, triggers: 52, growthPerLevel: 37 }
            ]
        },
        masterySkills: [
            {
                name: "HEXA Cannon Barrage",
                level0: 780, // Assuming it starts at 0 before first level
                level1: 863,
                attacks: 4,
                growthPerLevel: 13
            },
            {
                name: "HEXA Cannon Bazooka",
                level0: 800,
                level1: 1129,
                attacks: 4,
                growthPerLevel: 19
            },
            {
                name: "HEXA Monkey Mortar",
                level0: 360,
                level1: 1129,
                attacks: 5,
                growthPerLevel: 19
            },
            {
                name: "HEXA Anchors Away",
                level0: 300,
                level1: 600,
                attacks: 1,
                growthPerLevel: 19
            },
            {
                name: "HEXA Nautilus Strike",
                level0: 300,
                level1: 600,
                attacks: 1,
                growthPerLevel: 19
            },
        ],
        boostSkills: ["Cannon of Mass Destruction Boost", "The Nuclear Option Boost", "Monkey Business Boost", "Poolmaker Boost"]
    },
    "Buccaneer": {
        "originSkill": {
            "name": "Unleash Neptunus",
            "level1": 1380,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Octopunch", "level1": 1480, "growthPerLevel": 14 },
            { "name": "HEXA Sea Serpent", "level1": 1580, "growthPerLevel": 14 },
            { "name": "HEXA Nautilus Strike", "level1": 1680, "growthPerLevel": 14 }
        ]
    },
    "Corsair": {
        "originSkill": {
            "name": "The Dreadnought",
            "level1": 1400,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Rapid Fire", "level1": 1500, "growthPerLevel": 13 },
            { "name": "HEXA Broadside", "level1": 1600, "growthPerLevel": 13 }
        ]
    },
    "Dawn Warrior": {
        "originSkill": {
            "name": "Astral Blitz",
            "level1": 1450,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Luna Divide", "level1": 1550, "growthPerLevel": 15 },
            { "name": "HEXA Solar Slash", "level1": 1650, "growthPerLevel": 15 },
            { "name": "HEXA Cosmic Shower", "level1": 1750, "growthPerLevel": 15 }
        ]
    },
    "Thunder Breaker": {
        "originSkill": {
            "name": "Thunder Wall Sea Wave",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Annihilate", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Thunderbolt", "level1": 1700, "growthPerLevel": 15 }
        ]
    },
    "Night Walker": {
        "originSkill": {
            "name": "Silence",
            "level1": 1300,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Quintuple Star", "level1": 1400, "growthPerLevel": 13 },
            { "name": "HEXA Shadow Bat", "level1": 1500, "growthPerLevel": 13 },
            { "name": "HEXA Ravenous Bat", "level1": 1600, "growthPerLevel": 13 }
        ]
    },
    "Wind Archer": {
        "originSkill": {
            "name": "Mistral Spring",
            "level1": 1280,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Song of Heaven", "level1": 1380, "growthPerLevel": 12 },
            { "name": "HEXA Trifling Wind", "level1": 1480, "growthPerLevel": 12 }
        ]
    },
    "Blaze Wizard": {
        "originSkill": {
            "name": "Eternity",
            "level1": 1440,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Orbital Flame[2]", "level1": 1540, "growthPerLevel": 14 },
            { "name": "HEXA Orbital Flame[3]", "level1": 1640, "growthPerLevel": 14 },
            { "name": "HEXA Orbital Flame[4]", "level1": 1740, "growthPerLevel": 14 },
            { "name": "HEXA Orbital Flame[5]", "level1": 1840, "growthPerLevel": 14 },
            { "name": "HEXA Blazing Extinction", "level1": 1940, "growthPerLevel": 14 }
        ]
    },
    "Mihile": {
        "originSkill": {
            "name": "Durendal",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Radiant Cross", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Radiant Cross - Assault", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Royal Guard", "level1": 1800, "growthPerLevel": 15 }
        ]
    },
    "Mercedes": {
        "originSkill": {
            "name": "Unfading Glory",
            "level1": 1400,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Ishtar's Ring", "level1": 1500, "growthPerLevel": 14 },
            { "name": "HEXA Wrath of Enlil", "level1": 1600, "growthPerLevel": 14 },
            { "name": "HEXA Wrath of Enlil: Spirit Enchant", "level1": 1700, "growthPerLevel": 14 },
            { "name": "HEXA Spikes Royale", "level1": 1800, "growthPerLevel": 14 },
            { "name": "HEXA Spikes Royale: Spirit Enchant", "level1": 1900, "growthPerLevel": 14 },
            { "name": "HEXA Leaf Tornado", "level1": 2000, "growthPerLevel": 14 },
            { "name": "HEXA Leaf Tornado: Spirit Enchant", "level1": 2100, "growthPerLevel": 14 }
        ]
    },
    "Aran": {
        "originSkill": {
            "name": "Adrenaline Surge",
            "level1": 1450,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Beyond Blade", "level1": 1550, "growthPerLevel": 15 },
            { "name": "HEXA Finisher - Hunter's Prey", "level1": 1650, "growthPerLevel": 15 }
        ]
    },
    "Phantom": {
        "originSkill": {
            "name": "Defying Fate",
            "level1": 1350,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Tempest", "level1": 1450, "growthPerLevel": 13 },
            { "name": "HEXA Mille Aiguilles", "level1": 1550, "growthPerLevel": 13 },
            { "name": "HEXA Mille Aiguilles: Fortune", "level1": 1650, "growthPerLevel": 13 }
        ]
    },
    "Luminous": {
        "originSkill": {
            "name": "Harmonic Paradox",
            "level1": 1400,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Ender", "level1": 1500, "growthPerLevel": 14 },
            { "name": "HEXA Reflection", "level1": 1600, "growthPerLevel": 14 }
        ]
    },
    "Evan": {
        "originSkill": {
            "name": "Zodiac Burst",
            "level1": 1300,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Mana Burst", "level1": 1400, "growthPerLevel": 12 },
            { "name": "HEXA Thunder Circle", "level1": 1500, "growthPerLevel": 12 },
            { "name": "HEXA Dragon Flash", "level1": 1600, "growthPerLevel": 12 },
            { "name": "HEXA Thunder Flash", "level1": 1700, "growthPerLevel": 12 },
            { "name": "HEXA Wind Flash", "level1": 1800, "growthPerLevel": 12 }
        ]
    },
    "Shade": {
        "originSkill": {
            "name": "Advent of the Fox",
            "level1": 1480,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Spirit Claw", "level1": 1580, "growthPerLevel": 14 },
            { "name": "HEXA Spirit Frenzy", "level1": 1680, "growthPerLevel": 14 }
        ]
    },
    "Battle Mage": {
        "originSkill": {
            "name": "Crimson Pact",
            "level1": 1380,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Condemnation", "level1": 1480, "growthPerLevel": 13 },
            { "name": "HEXA Finishing Blow", "level1": 1580, "growthPerLevel": 13 },
            { "name": "HEXA Sweeping Staff", "level1": 1680, "growthPerLevel": 13 }
        ]
    },
    "Blaster": {
        "originSkill": {
            "name": "Final Destroyer",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Magnum Punch", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Double Blast", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Bunker Buster Explosion", "level1": 1800, "growthPerLevel": 15 }
        ]
    },
    "Mechanic": {
        "originSkill": {
            "name": "Ground Zero",
            "level1": 1400,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Heavy Salvo Plus", "level1": 1500, "growthPerLevel": 14 },
            { "name": "HEXA AP Salvo Plus", "level1": 1600, "growthPerLevel": 14 },
            { "name": "HEXA Homing Beacon", "level1": 1700, "growthPerLevel": 14 }
        ]
    },
    "Wild Hunter": {
        "originSkill": {
            "name": "Nature's Truth",
            "level1": 1350,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Wild Arrow Blast", "level1": 1450, "growthPerLevel": 13 },
            { "name": "HEXA Swipe", "level1": 1550, "growthPerLevel": 13 },
            { "name": "HEXA Dash 'n Slash", "level1": 1650, "growthPerLevel": 13 },
            { "name": "HEXA Sonic Roar", "level1": 1750, "growthPerLevel": 13 },
            { "name": "HEXA Jaguar Soul", "level1": 1850, "growthPerLevel": 13 },
            { "name": "HEXA Jaguar Rampage", "level1": 1950, "growthPerLevel": 13 },
            { "name": "HEXA Exploding Arrows", "level1": 2050, "growthPerLevel": 13 }
        ]
    },
    "Xenon": {
        "originSkill": {
            "name": "Artificial Evolution",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Mecha Purge: Snipe", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Mecha Purge: Execute", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Mecha Purge: Bombardment", "level1": 1800, "growthPerLevel": 15 },
            { "name": "HEXA Mecha Purge: Fire", "level1": 1900, "growthPerLevel": 15 },
            { "name": "HEXA Hypogram Field: Penetrate", "level1": 2000, "growthPerLevel": 15 },
            { "name": "HEXA Hypogram Field: Force Field", "level1": 2100, "growthPerLevel": 15 },
            { "name": "HEXA Hypogram Field: Support", "level1": 2200, "growthPerLevel": 15 },
            { "name": "HEXA Triangulation", "level1": 2300, "growthPerLevel": 15 }
        ]
    },
    "Demon Slayer": {
        "originSkill": {
            "name": "Nightmare",
            "level1": 1420,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Demon Impact", "level1": 1520, "growthPerLevel": 14 },
            { "name": "HEXA Demon Impact: Demon Chain", "level1": 1620, "growthPerLevel": 14 },
            { "name": "HEXA Demon Lash", "level1": 1720, "growthPerLevel": 14 },
            { "name": "HEXA Infernal Concussion", "level1": 1820, "growthPerLevel": 14 }
        ]
    },
    "Demon Avenger": {
        "originSkill": {
            "name": "Requiem",
            "level1": 1480,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Nether Shield", "level1": 1580, "growthPerLevel": 15 },
            { "name": "HEXA Exceed: Execution", "level1": 1680, "growthPerLevel": 15 }
        ]
    },
    "Angelic Buster": {
        "originSkill": {
            "name": "Grand Finale",
            "level1": 1550,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Trinity", "level1": 1650, "growthPerLevel": 15 },
            { "name": "HEXA Soul Seeker", "level1": 1750, "growthPerLevel": 15 },
            { "name": "HEXA Soul Seeker Expert", "level1": 1850, "growthPerLevel": 15 }
        ]
    },
    "Kaiser": {
        "originSkill": {
            "name": "Nova Triumphant",
            "level1": 1600,
            "growthPerLevel": 16
        },
        "masterySkills": [
            { "name": "HEXA Gigas Wave", "level1": 1700, "growthPerLevel": 16 },
            { "name": "HEXA Blade Burst", "level1": 1800, "growthPerLevel": 16 },
            { "name": "HEXA Tempest Blades", "level1": 1900, "growthPerLevel": 16 }
        ]
    },
    "Cadena": {
        "originSkill": {
            "name": "Chain Arts: Grand Arsenal",
            "level1": 1350,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Chain Arts: Thrash", "level1": 1450, "growthPerLevel": 13 },
            { "name": "HEXA Muscle Memory", "level1": 1550, "growthPerLevel": 13 }
        ]
    },
    "Kain": {
        "originSkill": {
            "name": "Total Annihilation",
            "level1": 1450,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Falling Dust", "level1": 1550, "growthPerLevel": 14 },
            { "name": "[Possess] HEXA Falling Dust", "level1": 1650, "growthPerLevel": 14 },
            { "name": "[Execute] HEXA Poison Needle", "level1": 1750, "growthPerLevel": 14 },
            { "name": "HEXA Strike Arrow", "level1": 1850, "growthPerLevel": 14 },
            { "name": "HEXA [Possess] Strike Arrow", "level1": 1950, "growthPerLevel": 14 },
            { "name": "HEXA Scattering Shot", "level1": 2050, "growthPerLevel": 14 },
            { "name": "HEXA [Possess] Scattering Shot", "level1": 2150, "growthPerLevel": 14 },
            { "name": "HEXA [Execute] Tearing Knife", "level1": 2250, "growthPerLevel": 14 },
            { "name": "HEXA [Execute] Chain Sickle", "level1": 2350, "growthPerLevel": 14 }
        ]
    },
    "Kanna": {
        "originSkill": {
            "name": "Hakumenkonmou Juubi",
            "level1": 1300,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Shikigami Haunting", "level1": 1400, "growthPerLevel": 12 },
            { "name": "HEXA Vanquisher's Charm", "level1": 1500, "growthPerLevel": 12 }
        ]
    },
    "Hayato": {
        "originSkill": {
            "name": "Jin Quick Draw",
            "level1": 1420,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Rai Sanrenzan", "level1": 1520, "growthPerLevel": 14 },
            { "name": "HEXA Rai Blade Flash", "level1": 1620, "growthPerLevel": 14 },
            { "name": "HEXA Shinsoku", "level1": 1720, "growthPerLevel": 14 }
        ]
    },
    "Adele": {
        "originSkill": {
            "name": "Maestro",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Cleave", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Magic Dispatch", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Aetherial Arms", "level1": 1800, "growthPerLevel": 15 },
            { "name": "HEXA Hunting Decree", "level1": 1900, "growthPerLevel": 15 },
            { "name": "HEXA Plummet", "level1": 2000, "growthPerLevel": 15 }
        ]
    },
    "Ark": {
        "originSkill": {
            "name": "Primordial Abyss",
            "level1": 1550,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Basic Charge Drive", "level1": 1650, "growthPerLevel": 15 },
            { "name": "HEXA Scarlet Charge Drive", "level1": 1750, "growthPerLevel": 15 },
            { "name": "HEXA Gust Charge Drive", "level1": 1850, "growthPerLevel": 15 },
            { "name": "HEXA Abyssal Charge Drive", "level1": 1950, "growthPerLevel": 15 },
            { "name": "HEXA Grievous Wound", "level1": 2050, "growthPerLevel": 15 },
            { "name": "HEXA Insatiable Hunger", "level1": 2150, "growthPerLevel": 15 },
            { "name": "HEXA Unbridled Chaos", "level1": 2250, "growthPerLevel": 15 }
        ]
    },
    "Illium": {
        "originSkill": {
            "name": "Mytocrystal Expanse",
            "level1": 1320,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Radiant Javelin", "level1": 1420, "growthPerLevel": 13 },
            { "name": "HEXA Radiant Enchanted Javelin", "level1": 1520, "growthPerLevel": 13 },
            { "name": "HEXA Winged Javelin", "level1": 1620, "growthPerLevel": 13 },
            { "name": "HEXA Winged Enchanted Javelin", "level1": 1720, "growthPerLevel": 13 },
            { "name": "HEXA Reaction - Destruction", "level1": 1820, "growthPerLevel": 13 },
            { "name": "HEXA Reaction - Domination", "level1": 1920, "growthPerLevel": 13 },
            { "name": "HEXA Vortex Wings", "level1": 2020, "growthPerLevel": 13 }
        ]
    },
    "Khali": {
        "originSkill": {
            "name": "Hex: Sandstorm",
            "level1": 1400,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Arts: Flurry", "level1": 1500, "growthPerLevel": 14 },
            { "name": "HEXA Arts: Crescentum", "level1": 1600, "growthPerLevel": 14 },
            { "name": "HEXA Void Rush", "level1": 1700, "growthPerLevel": 14 },
            { "name": "HEXA Void Blitz", "level1": 1800, "growthPerLevel": 14 },
            { "name": "HEXA Hex: Chakram Split", "level1": 1900, "growthPerLevel": 14 }
        ]
    },
    "Hoyoung": {
        "originSkill": {
            "name": "Sage: Apotheosis",
            "level1": 1450,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Heaven: Consuming Flames", "level1": 1550, "growthPerLevel": 14 },
            { "name": "HEXA Earth: Stone Tremor", "level1": 1650, "growthPerLevel": 14 },
            { "name": "HEXA Humanity: Gold-Banded Cudgel", "level1": 1750, "growthPerLevel": 14 },
            { "name": "HEXA Heaven: Iron Fan Gale", "level1": 1850, "growthPerLevel": 14 },
            { "name": "HEXA Earth: Ground-Shattering Wave", "level1": 1950, "growthPerLevel": 14 },
            { "name": "HEXA Humanity: As-You-Will Fan", "level1": 2050, "growthPerLevel": 14 }
        ]
    },
    "Lara": {
        "originSkill": {
            "name": "Universe in Bloom",
            "level1": 1350,
            "growthPerLevel": 13
        },
        "masterySkills": [
            { "name": "HEXA Essence Sprinkle", "level1": 1450, "growthPerLevel": 13 },
            { "name": "HEXA Dragon Vein Eruption", "level1": 1550, "growthPerLevel": 13 },
            { "name": "HEXA Eruption: Heaving River", "level1": 1650, "growthPerLevel": 13 },
            { "name": "HEXA Eruption: Whirlwind", "level1": 1750, "growthPerLevel": 13 },
            { "name": "HEXA Eruption: Sunrise Well", "level1": 1850, "growthPerLevel": 13 }
        ]
    },
    "Kinesis": {
        "originSkill": {
            "name": "From Another Realm",
            "level1": 1480,
            "growthPerLevel": 14
        },
        "masterySkills": [
            { "name": "HEXA Ultimate - Metal Press", "level1": 1580, "growthPerLevel": 14 },
            { "name": "HEXA Psychic Grab", "level1": 1680, "growthPerLevel": 14 },
            { "name": "HEXA Ultimate - Psychic Shot", "level1": 1780, "growthPerLevel": 14 }
        ]
    },
    "Zero": {
        "originSkill": {
            "name": "End Time",
            "level1": 1500,
            "growthPerLevel": 15
        },
        "masterySkills": [
            { "name": "HEXA Giga Crash", "level1": 1600, "growthPerLevel": 15 },
            { "name": "HEXA Falling Star", "level1": 1700, "growthPerLevel": 15 },
            { "name": "HEXA Groundbreaker", "level1": 1800, "growthPerLevel": 15 },
            { "name": "HEXA Wind Cutter", "level1": 1900, "growthPerLevel": 15 },
            { "name": "HEXA Wind Striker", "level1": 2000, "growthPerLevel": 15 },
            { "name": "HEXA Storm Break", "level1": 2100, "growthPerLevel": 15 },
            { "name": "HEXA Spin Driver", "level1": 2200, "growthPerLevel": 15 },
            { "name": "HEXA Wheel Wind", "level1": 2300, "growthPerLevel": 15 },
            { "name": "HEXA Rolling Cross", "level1": 2400, "growthPerLevel": 15 },
            { "name": "HEXA Rolling Assault", "level1": 2500, "growthPerLevel": 15 }
        ]
    },
    "Lynn": {
        "originSkill": {
            "name": "Source Flow",
            "level1": 1200,
            "growthPerLevel": 12
        },
        "masterySkills": [
            { "name": "HEXA Strike", "level1": 1300, "growthPerLevel": 12 },
            { "name": "HEXA Sneak Attack", "level1": 1400, "growthPerLevel": 12 }
        ]
    }
};
