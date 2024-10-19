"use client";

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
            <div className="flex flex-row items-end gap-2 text-center justify-start">
                {level && (
                    <span className="text-sm font-medium bg-background-bright text-primary-bright px-2 py-1 rounded">
                        Level: {level}
                    </span>
                )}
                {pdr && (
                    <span className="text-sm font-medium bg-background-bright text-primary-bright px-2 py-1 rounded">
                        PDR: {pdr}
                    </span>
                )}
                {afSacRequirement && (
                    <span className="text-sm font-medium bg-background-bright text-primary-bright px-2 py-1 rounded">
                        AF/SAC: {afSacRequirement}
                    </span>
                )}
            </div>
        </div>
    );
};

const BossList = () => {
    const [hideUnder1T, setHideUnder1T] = useState(true);

    const calculateHPThreshold = (hp, percentage) => {
        return Number((hp * percentage / 100).toFixed(1));
    };

    const sortedAndFilteredBossData = useMemo(() => {
        return [...bossData]
            .filter(boss => !hideUnder1T || boss.difficulties.some(d => d.hp >= 1e12))
            .sort((a, b) => {
                const lowestHpA = Math.min(...a.difficulties.map(d => d.hp));
                const lowestHpB = Math.min(...b.difficulties.map(d => d.hp));
                return lowestHpA - lowestHpB;
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {sortedAndFilteredBossData.map((boss, index) => (
                    <div key={index} className="bg-primary-dark rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="flex justify-between">
                                    <div className="min-h-[24px]">
                                        {boss.level && (
                                            <span className="text-sm font-medium bg-background-bright text-primary-bright px-2 py-1 rounded">
                                                Level {boss.level}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {boss.pdr && (
                                            <span className="text-sm font-medium bg-background-bright text-primary-bright px-2 py-1 rounded">
                                                PDR: {boss.pdr}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-24 mt-4 relative">
                                    <Image
                                        src={`/bossImages/${bossNameToImage(boss.name.toLowerCase())}.png`}
                                        alt={boss.name}
                                        fill
                                        className="rounded-lg object-contain"
                                    />
                                </div>
                            </div>

                            {boss.difficulties.map((difficulty, idx) => (
                                <div key={idx} className="mt-4">
                                    <h3 className="text-lg font-semibold text-primary-bright mb-2 flex items-center justify-between">
                                        <DifficultyImage
                                            difficulty={difficulty.name}
                                            afSacRequirement={difficulty.afSacRequirement}
                                            level={difficulty.level || (boss.level ? undefined : difficulty.level)}
                                            pdr={difficulty.pdr || (boss.pdr ? undefined : difficulty.pdr)}
                                        />
                                    </h3>
                                    <div className="bg-background-bright rounded p-3">
                                        <p className="text-primary-bright mb-1">
                                            HP: {formatLongformNumber(difficulty.hp)}
                                        </p>
                                        <p className="text-primary-bright">
                                            Blue Dot: {formatLongformNumber(calculateHPThreshold(difficulty.hp, 5))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BossList;