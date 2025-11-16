'use client'

import React, { useState } from 'react';
import EquipmentInfo from './EquipmentInfo';
import SimulationSettings from './SimulationSettings';
import SafeguardSettings from './SafeguardSettings';
import StarCatchSettings from './StarCatchSettings';
import EventSettings from './EventSettings';
import MVPSettings from './MVPSettings';
import SimulationResults from './SimulationResults';
import { simulateStarForce } from '../utils';

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

    const [results, setResults] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    const runSimulation = async () => {
        setIsSimulating(true);
        setResults(null);
        setProgress(0);

        const allResults = [];
        let totalAttempts = 0;
        let totalSuccesses = 0;
        let totalFailures = 0;
        let totalDestructions = 0;
        let totalCost = 0;

        const batchSize = 100; // Process in batches to update UI
        const totalBatches = Math.ceil(simulationSettings.numSimulations / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStart = batch * batchSize;
            const batchEnd = Math.min((batch + 1) * batchSize, simulationSettings.numSimulations);
            
            // Process one batch
            for (let i = batchStart; i < batchEnd; i++) {
                const result = simulateStarForce({
                    level: equipmentInfo.level,
                    startingStar: equipmentInfo.currentStars,
                    targetStar: equipmentInfo.targetStars,
                    safeguardStars: safeguardSettings.stars,
                    starCatchStars: starCatchSettings.stars,
                    eventTypes: eventSettings.types,
                    mvpType: mvpSettings.type
                });

                allResults.push(result);
                totalSuccesses += result.success ? 1 : 0;
                totalAttempts += result.attempts;
                totalDestructions += result.booms;
                totalCost += result.totalCost;
            }

            // Update progress and allow UI to refresh
            setProgress((batch + 1) / totalBatches * 100);
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        totalFailures = totalAttempts - totalSuccesses - totalDestructions;

        // Get successful attempts for median/min/max calculations
        const successfulResults = allResults.filter(r => r.success);
        const costs = successfulResults.map(r => r.totalCost);
        const booms = successfulResults.map(r => r.booms);

        // Sort arrays for median calculation
        costs.sort((a, b) => a - b);
        booms.sort((a, b) => a - b);

        setResults({
            attempts: totalAttempts,
            successes: totalSuccesses,
            failures: totalFailures,
            destructions: totalDestructions,
            totalCost: totalCost,
            averageCost: totalCost / simulationSettings.numSimulations,
            medianCost: totalSuccesses > 0 ? costs[Math.floor(costs.length / 2)] : 0,
            minCost: totalSuccesses > 0 ? costs[0] : 0,
            maxCost: totalSuccesses > 0 ? costs[costs.length - 1] : 0,
            averageBooms: totalDestructions / simulationSettings.numSimulations,
            medianBooms: totalSuccesses > 0 ? booms[Math.floor(booms.length / 2)] : 0,
            minBooms: totalSuccesses > 0 ? booms[0] : 0,
            maxBooms: totalSuccesses > 0 ? booms[booms.length - 1] : 0
        });

        setIsSimulating(false);
        setProgress(0);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <EquipmentInfo 
                    info={equipmentInfo} 
                    onChange={setEquipmentInfo} 
                />
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

            {results && !isSimulating && <SimulationResults results={results} />}
        </div>
    );
}
