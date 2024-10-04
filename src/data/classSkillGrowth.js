export const classSkillGrowth = {
    "Hero": {
        "originSkill": {
            "name": "Spirit Calibur",
            "components": [
                {
                    "damage": 240,
                    "attacks": 14,
                    "triggers": 33,
                    "growthPerLevel": 8
                },
                {
                    "damage": 238,
                    "attacks": 15,
                    "triggers": 48,
                    "growthPerLevel": 8
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Raging Blow",
                "level0": 344,
                "level1": 387,
                "attacks": 4,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rising Rage",
                "level0": 125,
                "level1": 138,
                "attacks": 32,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Raging Blow",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 32,
                        "growthPerLevel": 4
                    }
                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Burning Soul Blade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Instinctual Combo Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Worldreaver Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Sword Illusion Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Dark Knight": {
        "originSkill": {
            "name": "Dead Space",
            "components": [
                {
                    "damage": 620,
                    "attacks": 6,
                    "triggers": 6,
                    "growthPerLevel": 20
                },
                {
                    "damage": 542,
                    "attacks": 14,
                    "triggers": 58,
                    "growthPerLevel": 17
                }
            ]
        },
        "masterySkills": [
            {
                // do we need to increase this by 10% 
                // gungnir: 110% of max hp for every attack
                // hexa gungnir: 120% of map hp
                "name": "HEXA Gungnir's Descent",
                "level0": 225,
                "level1": 245,
                "attacks": 12,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0.33,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Dark Impale",
                "level0": 280,
                "level1": 307,
                "attacks": 6,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Nightshade Explosion",
                "level0": 330,
                "level1": 348,
                "attacks": 12,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 60,
                "staticBossDamage": 30,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Gungnir's Descent",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 58,
                        "growthPerLevel": 3
                    }
                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Spear of Darkness Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Radiant Evil Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Calamitous Cyclone Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Darkness Aura Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Paladin": {
        "originSkill": {
            "name": "Sacred Bastion",
            "components": [
                {
                    "damage": 410,
                    "attacks": 9,
                    "triggers": 28,
                    "growthPerLevel": 13
                },
                {
                    "damage": 460,
                    "attacks": 14,
                    "triggers": 17,
                    "growthPerLevel": 15
                },
                {
                    "damage": 640,
                    "attacks": 13,
                    "triggers": 60,
                    "growthPerLevel": 20
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Blast",
                "level0": 305,
                "level1": 349,
                "attacks": 10,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Divine Judgment",
                "level0": 550,
                "level1": 600,
                "attacks": 10,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 20,
            },
            {
                "name": "HEXA Divine Charge",
                "level0": 410,
                "level1": 463,
                "attacks": 4,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Divine Mark",
                "level0": 420,
                "level1": 488,
                "attacks": 7,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // i have no idea how to calculate this
                "name": "Divine Echo Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Hammers of the Righteous Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Grand Guardian Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Mighty Mjolnir Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Arch Mage (Ice, Lightning)": {
        "originSkill": {
            "name": "Frozen Lightning",
            "components": [
                {
                    "damage": 409,
                    "attacks": 7,
                    "triggers": 32,
                    "growthPerLevel": 14
                },
                {
                    "damage": 412,
                    "attacks": 12,
                    "triggers": 24,
                    "growthPerLevel": 14
                },
                {
                    "damage": 896,
                    "attacks": 15,
                    "triggers": 15,
                    "growthPerLevel": 28
                }

            ]
        },
        "masterySkills": [
            {
                // we're putting an extra bit of sauce on the level 1 here due to Current Zone 
                // https://maplestorywiki.net/w/HEXA_Chain_Lightning
                // current zone has a 20% chance to appear, and does 4 hits of 82% at level 1
                // so we're adding around 21%?
                // (248 * 10) / (.2 * 4 * 82) = 37
                // 
                "name": "HEXA Chain Lightning",
                "level0": 220,
                "level1": 268,
                "attacks": 10,
                "growthPerLevel": 3.1,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Frozen Orb",
                "level0": 220,
                "level1": 254,
                "attacks": 20,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Blizzard",
                "level0": 340,
                "level1": 522,
                "attacks": 12,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // this may need adjusting
                // lightning orb has two components
                // hold damage and explosion damage
                // lightning orb also isn't affected by its own mastery
                // meaning it won't show up in our damage distribution.....
                // fml
                "additionalEffects": [
                    {
                        "targetSkill": "Lightning Orb",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 26,
                        "growthPerLevel": 0.5
                    },
                    {
                        "targetSkill": "Lightning Orb",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 37.5,
                        "growthPerLevel": 1
                    },

                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Ice Age Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Bolt Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Spirit of Snow Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Jupiter Thunder Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Arch Mage (Fire, Poison)": {
        "originSkill": {
            "name": "Infernal Venom",
            "components": [
                {
                    "damage": 279,
                    "attacks": 12,
                    "triggers": 17,
                    "growthPerLevel": 9
                },
                {
                    "damage": 269,
                    "attacks": 15,
                    "triggers": 142,
                    "growthPerLevel": 9
                },

            ]
        },
        "masterySkills": [
            {
                // this skill has an extra trigger which is annoying
                // because i dont know how often it triggers

                // giant flame ember happens every 3rd hit
                // giant flame ember causes debuff that does (143 * 8) dmg when mist eruption hits
                // mist eruption has a 10s cd 
                // so this hits uhhhhh 1/10th as often? idk
                "name": "HEXA Flame Sweep",
                "level0": 391, // 220 + 171 -- (171 comes from 240% burn * 5, divided by the 7 attack count of the normal skill)
                "level1": 425, // 239 + (261 * 5 / 7)
                "attacks": 7,
                "growthPerLevel": 8.2, // 4 + (6 * 5 / 7) = 8.2
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // great flame sweep damage
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Flame Sweep",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 16.3, // (143 * 8 / 7) / 10
                        "growthPerLevel": 0.9, // (8 * 8 / 7) / 10
                    },

                ]
            },
            {
                // need to verify if the continuous damage procs once per second
                "name": "HEXA Flame Haze",
                "level0": 335, // (202 + (200 * 10 / 15))
                "level1": 358, // (219 + (209 * 10 / 15))
                "attacks": 15,
                "growthPerLevel": 6.7, // (4 + (4 * 10 / 15))
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // this skill gives 170% fd vs the 4th job's 125% fd
            // so all values should be multiplied by 1.36?
            // skill explodes twice
            {
                "name": "HEXA Mist Eruption",
                "level0": 250,
                "level1": 348,
                "attacks": 10,
                "growthPerLevel": 4.08,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 45,
            }
        ],
        "boostSkills": [
            {
                "name": "DoT Punisher Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Poison Nova Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Elemental Fury Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Poison Chain Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Bishop": {
        "originSkill": {
            "name": "Holy Advent",
            "components": [
                {
                    "damage": 280,
                    "attacks": 8,
                    "triggers": 25,
                    "growthPerLevel": 10
                },
                {
                    "damage": 243,
                    "attacks": 12,
                    "triggers": 35,
                    "growthPerLevel": 8
                },
                // archangel of balance
                {
                    "damage": 254,
                    "attacks": 14,
                    "triggers": 20,
                    "growthPerLevel": 9
                },
                // avenging archangel 
                {
                    "damage": 268,
                    "attacks": 12,
                    "triggers": 12,
                    "growthPerLevel": 13
                },
                // archangel of benevolence
                {
                    "damage": 310,
                    "attacks": 12,
                    "triggers": 15,
                    "growthPerLevel": 10
                },

            ]
        },
        "masterySkills": [
            // every 12 hits, Angel of Judgment appears
            {
                "name": "HEXA Angel Ray",
                "level0": 225,
                "level1": 239,
                "attacks": 14,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // triggers every 12 hits
                // 10 attacks instead of 14
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Angel Ray",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 33.5, // (559 * 10 / 14) / 12
                        "growthPerLevel": 0.5, // (9 * 10 / 14) / 12
                    },
                ]
            },
            {
                // holy explosion triggers every 6s
                "name": "HEXA Big Bang",
                "level0": 480,
                "level1": 530,
                "attacks": 4,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Big Bang",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 113.5, // (454 * 6 / 4) / 6
                        "growthPerLevel": 2.25, // (9 * 6 / 4) / 6
                    },
                ]
            },
            {
                // 100% uptime?
                // 4th job: 4 feathers * 230% * 4 attacks
                // 6th job: 6 feathers * 396% * 4 attacks
                "name": "HEXA Triumph Feather",
                "level0": 920,
                "level1": 1386, // fd reduced by half for subsequent hits, so 396 + (396 / 2 * 5)
                "attacks": 4,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // needs edge case; increases FD when using bene
                "name": "Benediction Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Angel of Balance Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Peacemaker Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Divine Punishment Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Pathfinder": {
        "originSkill": {
            "name": "Forsaken Relic",
            "components": [
                {
                    "damage": 801,
                    "attacks": 9,
                    "triggers": 24,
                    "growthPerLevel": 26
                },
                {
                    "damage": 791,
                    "attacks": 14,
                    "triggers": 30,
                    "growthPerLevel": 26
                },
                // TODO:
                // relic liberation
                // may need to adjust this
                // has scaling FD and idk how many times it procs in 30s
                {
                    "damage": 837,
                    "attacks": 5,
                    "triggers": 1,
                    "growthPerLevel": 27
                },
                // ancient wrath
                {
                    "damage": 671,
                    "attacks": 15,
                    "triggers": 9,
                    "growthPerLevel": 21
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Cardinal Burst",
                "level0": 200,
                "level1": 671,
                "attacks": 5,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Bountiful Burst",
                "level0": 300, // 150 * 2 arrows
                "level1": 413, // 243 + (243 * .7)
                "attacks": 3,
                "growthPerLevel": 6, // 3% * 2 arrows
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // TODO: scale num cursed arrows
                // triggers every 20s
                // the num of cursed arrows also increases with level
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Bountiful Burst",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 48.8, // 122 * 6 * 4 / 3 / 20
                        "growthPerLevel": 0.8, // 2 * 6 * 4 / 3 / 20
                    },
                ]
            },
            {
                // 4 magic arrows instead of 3
                "name": "HEXA Cardinal Deluge",
                "level0": 200, // 
                "level1": 330, //
                "attacks": 3,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Bountiful Deluge",
                "level0": 300, // 100 * 3 arrows
                "level1": 582, // 188 * + (188 * .7) * 3 
                "attacks": 1,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Nova Blast Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Raven Tempest Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // TODO:
                // does this need to be modified? not sure
                "name": "Obsidian Barrier Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Relic Unbound Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Marksman": {
        "originSkill": {
            "name": "Final Aim",
            "components": [
                {
                    "damage": 806,
                    "attacks": 7,
                    "triggers": 35,
                    "growthPerLevel": 26
                },
                {
                    "damage": 869,
                    "attacks": 13,
                    "triggers": 35,
                    "growthPerLevel": 29
                },
                // split shot x13
                {
                    "damage": 1320,
                    "attacks": 5,
                    "triggers": 13,
                    "growthPerLevel": 0
                },

            ]
        },
        "masterySkills": [
            {
                // first snipe: Snipe
                // second snipe: Empowered Snipe
                // third snipe: Snipe?
                // fourth snipe: Ultimate Snipe x2


                // snipe: 487 * 9 ; scales 2%
                // empowered: 489 * 10 + 322 * 5 ; scales 4%
                // ultimate: (257 * 10 * 2) + (322 * 5) ; scales 4%
                // additional hit (322 *5) ; scales 2% 

                // so every 4 hits:
                // ((487 * 9) * 2) + (489 + 10) + (257 * 10 * 2) + (322 * 5 * 2)
                // level 2
                // ((489 * 9) * 2) + (491 + 10) + (259 * 10 * 2) + (324 * 5 * 2)

                "name": "HEXA Snipe",
                "level0": 4320,
                "level1": 4406, // average snipe 
                "attacks": 1,
                "growthPerLevel": 24.5, // 98 / 4
                "iedGrowthPerLevel": 0.333,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 30,
            },
            {
                // same concept as snipe
                // first piercing arrow: piercing arrow
                // second: empowered
                // third: piercing arrow
                // fourth: ultimate

                // piercing arrow: (381 * 5) ; scale 6 + (392 * 4) ; scales 7
                // empowered: (467 * 6) ; scales 7 + (309 * 10) ; scales 4
                // ultimate: (477 * 6) ; scales 7 + (324 * 10) ; scales 4

                // so every 4 hits:
                // ((381 * 5) + (392 * 4) * 2)  -- PA x2
                // + (467 * 6) + (309 * 10) -- empwoered PA
                // + (477 * 6) + (324 * 10) -- ultimate PA
                // ((381 * 5) + (392 * 4) * 2) + (467 * 6) + (309 * 10) + (477 * 6) + (324 * 10)
                // scales (6 + 7 + 7 + 4 + 7 + 4 + 6 + 7) = 48
                // ((387 * 5) + (399 * 4) * 2) + (477 * 6) + (313 * 10) + (484 * 6) + (328 * 10)

                // avg: 4258.75 + 67*level

                // TODO: double check exploding arrow fragments
                "name": "HEXA Piercing Arrow",
                "level0": 520,
                "level1": 4258.75,
                "attacks": 1,
                "growthPerLevel": 67,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Snipe",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 30, // 12 / 4 * 10?
                        "growthPerLevel": 30, // 
                    },
                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Perfect Shot Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Split Shot Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Surge Bolt Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Repeating Crossbow Cartridge Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Bowmaster": {
        "originSkill": {
            "name": "Ascendant Shadow",
            "components": [
                {
                    "damage": 1380,
                    "attacks": 14,
                    "triggers": 39,
                    "growthPerLevel": 24
                },
                {
                    "damage": 789,
                    "attacks": 8,
                    "triggers": 70,
                    "growthPerLevel": 26
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Hurricane",
                "level0": 350,
                "level1": 372,
                "attacks": 1,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // TODO: also increases final attack damage
            {
                "name": "HEXA Arrow Stream",
                "level0": 350,
                "level1": 436,
                "attacks": 5,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // idk what to put as the attack number for this
            // i think 1 is fine
            {
                "name": "HEXA Arrow Blaster",
                "level0": 181,
                "level1": 208,
                "attacks": 1,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Storm of Arrows Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Inhuman Speed Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Quiver Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Silhouette Mirage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Dual Blade": {
        "originSkill": {
            "name": "Karma Blade",
            "components": [
                {
                    "damage": 496,
                    "attacks": 5,
                    "triggers": 6,
                    "growthPerLevel": 16
                },
                {
                    "damage": 465,
                    "attacks": 7,
                    "triggers": 20,
                    "growthPerLevel": 15
                },
                // karma blade; procs 50 times
                {
                    "damage": 451,
                    "attacks": 7,
                    "triggers": 50,
                    "growthPerLevel": 16
                },
                // god of hellfire
                {
                    "damage": 578,
                    "attacks": 7,
                    "triggers": 30,
                    "growthPerLevel": 18
                },



            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Phantom Blow",
                "level0": 330,
                "level1": 1530,
                "attacks": 6,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0.3,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 31,
            },
            {
                "name": "HEXA Asura's Anger",
                "level0": 693,
                "level1": 1630,
                "attacks": 5,
                "growthPerLevel": 21,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Phantom Blow",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 48,
                        "growthPerLevel": 2
                    }
                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Blade Storm Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Blades of Destiny Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Blade Tornado Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Haunted Edge Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Shadower": {
        "originSkill": {
            "name": "Halve Cut",
            "components": [
                {
                    "damage": 496,
                    "attacks": 6,
                    "triggers": 23,
                    "growthPerLevel": 16
                },
                {
                    "damage": 405,
                    "attacks": 6,
                    "triggers": 32,
                    "growthPerLevel": 13
                },
                {
                    "damage": 444,
                    "attacks": 7,
                    "triggers": 55,
                    "growthPerLevel": 14
                },


            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Assassinate",
                "level0": 380, // 270 / 2 + 490 / 2
                "level1": 139.5, // 217 / 2
                "attacks": 6,
                "growthPerLevel": 2,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // every other hit
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Assassinate",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 258, // 516 / 2
                        "growthPerLevel": 3
                    }
                ]
            },
            {
                "name": "HEXA Pulverize",
                "level0": 380,
                "level1": 153, // 306 / 2
                "attacks": 6,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Pulverize",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 301.5, // 603 / 2
                        "growthPerLevel": 4
                    }
                ]
            },
            {
                "name": "HEXA Meso Explosion",
                "level0": 100,
                "level1": 155,
                "attacks": 2,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0.3,
                "staticBossDamage": 31
            }
        ],
        "boostSkills": [
            {
                // TODO: maybe account for cooldown reduction & consecutive uses
                "name": "Shadow Assault Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Trickblade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Sonic Blow Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Slash Shadow Formation Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Night Lord": {
        "originSkill": {
            "name": "Life and Death",
            "components": [
                {
                    "damage": 600,
                    "attacks": 7,
                    "triggers": 33,
                    "growthPerLevel": 20
                },
                {
                    "damage": 607,
                    "attacks": 35,
                    "triggers": 31,
                    "growthPerLevel": 19
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Quad Star",
                "level0": 540,
                "level1": 547,
                "attacks": 4,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Enhanced HEXA Quad Star",
                "level0": 0,
                "level1": 700,
                "attacks": 4,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // % of mark goes up from 4th to 6th but does not scale
            {
                "name": "HEXA Assassin's Mark",
                "level0": 300, // 150 * 2
                "level1": 383,
                "attacks": 3,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Throwing Star Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Shurrikane Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Dark Lord's Omen Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Throw Blasting Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Cannoneer": {
        "originSkill": {
            "name": "Super Cannon Explosion",
            "components": [
                {
                    "damage": 992,
                    "attacks": 4,
                    "triggers": 68,
                    "growthPerLevel": 32
                },
                {
                    "damage": 1147,
                    "attacks": 5,
                    "triggers": 52,
                    "growthPerLevel": 37
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Cannon Barrage",
                "level0": 780,
                "level1": 863,
                "attacks": 4,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0.33,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Cannon Bazooka",
                "level0": 545,
                "level1": 608,
                "attacks": 4,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Monkey Mortar",
                "level0": 360,
                "level1": 1129,
                "attacks": 5,
                "growthPerLevel": 19,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Anchors Away",
                "level0": 460,
                "level1": 810,
                "attacks": 1,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Nautilus Strike",
                "level0": 510,
                "level1": 567,
                "attacks": 5,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Cannon of Mass Destruction Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "The Nuclear Option Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Monkey Business Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Poolmaker Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // 3% FD increase every 3 levels
                "auxiliaryBoost": {
                    "threshold": 3,
                    "increase": 0.03
                }
            }
        ]
    },
    "Buccaneer": {
        "originSkill": {
            "name": "Unleash Neptunus",
            "components": [
                {
                    "damage": 713,
                    "attacks": 13,
                    "triggers": 4,
                    "growthPerLevel": 23
                },
                {
                    "damage": 589,
                    "attacks": 15,
                    "triggers": 22,
                    "growthPerLevel": 19
                },
                {
                    "damage": 1380,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                },
                // neptunus enrage - procs 7 times?
                // 1st hit
                {
                    "damage": 897,
                    "attacks": 12,
                    "triggers": 7,
                    "growthPerLevel": 27
                },
                // 2nd hit
                {
                    "damage": 930,
                    "attacks": 13,
                    "triggers": 7,
                    "growthPerLevel": 30
                },
                // 3rd hit
                {
                    "damage": 992,
                    "attacks": 15,
                    "triggers": 7,
                    "growthPerLevel": 32
                },
                // 4th hit
                {
                    "damage": 992,
                    "attacks": 15,
                    "triggers": 7,
                    "growthPerLevel": 32
                },
                // 5th hit
                {
                    "damage": 1136,
                    "attacks": 15,
                    "triggers": 7,
                    "growthPerLevel": 36
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Octopunch",
                "level0": 320,
                "level1": 339,
                "attacks": 10,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // 2-part skill so we're consolidating
            {
                "name": "Super Octopunch",
                "level0": 3200,
                "level1": 3939, // (183 * 3) + (339 * 10)
                "attacks": 1,
                "growthPerLevel": 49,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Sea Serpent Burst",
                "level0": 425,
                "level1": 483,
                "attacks": 8,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Sea Serpent's Rage",
                "level0": 430,
                "level1": 493,
                "attacks": 6,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Nautilus Strike",
                "level0": 1512,
                "level1": 1680,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Lightning Form Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Lord of the Deep Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Serpent Vortex Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Howling Fist Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Corsair": {
        "originSkill": {
            "name": "The Dreadnought",
            "components": [
                {
                    "damage": 661,
                    "attacks": 12,
                    "triggers": 52,
                    "growthPerLevel": 21
                },
                {
                    "damage": 775,
                    "attacks": 8,
                    "triggers": 80,
                    "growthPerLevel": 25
                },
            ]
        },
        "masterySkills": [
            // TODO: this skill affects Majestic Presence; non hexa skill
            {
                "name": "HEXA Rapid Fire",
                "level0": 375,
                "level1": 381,
                "attacks": 1,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Broadside",
                "level0": 400,
                "level1": 550,
                "attacks": 3,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Bullet Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Target Lock Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Nautilus Assault Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Death Trigger Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Dawn Warrior": {
        "originSkill": {
            "name": "Astral Blitz",
            "components": [
                {
                    "damage": 1085,
                    "attacks": 5,
                    "triggers": 48,
                    "growthPerLevel": 35
                },
                {
                    "damage": 1076,
                    "attacks": 7,
                    "triggers": 24,
                    "growthPerLevel": 34
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Luna Divide",
                "level0": 485,
                "level1": 540,
                "attacks": 6,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Solar Slash",
                "level0": 485,
                "level1": 540,
                "attacks": 6,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Cosmic Shower",
                "level0": 210,
                "level1": 305,
                "attacks": 3,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Cosmos Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Rift of Damnation Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Soul Eclipse Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Flare Slash Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Thunder Breaker": {
        "originSkill": {
            "name": "Thunder Wall Sea Wave",
            "components": [
                {
                    "damage": 723,
                    "attacks": 5,
                    "triggers": 32,
                    "growthPerLevel": 23
                },
                {
                    "damage": 703,
                    "attacks": 7,
                    "triggers": 62,
                    "growthPerLevel": 23
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Annihilate",
                "level0": 335,
                "level1": 354,
                "attacks": 7,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // TODO: enhances Lightnight Strike's Massive Thunderbolt +%p
            {
                "name": "HEXA Thunderbolt",
                "level0": 320,
                "level1": 341,
                "attacks": 5,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Lightning Cascade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // 1 fd every 7.5 levels
                "auxiliaryBoost": {
                    "threshold": 7.5,
                    "increase": 0.01
                }
            },
            {
                "name": "Shark Torpedo Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Lightning God Spear Strike Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Lightning Spear Multistrike Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Night Walker": {
        "originSkill": {
            "name": "Silence",
            "components": [
                {
                    "damage": 481,
                    "attacks": 12,
                    "triggers": 34,
                    "growthPerLevel": 16
                },
                {
                    "damage": 465,
                    "attacks": 60, // 12 attacks, 5 bounces
                    "triggers": 30, // activates 10 times, 3 shurikens
                    "growthPerLevel": 15
                },
            ]
        },
        "masterySkills": [
            {
                // do i need to add Jet Black? idk
                "name": "HEXA Quintuple Star",
                "level0": 253,
                "level1": 272,
                "attacks": 4,
                "growthPerLevel": 2,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Shadow Bat",
                "level0": 150,
                "level1": 910,
                "attacks": 3,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Ravenous Bat",
                "level0": 480,
                "level1": 748,
                "attacks": 2,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Shadow Spear Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // duration increase 
                "name": "Greater Dark Servant Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // duration increase every 3 levels
                // putting this as 1.75% fd every 3 levels for now. may not be accurate
                "auxiliaryBoost": {
                    "threshold": 3,
                    "increase": 0.0175
                }
            },
            {
                "name": "Shadow Bite Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // 1 fd every 19 levels??
                "auxiliaryBoost": {
                    "threshold": 19,
                    "increase": 0.01
                }

            },
            {
                "name": "Rapid Throw Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Wind Archer": {
        "originSkill": {
            "name": "Mistral Spring",
            "components": [
                {
                    "damage": 858,
                    "attacks": 10,
                    "triggers": 13,
                    "growthPerLevel": 28
                },
                //  ---- these seem low. has a duration of 20s and cd of 3s, so maybe they trigger 6 times?
                // spirit arrows
                {
                    "damage": 682,
                    "attacks": 5,
                    "triggers": 78, // 13 * 6
                    "growthPerLevel": 22
                },
                // excited spirit arrows
                {
                    "damage": 744,
                    "attacks": 6,
                    "triggers": 30, // 5 * 6
                    "growthPerLevel": 24
                },
                // strong spirit arrows
                {
                    "damage": 666,
                    "attacks": 7,
                    "triggers": 18, // 3 * 6
                    "growthPerLevel": 21
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Song of Heaven",
                "level0": 390,
                "level1": 554,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Trifling Wind",
                "level0": 390,
                "level1": 431,
                "attacks": 1,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Howling Gale Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Merciless Winds Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // TODO:
                // duration increases; meaning fd goes up a little. leaving blank for now
                "name": "Gale Barrier Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Vortex Sphere Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Blaze Wizard": {
        "originSkill": {
            "name": "Eternity",
            "components": [
                {
                    "damage": 1085,
                    "attacks": 10,
                    "triggers": 38,
                    "growthPerLevel": 35
                },
                {
                    "damage": 1902,
                    "attacks": 13,
                    "triggers": 15, // 30 seconds of procs, proc every ? seconds maybe 10-15 procs???
                    "growthPerLevel": 62
                },

            ]
        },
        "masterySkills": [
            {
                // man fuck you
                // for now we're just using the base + enahnced skill I GUESS >:(

                // 4th: 3 * (330 * 2) + 1 * (430 * 2)
                //  1420 per 4 hits twice

                // 6th: 3 * 411 + 646 * 1
                // 1879 per 4 hits
                // level 30: 1995 per 4
                "name": "HEXA Orbital Flame",
                "level0": 355, // 1420 / 4
                "level1": 469.75,
                "attacks": 2,
                "growthPerLevel": 1,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Blazing Extinction",
                "level0": 310,
                "level1": 655,
                "attacks": 4,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Orbital Inferno Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Savage Flame Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Inferno Sphere Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Salamander Mischief Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Mihile": {
        "originSkill": {
            "name": "Durendal",
            "components": [
                {
                    "damage": 775,
                    "attacks": 7,
                    "triggers": 6,
                    "growthPerLevel": 25
                },
                {
                    "damage": 712,
                    "attacks": 6,
                    "triggers": 30,
                    "growthPerLevel": 22
                },
                {
                    "damage": 708,
                    "attacks": 14,
                    "triggers": 24,
                    "growthPerLevel": 23
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Radiant Cross",
                "level0": 530,
                "level1": 594,
                "attacks": 4,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Radiant Cross - Assault",
                "level0": 326,
                "level1": 356,
                "attacks": 10,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // this skill has 5 diff options
            // idk how to deal with that
            // so we're going with 3rd time i guess lol
            {
                "name": "HEXA Royal Guard",
                "level0": 470,
                "level1": 833,
                "attacks": 6,
                "growthPerLevel": 23,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // TODO: 
                // this skill receives +1% fd at 1/9/10/19/20/29/40
                // needs custom logic entirely
                "name": "Shield of Light Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Sword of Light Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Radiant Soul Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // TODO: 
                // this skill receives +1% fd at 1/9/10/19/20/29/40
                // needs custom logic entirely
                "name": "Light of Courage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Mercedes": {
        "originSkill": {
            "name": "Unfading Glory",
            //  The total number of attacks is 21, and under normal circumstances, enhanced attacks are activated about 12 times. The calculation formula is (1,440×15×4×12)+(2,200×15×9)=1,036,800+297,000=1,333,800%.
            // source: namu wiki
            "components": [
                {
                    "damage": 434,
                    "attacks": 10,
                    "triggers": 36,
                    "growthPerLevel": 14
                },
                {
                    "damage": 435,
                    "attacks": 15,
                    "triggers": 28,
                    "growthPerLevel": 15
                },
                {
                    "damage": 1156,
                    "attacks": 15,
                    "triggers": 9,
                    "growthPerLevel": 14
                },
                // ??? enhanced attack
                {
                    "damage": 744,
                    "attacks": 15,
                    "triggers": 48, // 12 triggers * 4 shockwaves
                    "growthPerLevel": 14
                },


            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Ishtar's Ring",
                "level0": 316,
                "level1": 351,
                "attacks": 2,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // TODO: enhances Ishtar's Mark creation damage; non hexa skill
            {
                "name": "HEXA Wrath of Enlil",
                "level0": 515,
                "level1": 560,
                "attacks": 10,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wrath of Enlil: Spirit Enchant",
                "level0": 515,
                "level1": 616,
                "attacks": 10,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Spikes Royale",
                "level0": 630,
                "level1": 707,
                "attacks": 4,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Spikes Royale: Spirit Enchant",
                "level0": 630,
                "level1": 754,
                "attacks": 4,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Leaf Tornado",
                "level0": 260,
                "level1": 519,
                "attacks": 4,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Leaf Tornado: Spirit Enchant",
                "level0": 260,
                "level1": 599,
                "attacks": 1,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // spirits final damage scales +1% every 2 levels?
                "name": "Spirit of Elluel Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "auxiliaryBoost": {
                    "threshold": 2,
                    "increase": 0.01
                }
            },
            {
                "name": "Sylvidia's Flight Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                //  While active, Final Damage: +1%. every 6 levels
                // this istn really accurate cause its +fd to all skills not just this one but idk
                // just a way to weight it i guess
                // TODO: maybe check uptime & scale based on this
                "auxiliaryBoost": {
                    "threshold": 6,
                    "increase": 0.01
                }
            },
            {
                "name": "Irkalla's Wrath Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Royal Knights Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    // yay i get to re-do this class soon
    "Aran": {
        "originSkill": {
            // this skill is mega confusing >:(
            "name": "Adrenaline Surge",
            "components": [
                // final blow
                // 1000 combo = +20 triggrers
                // 29 by default
                // 
                {
                    "damage": 1071,
                    "attacks": 14,
                    "triggers": 49,
                    "growthPerLevel": 34
                },
                // TODO: add howling swing
            ]
        },
        "masterySkills": [
            {
                // average hits i guess
                "name": "HEXA Beyond Blade",
                "level0": 310, // 295 + 311 + 326 / 3
                "level1": 337,
                "attacks": 5,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Finisher - Hunter's Prey",
                "level0": 112350, // 15 * 1070 * 7
                "level1": 167600, // (960 * 15 * 6) + (406 * 10 * 20)
                "attacks": 1,
                "growthPerLevel": 2100,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Beyond Blade",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 48,
                        "growthPerLevel": 3
                    }
                ]
            }
        ],
        "boostSkills": [
            {
                "name": "Maha's Fury Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                //  While active, Final Damage: +1%. every 6 levels
                // this istn really accurate cause its +fd to all skills not just this one but idk
                // just a way to weight it i guess
                // TODO: maybe check uptime & scale based on this
                "auxiliaryBoost": {
                    "threshold": 6,
                    "increase": 0.01
                }
            },
            {
                "name": "Maha's Carnage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Fenrir Crash Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Blizzard Tempest Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Phantom": {
        "originSkill": {
            "name": "Defying Fate",
            "components": [
                {
                    "damage": 403,
                    "attacks": 15,
                    "triggers": 57,
                    "growthPerLevel": 13
                },
                {
                    "damage": 321,
                    "attacks": 15,
                    "triggers": 50, // activates 50 times in 30 seconds
                    "growthPerLevel": 11
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Tempest",
                "level0": 455,
                "level1": 492,
                "attacks": 4,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Mille Aiguilles",
                "level0": 160,
                "level1": 305,
                "attacks": 3,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Mille Aiguilles: Fortune",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Luck of the Draw Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Ace in the Hole Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Phantom's Mark Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Rift Break Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Luminous": {
        "originSkill": {
            "name": "Harmonic Paradox",
            "components": [
                {
                    "damage": 1550,
                    "attacks": 7,
                    "triggers": 17,
                    "growthPerLevel": 50
                },
                {
                    "damage": 784,
                    "attacks": 7,
                    "triggers": 39,
                    "growthPerLevel": 26
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Ender",
                "level0": 455,
                "level1": 492,
                "attacks": 7,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0.133,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reflection",
                "level0": 1440,
                "level1": 1600,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reflection",
                "level0": 0,
                "level1": 855,
                "attacks": 5,
                "growthPerLevel": 25,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
            },
            {
                "name": "Endless Darkness",
                "level0": 440,
                "level1": 491,
                "attacks": 4,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Reflection",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 43,
                        "growthPerLevel": 3
                    }
                ]
            },
        ],
        "boostSkills": [
            {
                "name": "Gate of Light Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Aether Conduit Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Baptism of Light and Darkness Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Liberation Orb Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Evan": {
        "originSkill": {
            "name": "Zodiac Burst",
            "components": [
                {
                    "damage": 1300,
                    "attacks": 15,
                    "triggers": 24,
                    "growthPerLevel": 18
                },
                // meteor shower
                {
                    "damage": 558,
                    "attacks": 8,
                    "triggers": 135, // 9 * 15
                    "growthPerLevel": 18
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Mana Burst",
                "level0": 330,
                "level1": 364,
                "attacks": 4,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Thunder Circle",
                "level0": 320, // 170 + 150?
                "level1": 469,
                "attacks": 5,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Dragon Flash",
                "level0": 465, // 95 + 50 + 320
                "level1": 558,
                "attacks": 4,
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Thunder Flash",
                "level0": 1345, // 400 + 150 (dd) + 745 (db)
                "level1": 1430,
                "attacks": 9,
                "growthPerLevel": 30,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wind Flash",
                // dragon dive: +30; dragon breath: +160;
                "level0": 245, // these skills all get +%p damage from a lot of sources which is annoying (nvm its not that annoying)
                "level1": 526,
                "attacks": 2,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            // TODO: this skill gains cooldown reduction every x levels?
            {
                "name": "Elemental Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Dragon Slam Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Elemental Radiance Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Spiral of Mana Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Shade": {
        "originSkill": {
            // this skill fucking sucks ass to calculate
            // its duration goes up which means the # of triggers goes up too by level
            "name": "Advent of the Fox",
            "components": [
                // i think im just gonna do it all in one hit
                // calculation source:
                // https://docs.google.com/spreadsheets/d/1wMbh_K-8xifj9aD4oF3Pug9pO_jRkOTMHEvytcTn7pI/edit?gid=1966259110#gid=1966259110
                {
                    "damage": 1556461,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 44585
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Spirit Claw",
                "level0": 265,
                "level1": 301,
                "attacks": 12,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Spirit Frenzy",
                "level0": 175,
                "level1": 183,
                "attacks": 5,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            // TODO: duration increase
            {
                "name": "Spirit Flow Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Spiritgate Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "True Spirit Claw Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Smashing Multipunch Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Battle Mage": {
        "originSkill": {
            "name": "Crimson Pact",
            "components": [
                {
                    "damage": 931,
                    "attacks": 11,
                    "triggers": 48,
                    "growthPerLevel": 29
                },
                {
                    "damage": 1471,
                    "attacks": 14,
                    "triggers": 22,
                    "growthPerLevel": 48
                },
            ]
        },
        "masterySkills": [
            {
                // this skill is kind of annoying because idk how often it procs
                // has two sections with different scaling
                // TODO: maybe double check this.
                "name": "HEXA Condemnation",
                "level0": 500,
                "level1": 524, // we're gonna assume this procs 1/6th of the time? idk
                "attacks": 12,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // this skill gives flat damage to Ambassador Scythe but it doesn't scale so im omitting it
                "name": "HEXA Finishing Blow",
                "level0": 330,
                "level1": 376,
                "attacks": 6,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 2,
            },
            {
                "name": "HEXA Sweeping Staff",
                "level0": 4550, // 720 * 2 + 180 * 20?
                "level1": 5040,
                "attacks": 1,
                "growthPerLevel": 314,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Aura Scythe Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Altar of Annihilation Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Grim Harvest Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Abyssal Lightning Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Blaster": {
        "originSkill": {
            "name": "Final Destroyer",
            "components": [
                {
                    "damage": 775,
                    "attacks": 10,
                    "triggers": 43,
                    "growthPerLevel": 25
                },
                {
                    "damage": 796,
                    "attacks": 14,
                    "triggers": 30,
                    "growthPerLevel": 26
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Magnum Punch",
                "level0": 546, // 100 + 100 (bobbing) + 130 (weaving) + 216 (muzzle flash)
                "level1": 608,
                "attacks": 3,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Double Blast",
                "level0": 460, // 150 + 130 (hammer smash) + 180 (shotgun punch)
                "level1": 516,
                "attacks": 4,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // TODO: does not include shockwave damage. may be important to add
                "name": "HEXA Bunker Buster Explosion",
                "level0": 405, // 100 + 40 + 80 +  185? 
                "level1": 725,
                "attacks": 8,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Burst Pile Bunker",
                "level0": 500,
                "level1": 500,
                "attacks": 6,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Rocket Punch Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Gatling Punch Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Bullet Blast Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Afterimage Shock Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Mechanic": {
        "originSkill": {
            "name": "Ground Zero",
            "components": [
                {
                    "damage": 1054,
                    "attacks": 8,
                    "triggers": 10,
                    "growthPerLevel": 34
                },
                {
                    "damage": 1023,
                    "attacks": 15,
                    "triggers": 32,
                    "growthPerLevel": 33
                },
                // missiles for 30 seconds. idk what interval
                {
                    "damage": 1496,
                    "attacks": 15,
                    "triggers": 20, // lets say every 1.5 seconds
                    "growthPerLevel": 48
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Heavy Salvo Plus",
                "level0": 390,
                "level1": 426,
                "attacks": 4,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // 1st explosion: 338 * 6 ; 8 per level
                // 2nd explosion: 187 * 3; 7 per level
                // 338 * 6 + 187 * 3
                // = 2589 per hit at level 1
                // 570 * 6 + 390 * 3
                // = 4590 per hit at level 30
                // 1 hit; 69 per level
                "name": "HEXA AP Salvo Plus",
                "level0": 2060, // (285 * 6) + (350 * 1)
                "level1": 2589,
                "attacks": 1,
                "growthPerLevel": 69,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Homing Beacon",
                "level0": 300, // homing beacon is 210 but advanced is +300; but i think it starts at 300 not 210 + 300
                "level1": 405,
                "attacks": 1,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Doomsday Device Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Mobile Missile Battery Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Full Metal Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Mecha Carrier Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Wild Hunter": {
        "originSkill": {
            "name": "Nature's Truth",
            "components": [
                {
                    "damage": 1022,
                    "attacks": 7,
                    "triggers": 12,
                    "growthPerLevel": 32
                },
                {
                    "damage": 1085,
                    "attacks": 14,
                    "triggers": 23,
                    "growthPerLevel": 35
                },
                {
                    // 30 seconds
                    "damage": 1022,
                    "attacks": 10,
                    "triggers": 84, // 6 * 14?
                    "growthPerLevel": 32
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Wild Arrow Blast",
                "level0": 370,
                "level1": 385,
                "attacks": 1,
                "growthPerLevel": 5,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0.167
            },
            // [Passive Effect - Summon Jaguar and Swipe Damage: +30% points, Another Bite Damage: +15% points]
            // [Passive Effect - Summon Jaguar, Swipe, and Dash 'n Slash Damage: +40% points, Another Bite Damage: +15% points]
            // [Passive Effect - Summon Jaguar, Swipe, Dash 'n Slash, and Sonic Roar Damage: +50% points, Another Bite Damage: +20% points]
            // [Passive Effect - Summon Jaguar, Swipe, Dash 'n Slash, Sonic Roar, and Jaguar Soul Damage: +150%p, Another Bite Damage: +40%p]
            {
                "name": "HEXA Swipe",
                "level0": 500, // +50 (soul), +30 (dash), +40 (sonic), +150 (jaguar ramp)
                "level1": 526,
                "attacks": 4,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Dash 'n Slash",
                "level0": 525, // +240
                "level1": 561,
                "attacks": 2,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Sonic Roar",
                "level0": 520, // 320 + 50 + 150
                "level1": 554,
                "attacks": 6,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Jaguar Soul",
                "level0": 330,
                "level1": 346,
                "attacks": 12,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Jaguar Rampage",
                "level0": 800,
                "level1": 830,
                "attacks": 9,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Exploding Arrows",
                "level0": 380,
                "level1": 443,
                "attacks": 1,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // TODO: idk
                "name": "Jaguar Storm Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Primal Fury Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Primal Grenade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Wild Arrow Blast Type X Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Xenon": {
        "originSkill": {
            "name": "Artificial Evolution",
            "components": [
                // seems like most of the damage actually comes from the ability to proc othjer skills during evolution.
                // interesting.
                {
                    "damage": 362,
                    "attacks": 7,
                    "triggers": 31, // duration 30s. this gotta be a lotta procs surely
                    "growthPerLevel": 12
                },
                {
                    "damage": 558,
                    "attacks": 5,
                    "triggers": 96, // COOLDOWN 1.8 seconds??  so 6 * 16
                    "growthPerLevel": 18
                },
                
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Mecha Purge: Snipe",
                "level0": 350,
                "level1": 394,
                "attacks": 7,
                "growthPerLevel": 4,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Mecha Purge: Execute",
                "level0": 350,
                "level1": 243,
                "attacks": 21,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0.3,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 30
            },
            {
                "name": "HEXA Mecha Purge: Bombardment",
                "level0": 405,
                "level1": 452,
                "attacks": 5,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Mecha Purge: Fire",
                "level0": 405,
                "level1": 452,
                "attacks": 7,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hypogram Field: Penetrate",
                "level0": 213,
                "level1": 250,
                "attacks": 1,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hypogram Field: Force Field",
                "level0": 400,
                "level1": 710,
                "attacks": 1,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Triangulation",
                "level0": 1020, // 340 * 3 = 
                "level1": 2222, // 0.3 chance of proccing (265 * 3); scale 5. each attack does 16 * 124; scale 4
                "attacks": 1,
                "growthPerLevel": 68, // 4209 - 2222) / 29
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
            }
        ],
        "boostSkills": [
            {
                "name": "Omega Blaster Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // At level 30, supply energy is recharged to 50 in 15 seconds . Compared to the existing Overload mode, the recharge time is reduced by 5 seconds, and the final damage increases by 8.33% and all stats by 10%. Of course, the final damage of 60% in the skill description only applies to plasma current, and is unrelated to the increase in final damage due to excess surplus energy.
            {
                "name": "Core Overload Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // TODO:
                // 8.33 fd over 30 levels applies to all skills so idk how accurate this is.
                "auxiliaryBoost": {
                    "threshold": 1,
                    "increase": 0.028
                }
            },
            {
                "name": "Hypogram Field: Fusion Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Photon Ray Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Demon Slayer": {
        "originSkill": {
            "name": "Nightmare",
            "components": [
                {
                    "damage": 1420,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Demon Impact",
                "level0": 1368,
                "level1": 1520,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Demon Impact: Demon Chain",
                "level0": 1458,
                "level1": 1620,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Demon Lash",
                "level0": 1548,
                "level1": 1720,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Infernal Concussion",
                "level0": 1638,
                "level1": 1820,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Demon Awakening Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Spirit of Rage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Orthrus Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Demon Bane Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Demon Avenger": {
        "originSkill": {
            "name": "Requiem",
            "components": [
                {
                    "damage": 1480,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 15
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Nether Shield",
                "level0": 1422,
                "level1": 1580,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Exceed: Execution",
                "level0": 1512,
                "level1": 1680,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Demonic Frenzy Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Demonic Blast Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Dimensional Sword Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Revenant Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Angelic Buster": {
        "originSkill": {
            "name": "Grand Finale",
            "components": [
                {
                    "damage": 1550,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 15
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Trinity",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Soul Seeker",
                "level0": 1575,
                "level1": 1750,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Soul Seeker Expert",
                "level0": 1665,
                "level1": 1850,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Sparkle Burst Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Superstar Spotlight Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Mighty Mascot Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Trinity Fusion Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Kaiser": {
        "originSkill": {
            "name": "Nova Triumphant",
            "components": [
                {
                    "damage": 1600,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 16
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Gigas Wave",
                "level0": 1530,
                "level1": 1700,
                "attacks": 1,
                "growthPerLevel": 16,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Blade Burst",
                "level0": 1620,
                "level1": 1800,
                "attacks": 1,
                "growthPerLevel": 16,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Tempest Blades",
                "level0": 1710,
                "level1": 1900,
                "attacks": 1,
                "growthPerLevel": 16,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Nova Guardians Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Bladefall Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Draco Surge Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Dragonflare Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Cadena": {
        "originSkill": {
            "name": "Chain Arts: Grand Arsenal",
            "components": [
                {
                    "damage": 1350,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 13
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Chain Arts: Thrash",
                "level0": 1305,
                "level1": 1450,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Muscle Memory",
                "level0": 1395,
                "level1": 1550,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Chain Arts: Void Strike Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Apocalypse Cannon Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Chain Arts: Maelstrom Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Muscle Memory Finale Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Kain": {
        "originSkill": {
            "name": "Total Annihilation",
            "components": [
                {
                    "damage": 1450,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Falling Dust",
                "level0": 1395,
                "level1": 1550,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "[Possess] HEXA Falling Dust",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "[Execute] HEXA Poison Needle",
                "level0": 1575,
                "level1": 1750,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Strike Arrow",
                "level0": 1665,
                "level1": 1850,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Possess] Strike Arrow",
                "level0": 1755,
                "level1": 1950,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Scattering Shot",
                "level0": 1845,
                "level1": 2050,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Possess] Scattering Shot",
                "level0": 1935,
                "level1": 2150,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Execute] Tearing Knife",
                "level0": 2025,
                "level1": 2250,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Execute] Chain Sickle",
                "level0": 2115,
                "level1": 2350,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Dragon Burst Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Fatal Blitz Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Thanatos Descent Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Grip of Agony Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Kanna": {
        "originSkill": {
            "name": "Hakumenkonmou Juubi",
            "components": [
                {
                    "damage": 1300,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 12
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Shikigami Haunting",
                "level0": 1260,
                "level1": 1400,
                "attacks": 1,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Vanquisher's Charm",
                "level0": 1350,
                "level1": 1500,
                "attacks": 1,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Yuki-musume Shoukan Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Spirit's Domain Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Liberated Spirit Circle Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Ghost Yaksha Bosses' Boss Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Hayato": {
        "originSkill": {
            "name": "Jin Quick Draw",
            "components": [
                {
                    "damage": 1420,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Rai Sanrenzan",
                "level0": 1368,
                "level1": 1520,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rai Blade Flash",
                "level0": 1458,
                "level1": 1620,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Shinsoku",
                "level0": 1548,
                "level1": 1720,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Battoujutsu Zankou Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Iaijutsu Phantom Blade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Battoujutsu Ultimate Will Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Instant Slice Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Adele": {
        "originSkill": {
            "name": "Maestro",
            "components": [
                {
                    "damage": 1500,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 15
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Cleave",
                "level0": 1440,
                "level1": 1600,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Magic Dispatch",
                "level0": 1530,
                "level1": 1700,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Aetherial Arms",
                "level0": 1620,
                "level1": 1800,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hunting Decree",
                "level0": 1710,
                "level1": 1900,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Plummet",
                "level0": 1800,
                "level1": 2000,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Ruin Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Infinity Blade Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Legacy Restoration Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Storm Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Ark": {
        "originSkill": {
            "name": "Primordial Abyss",
            "components": [
                {
                    "damage": 1550,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 15
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Basic Charge Drive",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Scarlet Charge Drive",
                "level0": 1575,
                "level1": 1750,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Gust Charge Drive",
                "level0": 1665,
                "level1": 1850,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Abyssal Charge Drive",
                "level0": 1755,
                "level1": 1950,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Grievous Wound",
                "level0": 1845,
                "level1": 2050,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Insatiable Hunger",
                "level0": 1935,
                "level1": 2150,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Unbridled Chaos",
                "level0": 2025,
                "level1": 2250,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Abyssal Recall Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Infinity Spell Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Devious Nightmare Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Endlessly Starving Beast Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Illium": {
        "originSkill": {
            "name": "Mytocrystal Expanse",
            "components": [
                {
                    "damage": 1320,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 13
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Radiant Javelin",
                "level0": 1278,
                "level1": 1420,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Radiant Enchanted Javelin",
                "level0": 1368,
                "level1": 1520,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Winged Javelin",
                "level0": 1458,
                "level1": 1620,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Winged Enchanted Javelin",
                "level0": 1548,
                "level1": 1720,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reaction - Destruction",
                "level0": 1638,
                "level1": 1820,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reaction - Domination",
                "level0": 1728,
                "level1": 1920,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Vortex Wings",
                "level0": 1818,
                "level1": 2020,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Crystal Ignition Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Templar Knight Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Crystalline Spirit Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Crystal Gate Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Khali": {
        "originSkill": {
            "name": "Hex: Sandstorm",
            "components": [
                {
                    "damage": 1400,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Arts: Flurry",
                "level0": 1350,
                "level1": 1500,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Arts: Crescentum",
                "level0": 1440,
                "level1": 1600,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Void Rush",
                "level0": 1530,
                "level1": 1700,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Void Blitz",
                "level0": 1620,
                "level1": 1800,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hex: Chakram Split",
                "level0": 1710,
                "level1": 1900,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Hex: Pandemonium Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Void Burst Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Arts: Astra Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Resonate: Ultimatum Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Hoyoung": {
        "originSkill": {
            "name": "Sage: Apotheosis",
            "components": [
                {
                    "damage": 1450,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Heaven: Consuming Flames",
                "level0": 1395,
                "level1": 1550,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Stone Tremor",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Humanity: Gold-Banded Cudgel",
                "level0": 1575,
                "level1": 1750,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Iron Fan Gale",
                "level0": 1665,
                "level1": 1850,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Ground-Shattering Wave",
                "level0": 1755,
                "level1": 1950,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Humanity: As-You-Will Fan",
                "level0": 1845,
                "level1": 2050,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Sage: Clone Rampage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Scroll: Tiger of Songyu Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Sage: Wrath of Gods Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Sage: Three Paths Apparition Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Lara": {
        "originSkill": {
            "name": "Universe in Bloom",
            "components": [
                {
                    "damage": 1350,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 13
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Essence Sprinkle",
                "level0": 1305,
                "level1": 1450,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Dragon Vein Eruption",
                "level0": 1395,
                "level1": 1550,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Eruption: Heaving River",
                "level0": 1485,
                "level1": 1650,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Eruption: Whirlwind",
                "level0": 1575,
                "level1": 1750,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Eruption: Sunrise Well",
                "level0": 1665,
                "level1": 1850,
                "attacks": 1,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Big Stretch Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Land's Connection Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Surging Essence Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Winding Mountain Ridge Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Kinesis": {
        "originSkill": {
            "name": "From Another Realm",
            "components": [
                {
                    "damage": 1480,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 14
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Ultimate - Metal Press",
                "level0": 1422,
                "level1": 1580,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Psychic Grab",
                "level0": 1512,
                "level1": 1680,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Ultimate - Psychic Shot",
                "level0": 1602,
                "level1": 1780,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Psychic Tornado Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Ultimate - Mind Over Matter Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Ultimate - Psychic Shockwave Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Law of Gravity Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Zero": {
        "originSkill": {
            "name": "End Time",
            "components": [
                {
                    "damage": 1500,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 15
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Giga Crash",
                "level0": 1440,
                "level1": 1600,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Falling Star",
                "level0": 1530,
                "level1": 1700,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Groundbreaker",
                "level0": 1620,
                "level1": 1800,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wind Cutter",
                "level0": 1710,
                "level1": 1900,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wind Striker",
                "level0": 1800,
                "level1": 2000,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Storm Break",
                "level0": 1890,
                "level1": 2100,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Spin Driver",
                "level0": 1980,
                "level1": 2200,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wheel Wind",
                "level0": 2070,
                "level1": 2300,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rolling Cross",
                "level0": 2160,
                "level1": 2400,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rolling Assault",
                "level0": 2250,
                "level1": 2500,
                "attacks": 1,
                "growthPerLevel": 15,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Chrono Break Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Twin Blades of Time Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Shadow Flash Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Ego Weapon Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    "Lynn": {
        "originSkill": {
            "name": "Source Flow",
            "components": [
                {
                    "damage": 1200,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 12
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Strike",
                "level0": 1170,
                "level1": 1300,
                "attacks": 1,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Sneak Attack",
                "level0": 1260,
                "level1": 1400,
                "attacks": 1,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                "name": "Beast's Rage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Beak Strike Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "[Focus] Awaken Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Nature's Grace Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    }
};