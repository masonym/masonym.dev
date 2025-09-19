'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { bossData } from '@/data/bossData';
import { bossNameToImage, formatLongformNumber } from '@/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';

const calculateTotalHP = (phases) =>
    phases.reduce((sum, phase) => sum + phase.hp, 0);

const calculateHPThreshold = (totalHp, percentage) =>
    Number((totalHp * percentage / 100).toFixed(1));

const AF_BREAKPOINTS = [
    { percent: 1.1, bonus: 10 },
    { percent: 1.3, bonus: 30 },
    { percent: 1.5, bonus: 50 },
];

const SAC_BREAKPOINTS = [
    { above: 50, bonus: 25 },
];

const RequirementTooltip = ({ type, requirement }) => {
    if (!requirement) return null;

    let breakpoints = [];
    if (type === 'AF') {
        breakpoints = AF_BREAKPOINTS.map(bp => ({
            label: `${Math.ceil(requirement * bp.percent / 5) * 5}`,
            value: `+${bp.bonus}%`,
        }));
    } else if (type === 'SAC') {
        breakpoints = SAC_BREAKPOINTS.map(bp => ({
            label: `${requirement + bp.above}`,
            value: `+${bp.bonus}%${bp.above === 50 ? ' (Max)' : ''}`,
        }));
    }

    return (
        <div className="overflow-visible absolute bottom-full mb-2 w-48 bg-background-dim border border-primary-dim text-primary-bright text-sm rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-100 left-1/2 -translate-x-1/2">
            <div className="font-bold text-center mb-1">{type} Damage Bonus</div>
            <ul className="space-y-1">
                {breakpoints.map((bp, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{bp.label} {type}:</span>
                        <span className="">{bp.value}</span>
                    </li>
                ))}
            </ul>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-background-dim transform rotate-45"></div>
        </div>
    );
};

