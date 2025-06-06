'use client';

import React, { useMemo, useState } from 'react';
import { bossData } from '@/data/bossData';
import { bossNameToImage, formatLongformNumber } from '@/utils';
import Image from 'next/image';
import { InArticleAd, SidebarAd, FooterAd } from '@/components/AdSense/AdBanner';


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
    // if hpPhases is a string, it means it's a single value from formatLongformNumber
    if (typeof hpPhases === 'string') {
        return (
            <div className="flex flex-col items-center justify-between text-md text-primary-bright">
                <div className="mb-1"> Total HP</div>
                <div className="w-full h-6 bg-gray-700 rounded overflow-hidden flex text-[14px] text-primary-bright font-mono">
                    <div
                        className="flex-1 border-r border-gray-900 last:border-r-0 bg-progress-red flex items-center justify-center"
                    >
                        {hpPhases}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-2 w-full">
            {hpPhases.map((phase, i) => {
                const segments = phase.segments ?? 1;
                const perSegmentHP = phase.hp / segments;

                return (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-primary-bright">
                            {phase.note ? (<span>{phase.note}</span>)
                                : (
                                    <span>Phase {i + 1}</span>
                                )}
                        </div>
                        <div className={`w-full h-6 bg-gray-700 rounded overflow-hidden flex text-primary-bright text-center text-nowrap font-mono text-10px ${segments > 3 ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-[14px]'}`}>
                            {Array.from({ length: segments }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex-1 border-r border-gray-900 last:border-r-0 bg-progress-red flex items-center justify-center"
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
            
            {/* Top ad banner - will refresh on page navigation */}
            <div className="w-full flex justify-center mb-6">
                <FooterAd />
            </div>

            <h2 className="text-xl text-balance max-w-3xl mx-auto font-bold text-center mb-4 text-primary-bright">
                Dislaimer: Boss HP values are fetched from the <a href="https://maplestorywiki.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">MapleStory Wiki</a> and are estimated values; they may not be 100% accurate.
            </h2>
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

            {/* Content grid with sidebar ad */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sortedAndFilteredBossData.map((boss, index) => (
                    <div key={index} className="bg-primary-dark rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
                        <div className="p-5 flex flex-col gap-4">

                            <div className="min-h-[32px]">
                                {(boss.level || boss.pdr || boss.afSacRequirement) && (
                                    <div className="flex flex-wrap gap-2 text-sm text-primary-bright mb-2">
                                        {boss.level && (
                                            <span className="bg-background-bright px-2 py-0.5 rounded">Level {boss.level}</span>
                                        )}
                                        {boss.pdr && (
                                            <span className="bg-background-bright px-2 py-0.5 rounded">PDR: {boss.pdr}</span>
                                        )}
                                        {boss.afSacRequirement && (
                                            <span className="bg-background-bright px-2 py-0.5 rounded">AF/SAC: {boss.afSacRequirement}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="w-full h-12 relative">
                                <span className="absolute top-0 left-0 right-0 text-center text-primary-bright font-bold text-lg">{boss.name}</span>
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
                                            <div className="text-primary-bright text-sm mb-1">
                                                <HPBar hpPhases={formatLongformNumber(totalHP)} />
                                            </div>
                                            <div className="flex items-center text-xs justify-center gap-2 text-primary-bright my-2">
                                                <Image
                                                    src="/bossDifficulties/blue_dot.png"
                                                    alt="Blue Dot HP"
                                                    width={16}
                                                    height={16}
                                                    className="h-4 w-4"
                                                />
                                                <p className="text-primary-bright text-sm">
                                                    {formatLongformNumber(blueDotHP)}
                                                </p>
                                            </div>
                                            <HPBar hpPhases={difficulty.hpPhases} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                
                {/* Sidebar ad - 1/6 width on large screens */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="sticky top-4">
                        <SidebarAd />
                    </div>
                </div>
            </div>
            
            {/* Footer ad banner */}
            <div className="w-full flex justify-center mt-8">
                <FooterAd />
            </div>
        </div>
    );
};

export default BossList;
