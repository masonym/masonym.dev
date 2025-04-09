'use client';

import React, { useMemo, useState } from 'react';
import { bossData } from '@/data/bossData';
import { bossNameToImage, formatLongformNumber } from '@/utils';
import Image from 'next/image';

const DifficultyImage = ({ difficulty, afSacRequirement, level, pdr }) => {
    const imageSrc = `/bossDifficulties/${difficulty.toLowerCase()}.png`;
    return (
        <div className='w-full flex flex-col justify-between items-center gap-2'>
            <Image
                src={imageSrc}
                alt={`${difficulty} difficulty`}
                width={68}
                height={19}
                className="object-contain"
            />
            <div className="flex flex-wrap items-center gap-2 text-center justify-center">
                {level && (
                    <span className="text-xs font-medium bg-background-bright text-primary-bright px-2 py-0.5 rounded">
                        Level: {level}
                    </span>
                )}
                {pdr && (
                    <span className="text-xs font-medium bg-background-bright text-primary-bright px-2 py-0.5 rounded">
                        PDR: {pdr}
                    </span>
                )}
                {afSacRequirement && (
                    <span className="text-xs font-medium bg-background-bright text-primary-bright px-2 py-0.5 rounded">
                        AF/SAC: {afSacRequirement}
                    </span>
                )}
            </div>
        </div>
    );
};

const HPBar = ({ hpPhases }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {hpPhases.map((phase, i) => {
                const segments = phase.segments ?? 1;
                const perSegmentHP = phase.hp / segments;

                return (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-primary-bright">
                            <span>Phase {i + 1}</span>
                            <span>{formatLongformNumber(phase.hp)}</span>
                        </div>
                        <div className="w-full h-6 bg-gray-700 rounded overflow-hidden flex text-[10px] text-white font-mono">
                            {Array.from({ length: segments }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex-1 border-r border-gray-900 last:border-r-0 bg-red-500 flex items-center justify-center"
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

const calculateTotalHP = (phases) =>
    phases.reduce((sum, phase) => sum + phase.hp, 0);

const calculateHPThreshold = (totalHp, percentage) =>
    Number((totalHp * percentage / 100).toFixed(1));

const BossList = () => {
    const [hideUnder1T, setHideUnder1T] = useState(true);

    const sortedAndFilteredBossData = useMemo(() => {
        return [...bossData]
            .filter(boss =>
                !hideUnder1T ||
                boss.difficulties.some(d =>
                    d.hpPhases?.some(p => p.hp >= 1e12)
                )
            )
            .sort((a, b) => {
                const minA = Math.min(...a.difficulties.map(d => calculateTotalHP(d.hpPhases)));
                const minB = Math.min(...b.difficulties.map(d => calculateTotalHP(d.hpPhases)));
                return minA - minB;
            });
    }, [hideUnder1T]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary-bright">Boss List</h1>

            <div className="flex justify-center mb-6">
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={hideUnder1T}
                            onChange={() => setHideUnder1T(!hideUnder1T)}
                        />
                        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${hideUnder1T ? 'transform translate-x-full bg-blue-400' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-primary-bright font-medium">
                        Hide bosses pre-Lomien
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sortedAndFilteredBossData.map((boss, index) => (
                    <div key={index} className="bg-primary-dark rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
                        <div className="p-5 flex flex-col gap-4">
                            <div className="w-full h-24 relative">
                                <Image
                                    src={`/bossImages/${bossNameToImage(boss.name.toLowerCase())}.png`}
                                    alt={boss.name}
                                    fill
                                    className="rounded-md object-contain"
                                />
                            </div>

                            {boss.difficulties.map((difficulty, idx) => {
                                const totalHP = calculateTotalHP(difficulty.hpPhases);
                                const blueDotHP = calculateHPThreshold(totalHP, 5);

                                return (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <DifficultyImage
                                            difficulty={difficulty.name}
                                            afSacRequirement={difficulty.afSacRequirement}
                                            level={difficulty.level || (boss.level ? undefined : difficulty.level)}
                                            pdr={difficulty.pdr || (boss.pdr ? undefined : difficulty.pdr)}
                                        />

                                        <div className="bg-background-bright rounded p-3">
                                            <p className="text-primary-bright text-sm mb-1">
                                                Total HP: {formatLongformNumber(totalHP)}
                                            </p>
                                            <p className="text-primary-bright text-sm mb-3">
                                                Blue Dot: {formatLongformNumber(blueDotHP)}
                                            </p>
                                            <HPBar hpPhases={difficulty.hpPhases} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BossList;