const BossCard = ({ boss }) => {
    const getInitialDifficulty = () => {
        if (typeof window !== 'undefined') {
            const savedDifficulty = localStorage.getItem(`boss-difficulty-${boss.name}`);
            if (savedDifficulty && boss.difficulties.some(d => d.name === savedDifficulty)) {
                return savedDifficulty;
            }
        }
        return boss.difficulties[0].name;
    };

    const [activeDifficulty, setActiveDifficulty] = useState(getInitialDifficulty);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`boss-difficulty-${boss.name}`, activeDifficulty);
        }
    }, [activeDifficulty, boss.name]);

    const activeDiffData = boss.difficulties.find(d => d.name === activeDifficulty);
    const afRequirement = activeDiffData?.afRequirement || boss.afRequirement;
    const sacRequirement = activeDiffData?.sacRequirement || boss.sacRequirement;
    const requirementValue = afRequirement || sacRequirement;
    const requirementType = afRequirement ? 'AF' : (sacRequirement ? 'SAC' : null);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-primary-dark rounded-2xl shadow-lg border border-primary-dim/50 hover:border-secondary/50 transition-all duration-300"
        >
            <div className="p-5 flex flex-col gap-4">
                <div className="relative h-20 w-full mb-2">
                    <Image
                        src={`/bossImages/${bossNameToImage(boss.name.toLowerCase())}.png`}
                        alt={boss.name}
                        fill
                        className="object-contain drop-shadow-lg text-center leading-[75px]"
                    />
                </div>
                <h3 className="text-center text-xl font-bold text-primary-bright -mt-2">{boss.name}</h3>

                <div className="flex w-full gap-1 bg-background-bright rounded-full p-1">
                    {boss.difficulties.map(diff => (
                        <button
                            key={diff.name}
                            onClick={() => setActiveDifficulty(diff.name)}
                            className={`flex-1 min-w-0 px-0 py-1 text-[clamp(10px,2vw,14px)] text-center rounded-full truncate transition-colors duration-200 ${activeDifficulty === diff.name ? 'bg-secondary text-primary-dark' : 'text-primary hover:bg-background-dim'}`}>
                            {diff.name}
                        </button>
                    ))}
                </div>

                {activeDiffData && (
                    <div className="flex flex-col gap-3 text-sm text-primary-bright">
                        <div className={`grid ${requirementValue ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center`}>
                            <div className="bg-background-bright p-2 rounded-lg">
                                <div className="font-bold text-primary text-xs">Level</div>
                                <div>{activeDiffData.level || boss.level}</div>
                            </div>
                            <div className="bg-background-bright p-2 rounded-lg">
                                <div className="font-bold text-primary text-xs">PDR</div>
                                <div>{activeDiffData.pdr || boss.pdr}</div>
                            </div>
                            {requirementValue && (
                                <div className="relative group bg-background-bright p-2 rounded-lg cursor-pointer">
                                    <div className="font-bold text-primary text-xs">{requirementType}</div>
                                    <div>{requirementValue}</div>
                                    <RequirementTooltip type={requirementType} requirement={requirementValue} />
                                </div>
                            )}
                        </div>

                        <div className="bg-background-bright rounded-lg p-3">
                            <HPBar hpPhases={activeDiffData.hpPhases} defaultLevel={activeDiffData.level || boss.level} defaultSac={activeDiffData?.sacRequirement ?? boss.sacRequirement} />
                            <div className="flex items-center text-xs justify-center gap-2 text-primary-bright mt-3">
                                <Image
                                    src="/bossDifficulties/blue_dot.png"
                                    alt="Blue Dot HP"
                                    width={16}
                                    height={16}
                                    className="h-4 w-4"
                                />
                                <p className="text-primary-bright text-sm">
                                    {formatLongformNumber(calculateHPThreshold(calculateTotalHP(activeDiffData.hpPhases), 5))}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const HexIcon = ({ className = 'h-4 w-4 text-secondary' }) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="currentColor" />
    </svg>
);

const HPBar = ({ hpPhases, defaultLevel, defaultSac }) => {
    const totalHP = calculateTotalHP(hpPhases);
    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary-bright">Total HP</span>
                <span className="text-lg py-1 rounded">{formatLongformNumber(totalHP)}</span>
            </div>
            {hpPhases.map((phase, i) => {
                const segments = phase.segments ?? 1;
                const perSegmentHP = phase.hp / segments;
                const phaseLevel = phase.level ?? defaultLevel;
                const phaseSac = phase.sac ?? defaultSac;
                return (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs text-primary-bright">
                            <span>{phase.note ? phase.note : `Phase ${i + 1}`}</span>
                            <div className="flex items-center gap-3">
                                <span className="uppercase tracking-wide">LV: {phaseLevel}</span>
                                {phaseSac !== undefined && (
                                    <span className="flex items-center gap-1" title={`SAC: ${phaseSac}`}>
                                        <HexIcon className="h-3.5 w-3.5 text-secondary" />
                                        <span>{phaseSac}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={`w-full h-5 bg-background-dim rounded overflow-hidden flex text-primary-bright text-center text-nowrap font-mono ${segments > 3 ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-[14px]'}`}>
                            {Array.from({ length: segments }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex-1 border-r border-background last:border-r-0 bg-progress-red text-white flex items-center justify-center"
                                    title={`Segment ${j + 1}: ${formatLongformNumber(perSegmentHP)}`}
                                >
                                    {formatLongformNumber(perSegmentHP)}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};



const BossesPageClient = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hidePreLomien, setHidePreLomien] = useState(true);

    const filteredBosses = useMemo(() => {
        return bossData
            .filter(boss => {
                const matchesSearch = boss.name.toLowerCase().includes(searchTerm.toLowerCase());
                const meetsHPThreshold = !hidePreLomien || boss.difficulties.some(d => calculateTotalHP(d.hpPhases) >= 1e12);
                return matchesSearch && meetsHPThreshold;
            })
    }, [searchTerm, hidePreLomien]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-primary-bright tracking-tight">Boss Tracker</h1>
                <p className="text-lg text-primary-dim mt-2 max-w-2xl mx-auto">An overview of MapleStory bosses, their stats, and HP values.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <input
                    type="text"
                    placeholder="Search for a boss..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-background-dark text-primary-dim rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={hidePreLomien}
                                onChange={() => setHidePreLomien(!hidePreLomien)}
                            />
                            <div className="block bg-background-dim w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-primary-dark w-6 h-6 rounded-full transition ${hidePreLomien ? 'transform translate-x-full bg-secondary' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-primary-bright font-medium">
                            Hide pre-Lomien
                        </div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBosses.map(boss => (
                    <BossCard key={boss.name} boss={boss} />
                ))}
            </div>

            <footer className="text-center mt-12 text-primary-dim text-sm">
                <p>Disclaimer: Boss HP values are estimated and sourced from the <a href="https://maplestory.wiki/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-bright hover:underline">MapleStory Wiki</a>.</p>
            </footer>
        </div>
    );
};

export default BossesPageClient;
