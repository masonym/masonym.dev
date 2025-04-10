// TODO: make sure everyones skills are in the second mastery section gahhh

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
                // TODO: check value
                "name": "Benediction Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }

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
                // TODO_LOW_PRIORITY: scale relic liberation
                // relic liberation
                // may need to adjust this
                // has scaling FD and idk how many times it procs in 30s
                {
                    "damage": 837,
                    "attacks": 5,
                    "triggers": 30, // lets just say it procs 30 times idk
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
                // triggers every 20s
                // the num of cursed arrows also increases with level
                // every 3 levels, gain 6% fd?
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
            {
                "name": "HEXA Arrow Stream",
                "level0": 350,
                "level1": 436,
                "attacks": 5,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "flatDamageBoost": {
                    "targetSkill": "Advanced Final Attack",
                    "baseValue": 117,
                    "growthPerLevel": (320 - 117) / 29 // 7
                }
            },
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
        ],
        "nonHexaSkills": [
            {
                "name": "Advanced Final Attack",
                "baseDamage": 210,
                "attacks": 1,
            },
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
                // TODO_LOW_PRIORITY: maybe account for cooldown reduction & consecutive uses
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
            {
                "name": "HEXA Rapid Fire",
                "level0": 375,
                "level1": 381,
                "attacks": 1,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "Majestic Presence",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 29,
                        "growthPerLevel": (145 - 29) / 29
                    }
                ]
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
        ],
        "nonHexaSkills": [
            {
                // this is their final attack
                "name": "Majestic Presence",
                "baseDamage": 275,
                "attacks": 1,
            },
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
            {
                "name": "HEXA Annihilate Lightning Strike",
                "level0": 103,
                "level1": 103,
                "attacks": 3,
                "growthPerLevel": (190 - 103) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Thunderbolt",
                "level0": 320,
                "level1": 341,
                "attacks": 5,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Annihilate Lightning Strike",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 99,
                        "growthPerLevel": (360 - 99) / 29
                    }
                ]
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
                "name": "HEXA Quintuple Star",
                "level0": 253,
                "level1": (272 * 4) + (1088 * 1), // = 2176
                "attacks": 1,
                "growthPerLevel": (2640 - 2176) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Quintuple Star - Jet Black",
                "level0": (272 * 4) + (213 * 7),
                "level1": (272 * 4) + (213 * 7), // = 2579
                "attacks": 1,
                "growthPerLevel": (3420 - 2579) / 29,
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
                // this skill receives +1% fd at 1/9/10/19/20/29/40
                "name": "Shield of Light Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01, // 1%
                    "growthPerLevel": 0.002 // 2% every 10 levels roughly?. maybe need to increase.
                }
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
                // this skill receives +1% fd at 1/9/10/19/20/29/40
                // needs custom logic entirely
                "name": "Light of Courage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "bossDamage",
                    "value": 0, // idk if this field even changes anything
                    // may need to change this vvvv
                    "growthPerLevel": 0.075 // 15% over 30 levels + 35% duration increase. 
                }
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
            {
                "name": "HEXA Wrath of Enlil",
                "level0": 515,
                "level1": 560,
                "attacks": 10,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    // TODO: gotta adjust this to provide adequate boost to ishtar's ring
                    {
                        "targetSkill": "HEXA Ishtar's Ring",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 40,
                        "growthPerLevel": 3
                    }
                ]
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
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.001
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
        ],
    },
    // yay i get to re-do this class soon
    "Aran": {
        "originSkill": {
            // this skill is mega confusing >:(
            "name": "Endgame",
            "components": [
                // final blow
                // 1000 combo = +20 triggrers
                // 29 by default
                // 
                {
                    "damage": 775,
                    "attacks": 14,
                    "triggers": 50,
                    "growthPerLevel": 25
                },
                {
                    "damage": 837,
                    "attacks": 15,
                    "triggers": 30,
                    "growthPerLevel": 27
                }
                // TODO: add howling swing maybe
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
                "name": "Finisher - Adrenaline Surge Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                //  While active, Final Damage: +1%. every 6 levels
                // this istn really accurate cause its +fd to all skills not just this one but idk
                // just a way to weight it i guess
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.002
                }
            },
            {
                "name": "Maha's Carnage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Final Beyond Blade - White Tiger Boost",
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
            {
                "name": "Elemental Barrage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "auxiliaryBoost": {
                    "threshold": 10,
                    "increase": 0.02
                }
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
                "name": "HEXA Fox Spirits",
                "level0": 120,
                "level1": 265,
                "attacks": 2,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            // TODO: duration increase
            {
                "name": "Fox God Flash Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.02
                }
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
                "bossDamageGrowthPerLevel": 0,
                "auxiliaryBoost": {
                    "threshold": 1,
                    "increase": 0.01
                }
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
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.0022
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
                    "damage": 1550,
                    "attacks": 4,
                    "triggers": 6,
                    "growthPerLevel": 50
                },
                // demon's territory
                {
                    "damage": 1156,
                    "attacks": 7,
                    "triggers": 66, // up to 66 times according to namu
                    "growthPerLevel": 37
                },
                {
                    "damage": 1378.5, // 919 * 1.5
                    "attacks": 7,
                    "triggers": 46,
                    "growthPerLevel": 43.5 // 29 * 1.5
                },


            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Demon Impact",
                "level0": 460,
                "level1": 487,
                "attacks": 6,
                "growthPerLevel": 7,
                "iedGrowthPerLevel": 0.333,
                "bossDamageGrowthPerLevel": 0.166666667
            },
            {
                "name": "HEXA Demon Impact: Demon Chain",
                "level0": 460,
                "level1": 639,
                "attacks": 6,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0.333,
                "bossDamageGrowthPerLevel": 0.166666667,
            },
            {
                "name": "HEXA Demon Lash",
                "level0": 1140, // 110; 110; 100; 100 ----- 220; 220; 300; 400
                "level1": 2359, //224; 224; 209; 209 ------ 448; 448; 627; 836
                "attacks": 1,
                "growthPerLevel": 44,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "Enhanced Demon Lash",
                        "effectType": "flatDamageIncrease",
                        "baseValue": (22 * 3 * 4),
                        "growthPerLevel": (2 * 3 * 4)
                    }
                ]
            },
            {
                "name": "HEXA Infernal Concussion",
                "level0": 400,
                "level1": 324,
                "attacks": 1,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Demon Impact",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 12,
                        "growthPerLevel": 2
                    },
                    {
                        "targetSkill": "HEXA Demon Impact: Demon Chain",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 32,
                        "growthPerLevel": 2
                    },

                ]
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
        ],
        "nonHexaSkills": [
            {
                "name": "Enhanced Demon Lash",
                "baseDamage": (600 * 3) + (600 * 3) + (700 * 3) + (800 * 3),
                "attacks": 1,
            },
            {
                "name": "HEXA Demon Impact",
                "baseDamage": 487,
                "attacks": 6
            },
            {
                "name": "HEXA Demon Impact: Demon Chain",
                "baseDamage": 639,
                "attacks": 6
            }
        ]
    },
    "Demon Avenger": {
        "originSkill": {
            "name": "Requiem",
            "components": [
                {
                    "damage": 620,
                    "attacks": 10,
                    "triggers": 50,
                    "growthPerLevel": 20
                },
                {
                    "damage": 1168,
                    "attacks": 12,
                    "triggers": 7, // every 2 seconds, 7 times
                    "growthPerLevel": 38
                },
                {
                    "damage": 646,
                    "attacks": 14,
                    "triggers": 16,
                    "growthPerLevel": 21
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Nether Shield",
                "level0": 500,
                "level1": 521,
                "attacks": 2,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Exceed: Execution",
                "level0": 540,
                "level1": 603,
                "attacks": 4,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "staticIED": 5
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
                // TODO: duration increase
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
                // Sound Waves
                {
                    "damage": 346,
                    "attacks": 9,
                    "triggers": 12,
                    "growthPerLevel": 12
                },
                // Cannon Roars
                {
                    "damage": 355,
                    "attacks": 14,
                    "triggers": 38,
                    "growthPerLevel": 12
                },
                // https://github.com/Auxilism/Auxilism.github.io/blob/main/ab_hexa_op/hexa-origin-node.js
                // Cheering Balloons
                {
                    "damage": 345986,
                    "attacks": 1,
                    "triggers": 1,
                    "growthPerLevel": 5916
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Trinity",
                "level0": 630,
                "level1": 643,
                "attacks": 6,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Soul Seeker",
                "level0": 320,
                "level1": 345,
                "attacks": 1,
                "growthPerLevel": 3,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
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
                    "damage": 1226,
                    "attacks": 8,
                    "triggers": 14,
                    "growthPerLevel": 39
                },
                {
                    "damage": 981,
                    "attacks": 13,
                    "triggers": 47,
                    "growthPerLevel": 32
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Gigas Wave",
                "level0": 360,
                "level1": 406,
                "attacks": 9,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Blade Burst",
                "level0": 480,
                "level1": 540,
                "attacks": 5,
                "growthPerLevel": 10,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // Dragon Blow does a fuckload of damage and triggers after 2 tempest hits 
                // the math here i'm doing is just adding an extra hit basically cause 5 sword starst & scales similarly to dragon blow
                "name": "HEXA Tempest Blades",
                "level0": 2250, // 450 * 5
                "level1": 2715, // 543 * 5 + 
                "attacks": 5,
                "growthPerLevel": 40, // 8 * 5
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
                    "damage": 352,
                    "attacks": 8,
                    "triggers": 54,
                    "growthPerLevel": 12
                },
                {
                    "damage": 382,
                    "attacks": 9,
                    "triggers": 17,
                    "growthPerLevel": 12
                },
                {
                    "damage": 403,
                    "attacks": 60,
                    "triggers": 14,
                    "growthPerLevel": 13
                },

            ]
        },
        "masterySkills": [
            {
                // fd for 1 skill scales after this..... grr
                // TODO: shockwave & fd scaling
                "name": "HEXA Chain Arts: Thrash",
                "level0": 600, // 150 * 2 + 150 * 2
                "level1": 2385, // 155 * 2 + 415 * 5 + 
                "attacks": 1,
                "growthPerLevel": 35,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Muscle Memory",
                "level0": 350,
                "level1": 457,
                "attacks": 4,
                "growthPerLevel": 7,
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
            // unsure if this damage is accurate
            "components": [
                {
                    "damage": 424,
                    "attacks": 8,
                    "triggers": 33,
                    "growthPerLevel": 14
                },
                {
                    "damage": 578,
                    "attacks": 14,
                    "triggers": 12,
                    "growthPerLevel": 18
                },
                // malice's territory
                {
                    "damage": 494,
                    "attacks": 15,
                    "triggers": 20, // 20 stacks?
                    "growthPerLevel": 9
                },
                // death blessing proc (dargon breath)
                {
                    "damage": 682,
                    "attacks": 15,
                    "triggers": 40, // 2 * 20
                    "growthPerLevel": 22
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Falling Dust",
                "level0": 451,
                "level1": 504,
                "attacks": 8,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "[Possess] HEXA Falling Dust",
                // has a follow-up
                "level0": 10700,
                "level1": 11765, // (566 * 10) + (407 * 15)
                "attacks": 1,
                "growthPerLevel": 340,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "[Execute] HEXA Poison Needle",
                "level0": 8536,
                "level1": 11970, // (391 * 8) + (289 * 8) + (330 * 12) + (257 * 10)
                "attacks": 1,
                "growthPerLevel": 350,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Strike Arrow",
                "level0": 3000, // idk lol
                "level1": 3880, // (409 * 5) + (367 * 5)
                "attacks": 1,
                "growthPerLevel": 80,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Possess] Strike Arrow",
                "level0": 440, // +220p
                "level1": 614,
                "attacks": 8,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Scattering Shot",
                "level0": 3108, // (222 * 4) + (222 * 0.5 * 5 * 4)
                "level1": 3836, // (274 * 4) + (274 * 0.5 * 5 * 4)
                "attacks": 1,
                "growthPerLevel": 84,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Possess] Scattering Shot",
                "level0": 4690, // (335 * 4) + (335 * 4 * 0.5 * 5)
                "level1": 6896, // (431 * 4) + (431 * 4 * 0.5 * 6)
                "attacks": 1,
                "growthPerLevel": 176,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Execute] Tearing Knife",
                "level0": 468,
                "level1": 513, // 
                "attacks": 7,
                "growthPerLevel": 13,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA [Execute] Chain Sickle",
                "level0": 5520,
                "level1": 6006, // (322 * 6) + (291 * 14)
                "attacks": 1,
                "growthPerLevel": 154,
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
                    "damage": 1640,
                    "attacks": 8,
                    "triggers": 10,
                    "growthPerLevel": 12
                },
                {
                    "damage": 355,
                    "attacks": 5,
                    "triggers": 50, // 5 * 10?
                    "growthPerLevel": 12
                },
                {
                    "damage": 3100, // 3100 to 6000
                    "attacks": 15,
                    "triggers": 12,
                    "growthPerLevel": 100
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Shikigami Haunting",
                "level0": 3800, // (250 * 4) + (300 * 4) + (400 * 4)
                "level1": 4512, // (346 * 4) + (376 * 4) + (406 * 4)
                "attacks": 1,
                "growthPerLevel": 72, // 6 growth per level * 3 hits * 4 attacks
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Vanquisher's Charm",
                "level0": 127050, // 330 * 5 * 77
                "level1": 170093, // (434 * 5 * 77) + (195 * 77 * ((20 + 0) / 100)) vs (608 * 5 * 77) + (195 * 77 * ((50) / 100))
                "attacks": 1,
                "growthPerLevel": 2465.32759, // 241587.5 - 170093 ) / 29
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
                // TODO: double check efficiency of domain
                "name": "Spirit's Domain Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
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
                    "damage": 1130,
                    "attacks": 8,
                    "triggers": 10,
                    "growthPerLevel": 30
                },
                // first + second + third strike
                {
                    "damage": 920,
                    "attacks": 10,
                    "triggers": 15, // 5 * 3
                    "growthPerLevel": 20
                },
                {
                    "damage": 2480,
                    "attacks": 15,
                    "triggers": 10,
                    "growthPerLevel": 80
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Rai Sanrenzan",
                "level0": 3960, // (330 * 4) * 3
                "level1": 4512, // (366 * 4) + (376 * 4) + (386 * 4)
                "attacks": 1,
                "growthPerLevel": 72, // growth of 6 * 4 * 3
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rai Blade Flash",
                "level0": 340,
                "level1": 366,
                "attacks": 8,
                "growthPerLevel": 6,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Shinsoku",
                "level0": 1010,
                "level1": 1584,
                "attacks": 10,
                "growthPerLevel": 34,
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
                    "damage": 703,
                    "attacks": 10,
                    "triggers": 29,
                    "growthPerLevel": 23
                },
                {
                    "damage": 703,
                    "attacks": 14,
                    "triggers": 57,
                    "growthPerLevel": 23
                },

            ]
        },
        "masterySkills": [
            {
                // TODO: this has an enhanced version every 6s... idk how to account for that
                // ignoring for now.
                "name": "HEXA Cleave",
                "level0": 375,
                "level1": 402,
                "attacks": 6,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Magic Dispatch",
                "level0": 450, // 80 + 30 + 115 + 225
                "level1": 488,
                "attacks": 15, // 3 * 5?
                "growthPerLevel": 8,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hunting Decree",
                "level0": 360, // 240 + 120
                "level1": 394,
                "attacks": 2,
                "growthPerLevel": 14,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Plummet",
                "level0": 550,
                "level1": 583,
                "attacks": 6,
                "growthPerLevel": 8,
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
                // TODO: check if this seems right
                "name": "Legacy Restoration Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
            },
            {
                "name": "Storm Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ]
    },
    // ba 
    // https://www.youtube.com/watch?v=FIXGgJEu0SE
    "Ark": {
        "originSkill": {
            "name": "Primordial Abyss",
            "components": [
                {
                    "damage": 579,
                    "attacks": 14,
                    "triggers": 68,
                    "growthPerLevel": 18
                },
                // abyssal grips?
                // supposedly 9 attacks, 15 triggers
                {
                    "damage": 889,
                    "attacks": 9,
                    "triggers": 15,
                    "growthPerLevel": 29
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Basic Charge Drive",
                "level0": 2570, // ((100 + 260 + 250) * 3) + ((50 + 160 + 160) * 2)
                "level1": 2672, // (610 * 3) + (421 * 2)
                "attacks": 1,
                "growthPerLevel": 42,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Scarlet Charge Drive",
                "level0": 3200, // ((80 + 100 + 170) * 3 * 2) + ((90 + 90 + 40) * 5)
                "level1": 3541, // (391 * 3 * 2) + (239 * 5)
                "attacks": 1,
                "growthPerLevel": 56,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Gust Charge Drive",
                "level0": 3320, // ((205 + 195) * 6) + ((200 + 30) * 4)
                "level1": 3668, // (442 * 6) + (254 * 4)
                "attacks": 1,
                "growthPerLevel": 58,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Abyssal Charge Drive",
                "level0": 3960, // (340 * 4) + (410 * 6) + (2 * 70) 
                "level1": 4418, // (376 * 4) + (457 * 6) + (86 * 2)
                "attacks": 1,
                "growthPerLevel": 68,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Awakened Abyss",
                "level0": 996, // ??? idk
                "level1": 996, // 
                "attacks": 3,
                "growthPerLevel": 16,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Grievous Wound",
                "level0": 490, // 150 + 160 + 180
                "level1": 642,
                "attacks": 6,
                "growthPerLevel": 12,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // TODO: flat dmg increase to non-hexa
                "additionalEffects": [
                    {
                        "targetSkill": "Vengeful Hate",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 130,
                        "growthPerLevel": 10
                    }
                ]
            },
            {
                "name": "HEXA Insatiable Hunger",
                "level0": 490, // 300 +  190 + 
                "level1": 661,
                "attacks": 7,
                "growthPerLevel": 11,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                // TODO: flat dmg increase to non-hexa
                "additionalEffects": [
                    {
                        "targetSkill": "Unstoppable Impulse",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 47,
                        "growthPerLevel": 7
                    },
                    {
                        "targetSkill": "Tenacious Instinct",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 47,
                        "growthPerLevel": 7
                    },

                ]
            },
            {
                "name": "HEXA Unbridled Chaos",
                "level0": 440,
                "level1": 619,
                "attacks": 12,
                "growthPerLevel": 9,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },

        ],
        "boostSkills": [
            {
                "name": "Abyssal Recall Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // gives impending death 7 flat damage per level
            {
                "name": "Infinity Spell Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "flatDamageBoost": {
                    "targetSkill": "Impending Death",
                    "baseValue": 0,
                    "growthPerLevel": 7
                }
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
        ],
        "nonHexaSkills": [
            {
                "name": "Impending Death",
                "baseDamage": 450,
                "attacks": 2,
            },
            {
                "name": "Unstoppable Impulse",
                "baseDamage": 435, // 110 + 150 + 175
                "attacks": 5,
            },
            {
                "name": "Tenacious Instinct",
                "baseDamage": 460, // 135 + 150 + 175
                "attacks": 6,
            },
            {
                "name": "Vengeful Hate",
                "baseDamage": 210 + 110, // 150 + 150 + 100
                "attacks": 6,
            }
        ],
    },
    "Illium": {
        "originSkill": {
            "name": "Mytocrystal Expanse",
            "components": [
                {
                    "damage": 620,
                    "attacks": 8,
                    "triggers": 12,
                    "growthPerLevel": 20 // 1200 - 620 ) / 29 = 20
                },
                {
                    "damage": 692,
                    "attacks": 10,
                    "triggers": 13,
                    "growthPerLevel": (1330 - 692) / 29
                },
                {
                    "damage": 775,
                    "attacks": 15,
                    "triggers": 16,
                    "growthPerLevel": (1500 - 775) / 29
                },
                //  mytocrystals resonance
                {
                    "damage": 992,
                    "attacks": 15,
                    "triggers": 16,
                    "growthPerLevel": (1920 - 992) / 29
                },
                // resonance procs?
                {
                    "damage": 620,
                    "attacks": 2,
                    "triggers": 25 * 4, // 4 triggers; 25 crystals
                    "growthPerLevel": (1200 - 620) / 29
                },



            ]
        },
        "masterySkills": [
            {
                // stupid ass ENHANCED JAVELIN
                "name": "HEXA Radiant Javelin",
                "level0": (95 + 200) + (130 * 2),
                "level1": (435 * 3) + (2 * 142),
                "attacks": 1,
                "growthPerLevel": 19,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // stupid ass ENHANCED JAVELIN
                "name": "HEXA Radiant Enchanted Javelin",
                "level0": (95 + 200) + (130 * 2),
                "level1": (((435 * 3) + (435 * 3 * 2 * 0.5))) + (2 * 142 * 3), // 3462
                "attacks": 1,
                "growthPerLevel": 42,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Winged Javelin",
                "level0": 4200,
                "level1": (751 * 6) + (259 * 3), // 5283
                "attacks": 1,
                "growthPerLevel": (6675 - 5283) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Winged Enchanted Javelin",
                "level0": 4200,
                "level1": (((751 * 6) + (751 * 6 * 2 * 0.5))) + (259 * 3 * 3), // 11343
                "attacks": 1,
                "growthPerLevel": 108,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reaction - Destruction",
                "level0": ((610 + 135) * 2 * 4) / 12,
                "level1": 797,
                "attacks": 12,
                "growthPerLevel": (1145 - 797) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Reaction - Domination",
                "level0": ((610 + 135) * 2) / 5,
                "level1": 567,
                "attacks": 5,
                "growthPerLevel": (915 - 567) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Vortex Wings",
                "level0": 1070,
                "level1": 1620,
                "attacks": 15,
                "growthPerLevel": (2200 - 1620) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "HEXA Winged Enchanted Javelin",
                        "effectType": "flatDamageIncrease",
                        "baseValue": (54 * 3) + (54 * 3 * 2 * 0.5),
                        "growthPerLevel": 696 / 29
                    },
                    {
                        "targetSkill": "HEXA Radiant Enchanted Javelin",
                        "effectType": "flatDamageIncrease",
                        "baseValue": (54 * 6) + (54 * 6 * 2 * 0.5),
                        "growthPerLevel": 1392 / 29
                    },

                ]
            }
        ],
        "boostSkills": [
            // TODO: this boost applies to Spectral Blast as well
            // Need to figure out how to account for that.
            // Initial idea is to maybe just have players input them both in the same box.
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
            // TODO: this skill is funky idk. maybe just add fd. check value
            {
                "name": "Crystalline Spirit Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
            },
            // TODO: duration increase & matk buff
            {
                "name": "Crystal Gate Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
            }
        ]
    },
    "Khali": {
        "originSkill": {
            "name": "Hex: Sandstorm",
            "components": [
                {
                    "damage": 393,
                    "attacks": 15,
                    "triggers": 30, // TODO: how many times does this proc? lets say 30 :)
                    "growthPerLevel": (770 - 393) / 29
                },
                {
                    "damage": 424,
                    "attacks": 10,
                    "triggers": 13,
                    "growthPerLevel": (830 - 424) / 29
                },
                {
                    "damage": 414,
                    "attacks": 14,
                    "triggers": 34,
                    "growthPerLevel": (820 - 414) / 29
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Arts: Flurry",
                "level0": 290,
                "level1": 324,
                "attacks": 7,
                "growthPerLevel": (585 - 324) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Arts: Crescentum",
                "level0": 230 + 120 + 130, // = 480
                "level1": 540,
                "attacks": 4,
                "growthPerLevel": (975 - 540) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Void Rush",
                "level0": 0,
                "level1": 254,
                "attacks": 4,
                "growthPerLevel": (370 - 254) / 29, // = 4
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Void Blitz",
                "level0": (210 * 4 * 4) / 5, // = 672
                "level1": 190 * 4, // = 760
                "attacks": 5,
                "growthPerLevel": (335 - 190) / 29, // = 5
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Hex: Chakram Split",
                "level0": 245 * 4 * 4, // = 3920
                "level1": 268 * 4 * 4, // = 4288
                "attacks": 5,
                "growthPerLevel": (500 - 268) / 29, // = 8
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
    // https://www.youtube.com/watch?v=7PvO8m5hTUg
    // ba video
    "Hoyoung": {
        "originSkill": {
            "name": "Sage: Apotheosis",
            "components": [
                {
                    "damage": 520,
                    "attacks": 8,
                    "triggers": 1, // ? ; 5 seconds of keydown
                    "growthPerLevel": (1013 - 520) / 29
                },
                {
                    "damage": 651,
                    "attacks": 15,
                    "triggers": 1, // same triggers as keydown? maybe?
                    "growthPerLevel": (1240 - 651) / 29
                },
                {
                    "damage": 555,
                    "attacks": 14,
                    "triggers": 61,
                    "growthPerLevel": (1077 - 555) / 29
                },

            ]
        },
        "masterySkills": [
            {
                // TODO: not sure which of these actually appear on the BA 
                // Clone/True skills seem to be a separate skill
                // Enhanced seem to be not; unsure if they appear on BA though
                "name": "HEXA Heaven: Consuming Flames",
                "level0": 370,
                "level1": 410,
                "attacks": 6,
                "growthPerLevel": (555 - 410) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Consuming Flames (Enhanced)",
                "level0": 370,
                "level1": 607,
                "attacks": 6 + 2, // flame emblem x2? 
                "growthPerLevel": (810 - 607) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Consuming Flames (Clone/True)",
                "level0": 370,
                "level1": 410,
                "attacks": 6,
                "growthPerLevel": (555 - 410) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Consuming Flames (Clone/True) (Enhanced)",
                "level0": 370,
                "level1": 607,
                "attacks": 6,
                "growthPerLevel": (810 - 607) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Stone Tremor",
                "level0": 180 + 245, // = 425
                "level1": 476,
                "attacks": 6,
                "growthPerLevel": (650 - 476) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Stone Tremor (Enhanced)",
                "level0": 425,
                "level1": 749 + ((527 * 5) / 6), // bright moon = 527 * 5
                "attacks": 6,
                "growthPerLevel": (1010 - 749) / 29, // = 9
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Stone Tremor (Clone/True)",
                "level0": 425,
                "level1": 476,
                "attacks": 6,
                "growthPerLevel": (650 - 476) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Stone Tremor (Clone/True) (Enhanced)",
                "level0": 425,
                "level1": 820,
                "attacks": 6,
                "growthPerLevel": (1110 - 820) / 29,
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
                "name": "HEXA Humanity: Gold-Banded Cudgel",
                "level0": (282 * 10) + (458 * 8), // = 6484
                "level1": (281 * 10) + (511 * 8), // = 6898
                "attacks": 1,
                "growthPerLevel": 148,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Humanity: Gold-Banded Cudgel (Enhanced)",
                "level0": (282 * 10) + (458 * 8), // = 6484
                "level1": (435 * 10) + (798 * 8) + (506 * 8), // = 14782
                "attacks": 1,
                "growthPerLevel": (24410 - 14782) / 29, // = 332
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            // TODO: add universal harmony here? not sure.
            {
                "name": "HEXA Heaven: Iron Fan Gale",
                "level0": 150 + 141, // = 291
                "level1": 304,
                "attacks": 5,
                "growthPerLevel": (420 - 304) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Iron Fan Gale (Enhanced)",
                "level0": 291,
                "level1": 465,
                "attacks": 5,
                "growthPerLevel": (610 - 465) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Iron Fan Gale (Clone/True)",
                "level0": 291,
                "level1": 304,
                "attacks": 5,
                "growthPerLevel": (420 - 304) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Heaven: Iron Fan Gale (Clone/True) (Enhanced)",
                "level0": 291,
                "level1": 465,
                "attacks": 5,
                "growthPerLevel": (610 - 465) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Ground-Shattering Wave",
                "level0": 100 + 220, // 320
                "level1": 460,
                "attacks": 4,
                "growthPerLevel": (750 - 460) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Ground-Shattering Wave (Enhanced)",
                "level0": 320,
                "level1": 699,
                "attacks": 4,
                "growthPerLevel": (960 - 699) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Ground-Shattering Wave (Clone/True)",
                "level0": 320,
                "level1": 460,
                "attacks": 4,
                "growthPerLevel": (750 - 460) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Earth: Ground-Shattering Wave (Clone/True) (Enhanced)",
                "level0": 320,
                "level1": 699,
                "attacks": 4,
                "growthPerLevel": (960 - 699) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Humanity: As-You-Will Fan",
                "level0": 90 + 307, // 397
                "level1": 626,
                "attacks": 5,
                "growthPerLevel": (858 - 626) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Humanity: As-You-Will Fan (Enhanced)",
                "level0": 397,
                "level1": 969,
                "attacks": 5,
                "growthPerLevel": (1230 - 969) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            {
                // TODO: enhances clone with the damage that increased bla bla bla???
                "name": "Sage: Clone Rampage Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
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
                    "damage": 1085,
                    "attacks": 7,
                    "triggers": 8,
                    "growthPerLevel": (2100 - 1085) / 29
                },
                {
                    "damage": 718,
                    "attacks": 14,
                    "triggers": 64,
                    "growthPerLevel": (1385 - 718) / 29
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Essence Sprinkle",
                "level0": 340 + 50 + 80, // 470
                "level1": 492,
                "attacks": 4,
                "growthPerLevel": (840 - 492) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "additionalEffects": [
                    {
                        "targetSkill": "Mountain Kid",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 80,
                        "growthPerLevel": (660 - 80) / 29 // 20
                    },
                    {
                        "targetSkill": "Mountain Seeds",
                        "effectType": "flatDamageIncrease",
                        "baseValue": 80,
                        "growthPerLevel": (660 - 80) / 29 // 20
                    },
                ]
            },
            {
                // TODO: non-hexa FD% increase?
                // real todo, not that fake todo shiiiiiiiiiiii
                // this skill does no damage!!!!
                "name": "HEXA Dragon Vein Eruption",
                "level0": 0,
                "level1": 0,
                "attacks": 0,
                "growthPerLevel": 0,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                // TODO: ???
                // idk if the math here works well
                // because the skill lasts for 18 seconds
                // but whatever
                "name": "HEXA Eruption: Heaving River",
                "level0": 260 * 4,
                "level1": (760 * 5) + (872 * 8), // 10776
                "attacks": 9,
                "growthPerLevel": (15010 - 10776) / 29, // 146
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Eruption: Whirlwind",
                "level0": 90,
                "level1": 454,
                "attacks": 25,
                "growthPerLevel": (628 - 454) / 29, // 6
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Eruption: Sunrise Well",
                "level0": (145 * 6) + (110 * 16) + (4 * 95 * 3), // 3770
                "level1": (758 * 6) + (425 * 18) + (5 * 465 * 3), // 26568
                "attacks": 1,
                "growthPerLevel": (26568 - 19173) / 29, // 257
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
        ],
        "nonHexaSkills": [
            {
                "name": "Mountain Kid",
                "baseDamage": 85 + (208 + 260), // = 553
                "attacks": 3,
            },
            {
                "name": "Mountain Seeds",
                "baseDamage": 55 + 265, // 320
                "attacks": 1,
            },
            {
                "name": "Absoprtion: River Puddle Douse",
                "baseDamage": 510,
                "attacks": 10,
            },
            {
                "name": "Absoprtion: Fierce Wind",
                "baseDamage": 250,
                "attacks": 3,
            },
            {
                "name": "Absoprtion: Sunlit Grain",
                "baseDamage": 265,
                "attacks": 1,
            },

        ]
    },
    "Kinesis": {
        "originSkill": {
            "name": "From Another Realm",
            "components": [
                {
                    "damage": 821,
                    "attacks": 12,
                    "triggers": 32,
                    "growthPerLevel": (1575 - 821) / 29
                },
                {
                    "damage": 832,
                    "attacks": 13,
                    "triggers": 44,
                    "growthPerLevel": (1586 - 832) / 29
                },
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Ultimate - Metal Press",
                "level0": 120 + 130 + 140 + 310, // 700
                "level1": 773,
                "attacks": 10,
                "growthPerLevel": (1295 - 773) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Psychic Grab",
                "level0": (340 * 3) / 5, // 204
                "level1": 512,
                "attacks": 5,
                "growthPerLevel": (1034 - 512) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Ultimate - Psychic Shot",
                "level0": (300 * 3) / 4,
                "level1": 504,
                "attacks": 4,
                "growthPerLevel": (765 - 504) / 29,
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
                    "damage": 733,
                    "attacks": 6,
                    "triggers": 17,
                    "growthPerLevel": (1400 - 733) / 29
                },
                {
                    "damage": 733,
                    "attacks": 8,
                    "triggers": 22,
                    "growthPerLevel": (1400 - 733) / 29
                },
                {
                    "damage": 734,
                    "attacks": 14,
                    "triggers": 32,
                    "growthPerLevel": (1430 - 734) / 29
                },

            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Giga Crash",
                "level0": 250,
                "level1": 284,
                "attacks": 6,
                "growthPerLevel": (400 - 284) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Falling Star",
                "level0": (225 * 6) + (225 * 3),
                "level1": (244 * 6) + (244 * 3),
                "attacks": 1,
                "growthPerLevel": 36,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Groundbreaker",
                "level0": (380 * 10) + (285 * 10) + (340 * 1), // 6990
                "level1": (436 * 10) + (310 * 10) + (371 * 5), // 9315
                "attacks": 1,
                "growthPerLevel": (13375 - 9315) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wind Cutter",
                "level0": (165 * 8) + (110 * 3 * 6), // 3300
                "level1": (178 * 8) + (117 * 3 * 6), // 3530
                "attacks": 1,
                "growthPerLevel": (5270 - 3530) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wind Striker",
                "level0": 250,
                "level1": 284,
                "attacks": 8,
                "growthPerLevel": (400 - 284) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Storm Break",
                "level0": (335 * 10) + (335 * 4 * 6) + (230 * 3), // 12080
                "level1": (361 * 10) + (361 * 6 * 4) + (254 * 4), // 13290
                "attacks": 1,
                "growthPerLevel": (19670 - 13290) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "Time Piece",
                "level0": 1,
                "level1": 976,
                "attacks": 4,
                "growthPerLevel": (1440 - 976) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },

            {
                "name": "HEXA Spin Driver",
                "level0": 260,
                "level1": 291,
                "attacks": 6,
                "growthPerLevel": (465 - 291) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Wheel Wind",
                "level0": 120,
                "level1": 220,
                "attacks": 2,
                "growthPerLevel": (365 - 220) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rolling Cross",
                "level0": (365 * 12) + (350 * 2),
                "level1": (404 * 12) + (465 * 3 * 2) + (465 * 3 * 2 * 0.3),
                "attacks": 1,
                "growthPerLevel": (14610 - 8335.5) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Rolling Assault",
                "level0": (375 * 12) + (250 * 3),
                "level1": (419 * 12) + (510 * 4 * 2) + (510 * 4 * 2 * 0.3), // 10332
                "attacks": 1,
                "growthPerLevel": (19496 - 10332) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            }
        ],
        "boostSkills": [
            // TODO: duration & fd increase
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
                    "damage": 558,
                    "attacks": 12,
                    "triggers": 54,
                    "growthPerLevel": (1080 - 558) / 29
                }
            ]
        },
        "masterySkills": [
            {
                "name": "HEXA Strike",
                "level0": 315,
                "level1": 340,
                "attacks": 6,
                "growthPerLevel": (485 - 340) / 29,
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0
            },
            {
                "name": "HEXA Sneak Attack",
                "level0": 680,
                "level1": 700,
                "attacks": 8,
                "growthPerLevel": (1280 - 700) / 29,
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
            // same concept as bene
            {
                "name": "[Focus] Awaken Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
            },
            // TODO: all stat increase
            {
                "name": "Nature's Grace Boost",
                "iedGrowthPerLevel": 0,
                "bossDamageGrowthPerLevel": 0,
                "globalEffect": {
                    "type": "finalDamage",
                    "value": 0.01,
                    "growthPerLevel": 0.003
                }
            }
        ]
    }
};
