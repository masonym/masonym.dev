'use client';

import { useState, useEffect, useRef } from 'react';

const LEVEL_COSTS = [
    { level: 0, chance: 35, cost: 10 },
    { level: 1, chance: 35, cost: 10 },
    { level: 2, chance: 35, cost: 10 },
    { level: 3, chance: 20, cost: 20 },
    { level: 4, chance: 20, cost: 20 },
    { level: 5, chance: 20, cost: 20 },
    { level: 6, chance: 20, cost: 20 },
    { level: 7, chance: 15, cost: 30 },
    { level: 8, chance: 10, cost: 40 },
    { level: 9, chance: 5, cost: 50 },
    { level: 10, chance: 0, cost: 50},
];

const STAT_NODE_COSTS = {
    I: { reselect: 100000000, reset: 10000000 },
    II: { reselect: 200000000, reset: 20000000 },
};

const MAX_TOTAL_LEVELS = 20;
const MAX_STAT_LEVEL = 10;

const RESET_THRESHOLDS = {
    6: [
        { totalLevel: 10, minMainStat: 2 },
        { totalLevel: 11, minMainStat: 3 },
        { totalLevel: 15, minMainStat: 4 },
        { totalLevel: 19, minMainStat: 5 }
    ],
    7: [
        { totalLevel: 10, minMainStat: 3 },
        { totalLevel: 12, minMainStat: 4 },
        { totalLevel: 16, minMainStat: 5 },
        { totalLevel: 19, minMainStat: 6 }
    ],
    8: [
        { totalLevel: 10, minMainStat: 4 },
        { totalLevel: 14, minMainStat: 5 },
        { totalLevel: 17, minMainStat: 6 },
        { totalLevel: 19, minMainStat: 7 }
    ],
    9: [
        { totalLevel: 10, minMainStat: 4 },
        { totalLevel: 12, minMainStat: 5 },
        { totalLevel: 15, minMainStat: 6 },
        { totalLevel: 18, minMainStat: 7 },
        { totalLevel: 19, minMainStat: 8 }
    ],
    10: [
        { totalLevel: 10, minMainStat: 4 },
        { totalLevel: 11, minMainStat: 5 },
        { totalLevel: 14, minMainStat: 6 },
        { totalLevel: 16, minMainStat: 7 },
        { totalLevel: 18, minMainStat: 8 },
        { totalLevel: 19, minMainStat: 9 }
    ]
};

