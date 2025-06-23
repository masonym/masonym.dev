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
        <div className="overflow-visible absolute bottom-full mb-2 w-48 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-100 left-1/2 -translate-x-1/2">
            <div className="font-bold text-center mb-1">{type} Damage Bonus</div>
            <ul className="space-y-1">
                {breakpoints.map((bp, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{bp.label} {type}:</span>
                        <span className="">{bp.value}</span>
                    </li>
                ))}
            </ul>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-900 transform rotate-45"></div>
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
            className="bg-primary-dark rounded-2xl shadow-lg border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
        >
            <div className="p-5 flex flex-col gap-4">
                <div className="relative h-20 w-full mb-2">
                    <Image
                        src={`/bossImages/${bossNameToImage(boss.name.toLowerCase())}.png`}
                        alt={boss.name}
                        fill
                        className="object-contain drop-shadow-lg"
                    />
                </div>
                <h3 className="text-center text-xl font-bold text-primary-bright -mt-2">{boss.name}</h3>

                <div className="flex justify-center bg-background-bright rounded-full p-1">
                    {boss.difficulties.map(diff => (
                        <button
                            key={diff.name}
                            onClick={() => setActiveDifficulty(diff.name)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${activeDifficulty === diff.name ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                            {diff.name}
                        </button>
                    ))}
                </div>

                {activeDiffData && (
                    <div className="flex flex-col gap-3 text-sm text-primary-bright">
                        <div className={`grid ${requirementValue ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center`}>
                            <div className="bg-background-bright p-2 rounded-lg">
                                <div className="font-bold text-gray-400 text-xs">Level</div>
                                <div>{activeDiffData.level || boss.level}</div>
                            </div>
                            <div className="bg-background-bright p-2 rounded-lg">
                                <div className="font-bold text-gray-400 text-xs">PDR</div>
                                <div>{activeDiffData.pdr || boss.pdr}</div>
                            </div>
                            {requirementValue && (
                                <div className="relative group bg-background-bright p-2 rounded-lg cursor-pointer">
                                    <div className="font-bold text-gray-400 text-xs">{requirementType}</div>
                                    <div>{requirementValue}</div>
                                    <RequirementTooltip type={requirementType} requirement={requirementValue} />
                                </div>
                            )}
                        </div>

                        <div className="bg-background-bright rounded-lg p-3">
                            <HPBar hpPhases={activeDiffData.hpPhases} />
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

const HPBar = ({ hpPhases }) => {
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
                return (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-primary-bright">
                            {phase.note ? <span>{phase.note}</span> : <span>Phase {i + 1}</span>}
                        </div>
                        <div className={`w-full h-5 bg-gray-700 rounded overflow-hidden flex text-primary-bright text-center text-nowrap font-mono ${segments > 3 ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-[14px]'}`}>
                            {Array.from({ length: segments }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex-1 border-r border-gray-900 last:border-r-0 bg-red-600 flex items-center justify-center"
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
                <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">An overview of MapleStory bosses, their stats, and HP values.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <input
                    type="text"
                    placeholder="Search for a boss..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 bg-background-bright text-primary-bright rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${hidePreLomien ? 'transform translate-x-full bg-blue-500' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-primary-bright font-medium">
                            Hide pre-Lomien
                        </div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBosses.map(boss => (
                    <BossCard key={boss.name} boss={boss} />
                ))}
            </div>

            <footer className="text-center mt-12 text-gray-500 text-sm">
                <p>Disclaimer: Boss HP values are estimated and sourced from the <a href="https://maplestory.wiki/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">MapleStory Wiki</a>.</p>
            </footer>
        </div>
    );
};

export default BossesPageClient;
