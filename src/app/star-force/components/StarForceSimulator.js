'use client'

import React, { useState } from 'react';
import EquipmentInfo from './EquipmentInfo';
import EnhanceModeSettings from './EnhanceModeSettings';
import StarCatchSettings from './StarCatchSettings';
import EventSettings from './EventSettings';
import MVPSettings from './MVPSettings';
import SpareItemSettings from './SpareItemSettings';
import SimulationResults from './SimulationResults';
import { buildStarTable, simulateStarForceFast } from '../utils';

// Monte Carlo runs per simulation. Fixed rather than user-configurable: the
// percentile spread is stable at this count and a run takes well under a
// second, so exposing it only added noise to the UI.
const NUM_SIMULATIONS = 10000;

// Sorted-array percentile using nearest-rank (0 <= p <= 1).
function percentile(sortedArr, p) {
    if (sortedArr.length === 0) return 0;
    const idx = Math.min(
        sortedArr.length - 1,
        Math.max(0, Math.floor(p * (sortedArr.length - 1)))
    );
    return sortedArr[idx];
}

export default function StarForceSimulator() {
    const [equipmentInfo, setEquipmentInfo] = useState({
        level: 0,
        currentStars: 0,
        targetStars: 0
    });

    const [enhanceModeSettings, setEnhanceModeSettings] = useState({
        modes: { 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1 }  // Enhancement Mode 1-4 per star
    });

    const [starCatchSettings, setStarCatchSettings] = useState({
        stars: []  // Can contain 0-29
    });

    const [eventSettings, setEventSettings] = useState({
        types: []  // Can contain: twoStars, thirtyOff, destructionReduction
    });

    const [mvpSettings, setMvpSettings] = useState({
        type: 'none'  // none, silver, gold, platinum
    });

    const [spareItemSettings, setSpareItemSettings] = useState({
        sparePrice: 0,
        currency: 'mesos',
        label: ''
    });

    const [results, setResults] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    const runSimulation = async () => {
        setIsSimulating(true);
        setResults(null);
        setProgress(0);

        const N = NUM_SIMULATIONS;
        const costs = new Float64Array(N);
        const booms = new Float64Array(N);
        let totalAttempts = 0;
        let totalCostAllRuns = 0;
        let totalBoomsAllRuns = 0;

        // Precompute the per-star rate + cost table once for this run.
        const table = buildStarTable({
            level: equipmentInfo.level,
            enhanceModes: enhanceModeSettings.modes,
            starCatchStars: starCatchSettings.stars,
            eventTypes: eventSettings.types,
            mvpType: mvpSettings.type,
        });

        const batchSize = 100; // Process in batches to update UI
        const totalBatches = Math.ceil(N / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStart = batch * batchSize;
            const batchEnd = Math.min((batch + 1) * batchSize, N);

            for (let i = batchStart; i < batchEnd; i++) {
                const result = simulateStarForceFast(
                    table,
                    equipmentInfo.currentStars,
                    equipmentInfo.targetStars,
                );

                totalAttempts += result.attempts;
                totalCostAllRuns += result.totalCost;
                totalBoomsAllRuns += result.booms;
                costs[i] = result.totalCost;
                booms[i] = result.booms;
            }

            setProgress((batch + 1) / totalBatches * 100);
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        costs.sort();
        booms.sort();

        setResults({
            numSimulations: N,
            numReached: N,
            numStuck: 0,
            attempts: totalAttempts,
            totalCost: totalCostAllRuns,
            totalBooms: totalBoomsAllRuns,
            averageCost: N > 0 ? totalCostAllRuns / N : 0,
            p5Cost: percentile(costs, 0.05),
            p50Cost: percentile(costs, 0.50),
            p95Cost: percentile(costs, 0.95),
            averageBooms: N > 0 ? totalBoomsAllRuns / N : 0,
            p5Booms: percentile(booms, 0.05),
            p50Booms: percentile(booms, 0.50),
            p95Booms: percentile(booms, 0.95),
        });

        setIsSimulating(false);
        setProgress(0);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="flex flex-col gap-4">
                    <EquipmentInfo
                        info={equipmentInfo}
                        onChange={setEquipmentInfo}
                    />
                    <SpareItemSettings
                        settings={spareItemSettings}
                        onChange={setSpareItemSettings}
                        onEquipmentChange={setEquipmentInfo}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <EventSettings
                        settings={eventSettings}
                        onChange={setEventSettings}
                    />
                    <MVPSettings
                        settings={mvpSettings}
                        onChange={setMvpSettings}
                    />
                </div>
                <StarCatchSettings
                    settings={starCatchSettings}
                    onChange={setStarCatchSettings}
                />
            </div>

            <EnhanceModeSettings
                settings={enhanceModeSettings}
                onChange={setEnhanceModeSettings}
                equipmentInfo={equipmentInfo}
                starCatchStars={starCatchSettings.stars}
                eventTypes={eventSettings.types}
                mvpType={mvpSettings.type}
                spareItemSettings={spareItemSettings}
            />
            
            <div className="space-y-4">
                <button
                    onClick={runSimulation}
                    disabled={isSimulating || !equipmentInfo.level || !equipmentInfo.targetStars}
                    className={`w-full py-2 px-4 rounded transition-colors ${
                        isSimulating || !equipmentInfo.level || !equipmentInfo.targetStars
                            ? 'bg-[color:var(--primary-dim)] text-[color:var(--primary-dark)] cursor-not-allowed'
                            : 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)] hover:bg-[color:var(--secondary-bright)]'
                    }`}
                >
                    {isSimulating ? 'Simulating...' : 
                     !equipmentInfo.level ? 'Enter Equipment Level' :
                     !equipmentInfo.targetStars ? 'Enter Target Star Force' :
                     'Run Simulation'}
                </button>

                {isSimulating && (
                    <div className="w-full bg-[color:var(--background)] rounded-full h-4 overflow-hidden">
                        <div 
                            className="h-full bg-[color:var(--secondary)] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {results && !isSimulating && (
                <SimulationResults
                    results={results}
                    sparePrice={spareItemSettings.sparePrice}
                    spareCurrency={spareItemSettings.currency}
                    spareLabel={spareItemSettings.label}
                />
            )}
        </div>
    );
}
