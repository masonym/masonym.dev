import { formatShortformNumber } from '@/utils';

export const bossData = [
    {
        name: 'Lotus',
        afSacRequirement: null,
        difficulties: [
            {
                name: 'Normal',
                hp: formatShortformNumber("1.575T"),
                level: 210,
                pdr: '300%'
            },
            {
                name: 'Hard',
                hp: formatShortformNumber("33.7T"),
                level: 210,
                pdr: '300%'
            },
            {
                name: 'Extreme',
                hp: formatShortformNumber("1.8Q"),
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
                hp: formatShortformNumber("840B") + formatShortformNumber("360B"),
            },
            {
                name: "Hard",
                hp: formatShortformNumber("25.2T") + formatShortformNumber("10.8T")
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
                hp: formatShortformNumber("10.5B")
            },
            {
                name: "Normal",
                hp: formatShortformNumber("63B")
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
                hp: formatShortformNumber("16.8B")
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
                hp: formatShortformNumber("69.3B")
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
                hp: formatShortformNumber("84B")
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
                hp: formatShortformNumber("80B")
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
                hp: formatShortformNumber("100B")
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
                hp: formatShortformNumber("140B")
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
                hp: formatShortformNumber("200B")
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
                hp: formatShortformNumber("120B")
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
                hp: formatShortformNumber("200B")
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
                hp: formatShortformNumber("504B")
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
                hp: formatShortformNumber("304B")
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
                hp: formatShortformNumber("5T")
            },
            {
                name: "Chaos",
                hp: formatShortformNumber("90T")
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
                hp: formatShortformNumber("12T"),
                afSacRequirement: 360,
            },
            {
                name: "Normal",
                hp: formatShortformNumber("24T"),
                afSacRequirement: 360,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("117.6T"),
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
                hp: formatShortformNumber("16.8T"),
                level: 235,        
                afSacRequirement: 560,
            },
            {
                name: "Normal",
                hp: formatShortformNumber("25.2T"),
                level: 250,   
                afSacRequirement: 760,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("126T"),
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
                hp: formatShortformNumber("26T"),
                afSacRequirement: 730,
            },
            {
                name: "Chaos",
                hp: formatShortformNumber("126T"),
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
                hp: formatShortformNumber("26T"),
                afSacRequirement: 850,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("160T"),
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
                hp: formatShortformNumber("88T"),
                afSacRequirement: 820,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("176T"),
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
                afSacRequirement: 200,
                level: 275,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("483T"),
                afSacRequirement: 200,
                level: 275,
            },
            {
                name: "Extreme",
                hp: formatShortformNumber("7.28Q"),
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
                hp: formatShortformNumber("94.5T") + formatShortformNumber("262.5T"), // 262.5T * 4
                level: 270,
                afSacRequirement: 200,
            },
            {
                name: "Normal",
                hp: formatShortformNumber("336T") + formatShortformNumber("720T"), // 720T * 4
                level: 280,
                afSacRequirement: 300,
            },
            {
                name: "Chaos",
                hp: formatShortformNumber("1.2Q") + formatShortformNumber("4.55Q"), // 4.55Q * 4
                level: 285,
                afSacRequirement: 330,
            },
            {
                name: "Extreme",
                hp: formatShortformNumber("6.72Q") + formatShortformNumber("17.6Q"), // 17.6Q * 4
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
                hp: formatShortformNumber("921T"),
                afSacRequirement: 230,
                level: 275,
            },
            {
                name: "Normal",
                hp: formatShortformNumber("3.812Q"),
                afSacRequirement: 330,
                level: 285,
            },
            {
                name: "Hard",
                hp: formatShortformNumber("17.78Q"),
                afSacRequirement: 350,
                level: 285,
            },
            {
                name: "Extreme",
                hp: formatShortformNumber("98.6Q"),
                afSacRequirement: 480,
                level: 285,
            },
            
        ]
    }
];