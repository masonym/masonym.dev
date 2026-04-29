'use client'

import React, { useState } from 'react';
import EquipmentInfo from './EquipmentInfo';
import SimulationSettings from './SimulationSettings';
import SafeguardSettings from './SafeguardSettings';
import StarCatchSettings from './StarCatchSettings';
import EventSettings from './EventSettings';
import MVPSettings from './MVPSettings';
import SpareItemSettings from './SpareItemSettings';
import SimulationResults from './SimulationResults';
import { buildStarTable, simulateStarForceFast } from '../utils';

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

    const [simulationSettings, setSimulationSettings] = useState({
        numSimulations: 10000
    });

    const [safeguardSettings, setSafeguardSettings] = useState({
        stars: []  // Can contain 15, 16, 17
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

        const N = simulationSettings.numSimulations;
        const costs = new Float64Array(N);
        const booms = new Float64Array(N);
        let numReached = 0;
        let numStuck = 0; // sims that hit the attempt cap without reaching target
        let totalAttempts = 0;
        let totalCostAllRuns = 0;
        let totalBoomsAllRuns = 0;

        // Precompute the per-star rate + cost table once for this run.
        const table = buildStarTable({
            level: equipmentInfo.level,
            safeguardStars: safeguardSettings.stars,
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

                if (result.success) {
                    costs[numReached] = result.totalCost;
                    booms[numReached] = result.booms;
                    numReached++;
                } else {
                    numStuck++;
                }
            }

            setProgress((batch + 1) / totalBatches * 100);
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Sort only the populated portion of the typed arrays.
        const reachedCosts = costs.subarray(0, numReached);
        const reachedBooms = booms.subarray(0, numReached);
        reachedCosts.sort();
        reachedBooms.sort();

        const sumReachedCost = reachedCosts.reduce((a, b) => a + b, 0);
        const sumReachedBooms = reachedBooms.reduce((a, b) => a + b, 0);

        setResults({
            numSimulations: N,
            numReached,
            numStuck,
            attempts: totalAttempts,
            totalCost: totalCostAllRuns,
            totalBooms: totalBoomsAllRuns,
            // Cost/boom stats are computed over simulations that reached the
            // target so the average is on the same population as the
            // percentiles.
            averageCost: numReached > 0 ? sumReachedCost / numReached : 0,
            p5Cost: percentile(reachedCosts, 0.05),
            p50Cost: percentile(reachedCosts, 0.50),
            p95Cost: percentile(reachedCosts, 0.95),
            averageBooms: numReached > 0 ? sumReachedBooms / numReached : 0,
            p5Booms: percentile(reachedBooms, 0.05),
            p50Booms: percentile(reachedBooms, 0.50),
            p95Booms: percentile(reachedBooms, 0.95),
        });

        setIsSimulating(false);
        setProgress(0);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <SimulationSettings 
                    settings={simulationSettings} 
                    onChange={setSimulationSettings} 
                />
                <SafeguardSettings 
                    settings={safeguardSettings} 
                    onChange={setSafeguardSettings} 
                />
                <StarCatchSettings 
                    settings={starCatchSettings} 
                    onChange={setStarCatchSettings} 
                />
                <EventSettings 
                    settings={eventSettings} 
                    onChange={setEventSettings} 
                />
                <MVPSettings 
                    settings={mvpSettings} 
                    onChange={setMvpSettings} 
                />
            </div>
            
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