export default function HexaStatCalculator() {
    const [statNode, setStatNode] = useState('I');
    const [mainStat, setMainStat] = useState(0);
    const [fragmentCost, setFragmentCost] = useState(0);
    const [fragmentCostDisplay, setFragmentCostDisplay] = useState('');
    const [totalCost, setTotalCost] = useState({ fragments: 0, mesos: 0, resets: 0 });
    const [isSunnySunday, setIsSunnySunday] = useState(false);
    const [simulationResults, setSimulationResults] = useState({ fragments: 0, resets: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const handleStatChange = (newValue) => {
        if (newValue === '') {
            setMainStat('');
            return;
        }
        
        newValue = parseInt(newValue);
        if (isNaN(newValue)) return;
        
        newValue = Math.max(0, Math.min(10, newValue));
        setMainStat(newValue);
    };

    const handleFragmentCostChange = (e) => {
        const value = e.target.value;
        
        // Remove all non-digits
        const numericValue = value.replace(/[^0-9]/g, '');
        
        if (numericValue === '') {
            setFragmentCost(0);
            setFragmentCostDisplay('');
            return;
        }
        
        const numberValue = parseInt(numericValue);
        if (!isNaN(numberValue)) {
            // Cap at 500 billion
            const cappedValue = Math.min(numberValue, 500000000000);
            setFragmentCost(cappedValue);
            // Format with thousand separators
            setFragmentCostDisplay(cappedValue.toLocaleString());
        }
    };

    // Only run simulation when main stat or sunny sunday changes
    useEffect(() => {
        const mainStatValue = mainStat === '' ? 0 : mainStat;

        if (mainStatValue === 0) {
            setSimulationResults({ fragments: 0, resets: 0 });
            return;
        }

        setIsLoading(true);

        // Create a new worker for each simulation
        const worker = new Worker(new URL('./simulationWorker.js', import.meta.url));

        worker.onmessage = (e) => {
            const { avgFragments, avgResets } = e.data;
            setSimulationResults({
                fragments: avgFragments,
                resets: avgResets
            });
            setIsLoading(false);
            worker.terminate();
        };

        // Send data to worker
        worker.postMessage({
            targetLevel: mainStatValue,
            numSimulations: 5000,
            isSunnySunday,
            levelCosts: LEVEL_COSTS
        });

        // Cleanup worker on unmount or when dependencies change
        return () => worker.terminate();
    }, [mainStat, isSunnySunday]);

    // Calculate total cost using cached simulation results
    useEffect(() => {
        const fragmentCostValue = fragmentCost === '' ? 0 : fragmentCost;
        
        const fragmentMesos = simulationResults.fragments * fragmentCostValue;
        const resetMesos = simulationResults.resets * STAT_NODE_COSTS[statNode].reset;

        setTotalCost({
            fragments: simulationResults.fragments,
            mesos: fragmentMesos + resetMesos,
            resets: simulationResults.resets
        });
    }, [fragmentCost, statNode, simulationResults]);

    // Format large numbers with B/T/Q suffix
    const formatLargeNumber = (num) => {
        if (num === 0) return '0';
        
        const quadrillion = 1000000000000000;
        const trillion = 1000000000000;
        const billion = 1000000000;
        const million = 1000000;
        
        if (num >= quadrillion) {
            return (num / quadrillion).toFixed(1).replace(/\.0$/, '') + ' Quadrillion';
        }
        if (num >= trillion) {
            return (num / trillion).toFixed(1).replace(/\.0$/, '') + ' Trillion';
        }
        if (num >= billion) {
            return (num / billion).toFixed(1).replace(/\.0$/, '') + ' Billion';
        }
        if (num >= million) {
            return (num / million).toFixed(1).replace(/\.0$/, '') + ' Million';
        }
        return num.toLocaleString();
    };

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow max-w-2xl mx-auto">
            <div className="grid gap-6">
                <div className="flex gap-4 mb-2">
                    <button
                        onClick={() => setStatNode('I')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            statNode === 'I'
                                ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)]'
                                : 'bg-[color:var(--background)] text-[color:var(--primary)]'
                        }`}
                    >
                        Stat Node I
                    </button>
                    <button
                        onClick={() => setStatNode('II')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            statNode === 'II'
                                ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)]'
                                : 'bg-[color:var(--background)] text-[color:var(--primary)]'
                        }`}
                    >
                        Stat Node II
                    </button>
                </div>

                <div className="bg-[color:var(--background)] rounded-lg p-4">
                    <div className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="text-[color:var(--primary)]">Stat Reselection Cost:</span>
                            <span className="text-[color:var(--primary)]">{formatLargeNumber(STAT_NODE_COSTS[statNode].reselect)} mesos</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[color:var(--primary)]">Stat Reset Cost:</span>
                            <span className="text-[color:var(--primary)]">{formatLargeNumber(STAT_NODE_COSTS[statNode].reset)} mesos</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        id="sunnySunday"
                        checked={isSunnySunday}
                        onChange={(e) => setIsSunnySunday(e.target.checked)}
                        className="w-4 h-4 rounded border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--secondary)]"
                    />
                    <label htmlFor="sunnySunday" className="text-sm font-medium text-[color:var(--primary)]">
                        Sunny Sunday (+20% main stat success rate Lv. 5+)
                    </label>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[color:var(--primary)]">
                            Target Primary Stat Level (0-10)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={mainStat}
                            placeholder="0"
                            onChange={(e) => handleStatChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50 pl-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[color:var(--primary)]">
                            Fragment Cost (Mesos, max 500B)
                        </label>
                        <input
                            type="text"
                            value={fragmentCostDisplay}
                            placeholder="0"
                            onChange={handleFragmentCostChange}
                            className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50 pl-1"
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-[color:var(--background)] rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-[color:var(--primary-bright)]">Expected Cost</h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--secondary)]"></div>
                            <span className="ml-2 text-[color:var(--primary)]">Running simulation...</span>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <div className="flex justify-between">
                                <span className="text-[color:var(--primary)]">Expected Fragments Needed:</span>
                                <span className="text-[color:var(--primary)]">{totalCost.fragments.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[color:var(--primary)]">Expected Resets Needed:</span>
                                <span className="text-[color:var(--primary)]">{totalCost.resets.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[color:var(--primary)]">Total Mesos:</span>
                                <span className="text-[color:var(--primary)]">{formatLargeNumber(totalCost.mesos)} mesos</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
