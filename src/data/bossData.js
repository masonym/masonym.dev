import { formatShortformNumber } from '@/utils';
// "UI.wz\UIWindow2.img\UserList" for little square images
// 
//"C:\Users\Mason\Downloads\UI dump\UI.wz\_Canvas\UIBoss.img" // for banner images

export const bossData = [
    {
        name: 'Gollux',
        afSacRequirement: null,
        difficulties: [
            {
                name: 'Easy',
                level: 180,
                pdr: '10%',
                hpPhases: [

                    { hp: formatShortformNumber("50M") },
                    { hp: formatShortformNumber("50M") },
                    { hp: formatShortformNumber("10M") },
                ],
            },
            {
                name: 'Normal',
                level: 180,
                pdr: '?%',
                hpPhases: [

                    { hp: formatShortformNumber("3B") },
                    { hp: formatShortformNumber("3B") },
                    { hp: formatShortformNumber("600M") },
                ],
            },
            {
                name: 'Hard',
                level: 190,
                pdr: '150%',
                hpPhases: [

                    { hp: formatShortformNumber("75B") },
                    { hp: formatShortformNumber("75B") },
                    { hp: formatShortformNumber("15B") },
                ],
            },
            {
                name: 'Chaos',
                level: 200,
                pdr: '250%',
                hpPhases: [

                    { hp: formatShortformNumber("350B") },
                    { hp: formatShortformNumber("350B") },
                    { hp: formatShortformNumber("70B") },
                ],
            },
        ],
    },
    {
        name: 'Lotus',
        afSacRequirement: null,
        difficulties: [
            {
                name: 'Normal',
                hpPhases: [
                    { hp: formatShortformNumber("470B") },
                    { hp: formatShortformNumber("470B") },
                    { hp: formatShortformNumber("630B") },
                ],
                level: 210,
                pdr: '300%'
            },
            {
                name: 'Hard',
                hpPhases: [
                    { hp: formatShortformNumber("10T") },
                    { hp: formatShortformNumber("10T") },
                    { hp: formatShortformNumber("13.5T") },
                ],
                level: 210,
                pdr: '300%'
            },
            {
                name: 'Extreme',
                hpPhases: [
                    { hp: formatShortformNumber("545T") },
                    { hp: formatShortformNumber("545T") },
                    { hp: formatShortformNumber("720T") },
                ],
                level: 285,
                pdr: '380%'
            }
        ]
    },
    {
        name: "Damien",
        level: 210,
        afSacRequirement: null,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("840B") },
                    { hp: formatShortformNumber("360B") },
                ],
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("25.2T") },
                    { hp: formatShortformNumber("10.8T") },
                ],
            }
        ]
    },
    {
        name: "Cygnus",
        level: 140,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Easy",
                hpPhases: [
                    { hp: formatShortformNumber("10.5B") },
                ],
            },
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("63B") },
                ],
            }
        ]
    },
    {
        name: "Hilla",
        level: 190,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("16.8B") },
                ],
            }
        ]
    },
    {
        name: "Pink Bean",
        level: 190,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("69.3B") },
                ],
            }
        ]
    },
    {
        name: "Zakum",
        level: 180,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("84B") },
                ],
            }
        ]
    },
    {
        name: "Pierre",
        level: 190,
        afSacRequirement: null,
        pdr: '80%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("80B") },
                ],
            }
        ]
    },
    {
        name: "Von Bon",
        level: 190,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("100B") },
                ],
            }
        ]
    },
    {
        name: "Crimson Queen",
        level: 190,
        afSacRequirement: null,
        pdr: '120%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("140B") },
                ],
            }
        ]
    },
    {
        name: "Princess No",
        level: 160,
        afSacRequirement: null,
        pdr: '100%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("200B") },
                ],
            }
        ]
    },
    {
        name: "Magnus",
        level: 190,
        afSacRequirement: null,
        pdr: '120%',
        difficulties: [
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("120B") },
                ],
            }
        ]
    },
    {
        name: "Vellum",
        level: 190,
        afSacRequirement: null,
        pdr: '200%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("200B") },
                ],
            }
        ]
    },
    {
        name: "Papulatus",
        level: 190,
        afSacRequirement: null,
        pdr: '250%',
        difficulties: [
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("378B") },
                    { hp: formatShortformNumber("126B") },
                ],
            }
        ]
    },
    {
        name: "Akechi Mitsuhide",
        level: 210,
        afSacRequirement: null,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("152B") },
                    { hp: formatShortformNumber("152B") },
                ],
            }
        ]
    },
    {
        name: "Guardian Angel Slime",
        level: 220,
        afSacRequirement: null,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("5T") },
                ],
            },
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("90T") },
                ],
            }
        ]
    },
    {
        name: "Lucid",
        level: 230,
        pdr: '300%',
        difficulties: [
            {
                name: "Easy",
                hpPhases: [
                    { hp: formatShortformNumber("6T") },
                    { hp: formatShortformNumber("6T") },
                ],
                afSacRequirement: 360,
            },
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("12T") },
                    { hp: formatShortformNumber("12T") },
                ],
                afSacRequirement: 360,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("50.8T") },
                    { hp: formatShortformNumber("54T") },
                    { hp: formatShortformNumber("12.8T") },
                ],
                afSacRequirement: 360,
            }
        ]
    },
    {
        name: "Will",
        pdr: '300%',
        difficulties: [
            {
                name: "Easy",
                hpPhases: [
                    { hp: formatShortformNumber("2.8T"), segments: 3, note: "Phase 1: Blue Dimension" },
                    { hp: formatShortformNumber("2.8T"), segments: 3, note: "Phase 1: Purple Dimension" },
                    { hp: formatShortformNumber("4.2T"), segments: 2 },
                    { hp: formatShortformNumber("7T") },
                ],
                level: 235,
                afSacRequirement: 560,
            },
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("4.2T"), segments: 3, note: "Phase 1: Blue Dimension" },
                    { hp: formatShortformNumber("4.2T"), segments: 3, note: "Phase 1: Purple Dimension" },
                    { hp: formatShortformNumber("6.3T"), segments: 2 },
                    { hp: formatShortformNumber("10.5T") },
                ],
                level: 250,
                afSacRequirement: 760,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("21T"), segments: 3, note: "Phase 1: Blue Dimension" },
                    { hp: formatShortformNumber("21T"), segments: 3, note: "Phase 1: Purple Dimension" },
                    { hp: formatShortformNumber("31.5T"), segments: 2 },
                    { hp: formatShortformNumber("52.5T") },
                ],
                level: 250,
                afSacRequirement: 760,
            }
        ]
    },
    {
        name: "Gloom",
        level: 255,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("25.5T") }
                ],
                afSacRequirement: 730,
            },
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("127.5T") }
                ],
                afSacRequirement: 730,
            }
        ]
    },
    {
        name: "Darknell",
        level: 265,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("26T") }
                ],
                afSacRequirement: 850,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("157.5T") }
                ],
                afSacRequirement: 850,
            }
        ]
    },
    {
        name: "Verus Hilla",
        level: 250,
        pdr: '300%',
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("88T"), segments: 4 }
                ],
                afSacRequirement: 820,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("176T"), segments: 4 }
                ],
                afSacRequirement: 900,
            }
        ]
    },
    {
        name: "Chosen Seren",
        pdr: '380%',
        difficulties: [
            {
                name: "Normal",
                hp: formatShortformNumber("208T"),
                hpPhases: [
                    { hp: formatShortformNumber("52.5T") },
                    { hp: formatShortformNumber("155.5T") }
                ],
                afSacRequirement: 200,
                level: 275,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("126T") },
                    { hp: formatShortformNumber("357T") }
                ],
                afSacRequirement: 200,
                level: 275,
            },
            {
                name: "Extreme",
                hpPhases: [
                    { hp: formatShortformNumber("1.32Q") },
                    { hp: formatShortformNumber("5.16Q") }
                ],
                afSacRequirement: 200,
                level: 280,
            }
        ]
    },
    {
        name: "Kalos the Guardian",
        afSacRequirement: 330,
        pdr: '380%',
        difficulties: [
            {
                name: "Easy",
                hpPhases: [
                    { hp: formatShortformNumber("94.5T") },
                    { hp: formatShortformNumber("262.5T"), segments: 4 }
                ],
                level: 270,
                afSacRequirement: 200,
            },
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("336T") },
                    { hp: formatShortformNumber("720T"), segments: 4 }
                ],
                level: 280,
                afSacRequirement: 300,
            },
            {
                name: "Chaos",
                hpPhases: [
                    { hp: formatShortformNumber("1.06Q") },
                    { hp: formatShortformNumber("4.06Q"), segments: 4 }
                ],
                level: 285,
                afSacRequirement: 330,
            },
            {
                name: "Extreme",
                hpPhases: [
                    { hp: formatShortformNumber("5.97Q") },
                    { hp: formatShortformNumber("15.6Q"), segments: 4 }
                ],

                level: 285,
                afSacRequirement: 440,
            }
        ]
    },
    {
        name: "Kaling",
        pdr: '380%',
        difficulties: [
            {
                name: "Easy",
                hpPhases: [
                    { hp: formatShortformNumber("288T"), segments: 3, note: "Phase 1: Perils" },
                    { hp: formatShortformNumber("105T") },
                    { hp: formatShortformNumber("150T"), note: "Phase 3: Kaling" },
                    { hp: formatShortformNumber("378T"), segments: 3, note: "Phase 3: Perils" }
                ],
                afSacRequirement: 230,
                level: 275,
            },
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("1.2Q"), segments: 3, note: "Phase 1: Perils" },
                    { hp: formatShortformNumber("468T") },
                    { hp: formatShortformNumber("722T"), note: "Phase 3: Kaling" },
                    { hp: formatShortformNumber("1.536Q"), segments: 3, note: "Phase 3: Perils" }
                ],
                afSacRequirement: 330,
                level: 285,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("3.6Q"), segments: 3, note: "Phase 1: Perils" },
                    { hp: formatShortformNumber("1.86Q") },
                    { hp: formatShortformNumber("3.24Q"), note: "Phase 3: Kaling" },
                    { hp: formatShortformNumber("7.26Q"), segments: 3, note: "Phase 3: Perils" }
                ],
                afSacRequirement: 350,
                level: 285,
            },
            {
                name: "Extreme",
                hpPhases: [
                    { hp: formatShortformNumber("22.05Q"), segments: 3, note: "Phase 1: Perils" },
                    { hp: formatShortformNumber("8.4Q") },
                    { hp: formatShortformNumber("10.5Q"), note: "Phase 3: Kaling" },
                    { hp: formatShortformNumber("25.2Q"), segments: 3, note: "Phase 3: Perils" }
                ],
                afSacRequirement: 480,
                level: 285,
            },

        ]
    },
    {
        name: "Limbo",
        pdr: '380%',
        afSacRequirement: 500,
        difficulties: [
            {
                name: "Normal",
                hpPhases: [
                    { hp: formatShortformNumber("1.94Q") },
                    { hp: formatShortformNumber("1.94Q"), segments: 2 },
                    { hp: formatShortformNumber("2.6Q") },
                ],
                level: 285,
                afSacRequirement: 500,
            },
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("3.78Q") },
                    { hp: formatShortformNumber("3.78Q"), segments: 2 },
                    { hp: formatShortformNumber("4.99Q") },
                ],
                level: 285,
                afSacRequirement: 500,
            }
        ]
    },
    {
        name: "Black Mage",
        pdr: "300%",
        difficulties: [
            {
                name: "Hard",
                hpPhases: [
                    { hp: formatShortformNumber("63T") },
                    { hp: formatShortformNumber("115.5T") },
                    { hp: formatShortformNumber("157.5T") },
                    { hp: formatShortformNumber("136.5T") },
                ],
                level: 275,
                afSacRequirement: 1320,
            },
            {
                name: "Extreme",
                hpPhases: [
                    { hp: formatShortformNumber("1.18Q") },
                    { hp: formatShortformNumber("1.19Q") },
                    { hp: formatShortformNumber("1.285Q") },
                    { hp: formatShortformNumber("1.152Q") },
                ],
                level: 280,
                afSacRequirement: 1320,
            }
        ]
    }
];
