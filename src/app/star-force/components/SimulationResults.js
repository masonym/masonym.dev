'use client'

import React from 'react';

export default function SimulationResults({ results }) {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    };

    // Calculate total simulations (each simulation either succeeds or is destroyed)
    const totalSimulations = results.successes + Math.floor(results.destructions);

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow mt-6">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--primary-bright)]">Simulation Results</h2>
            
            {/* Basic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Total Simulations</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(totalSimulations)}</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Success Rate</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-green)]">
                        {formatNumber(results.successes)} ({((results.successes / totalSimulations) * 100).toFixed(1)}%)
                    </div>
                    <div className="text-sm text-[color:var(--primary-dim)]">
                        reached target star
                    </div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Destruction Rate</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">
                        {formatNumber(results.destructions)} ({((results.destructions / totalSimulations) * 100).toFixed(1)}%)
                    </div>
                    <div className="text-sm text-[color:var(--primary-dim)]">
                        destroyed before target
                    </div>
                </div>
            </div>

            {/* Meso Stats */}
            <h3 className="text-lg font-semibold mb-3 text-[color:var(--primary-bright)]">Meso Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Average Cost</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.averageCost)} mesos</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Median Cost</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.medianCost)} mesos</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Cost Range</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">
                        {formatNumber(results.minCost)} - {formatNumber(results.maxCost)} mesos
                    </div>
                </div>
            </div>

            {/* Destruction Stats */}
            <h3 className="text-lg font-semibold mb-3 text-[color:var(--primary-bright)]">Destruction Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Average Booms</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.averageBooms.toFixed(2)} per success</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Median Booms</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.medianBooms} per success</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Boom Range</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">
                        {results.minBooms} - {results.maxBooms} per success
                    </div>
                </div>
            </div>
        </div>
    );
}
