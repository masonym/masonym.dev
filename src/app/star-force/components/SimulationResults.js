'use client'

import React from 'react';

export default function SimulationResults({ results, sparePrice = 0, spareCurrency = 'mesos', spareLabel = '' }) {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    };

    const formatCurrency = (num, currency) => {
        const formatted = formatNumber(num);
        return currency === 'mesos' ? `${formatted} mesos` : `${formatted} ${currency}`;
    };

    const totalSimulations = results.numSimulations;
    const reachRatePct = totalSimulations > 0
        ? (results.numReached / totalSimulations) * 100
        : 0;

    const hasSpare = sparePrice > 0;

    // Spare cost stats derive linearly from the simulated boom distribution.
    const avgSpareCost = hasSpare ? results.averageBooms * sparePrice : 0;
    const p5SpareCost = hasSpare ? results.p5Booms * sparePrice : 0;
    const p50SpareCost = hasSpare ? results.p50Booms * sparePrice : 0;
    const p95SpareCost = hasSpare ? results.p95Booms * sparePrice : 0;

    const avgTotalCost = results.averageCost + avgSpareCost;
    const p5TotalCost = results.p5Cost + p5SpareCost;
    const p50TotalCost = results.p50Cost + p50SpareCost;
    const p95TotalCost = results.p95Cost + p95SpareCost;

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
                    <div className="text-sm text-[color:var(--primary-dim)]">Reached Target</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-green)]">
                        {formatNumber(results.numReached)} ({reachRatePct.toFixed(1)}%)
                    </div>
                    {results.numStuck > 0 && (
                        <div className="text-sm text-[color:var(--progress-red)]">
                            {formatNumber(results.numStuck)} runs hit the attempt cap
                        </div>
                    )}
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Total Booms</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">
                        {formatNumber(results.totalBooms)}
                    </div>
                    <div className="text-sm text-[color:var(--primary-dim)]">
                        across all simulations
                    </div>
                </div>
            </div>

            {/* Meso Stats */}
            <h3 className="text-lg font-semibold mb-1 text-[color:var(--primary-bright)]">Meso Statistics</h3>
            <p className="text-sm text-[color:var(--primary-dim)] mb-3">
                Distribution across runs that reached the target star.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Average</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.averageCost)} mesos</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">5th percentile (lucky)</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.p5Cost)} mesos</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">50th percentile (median)</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.p50Cost)} mesos</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">95th percentile (unlucky)</div>
                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(results.p95Cost)} mesos</div>
                </div>
            </div>

            {/* Destruction Stats */}
            <h3 className="text-lg font-semibold mb-1 text-[color:var(--primary-bright)]">Destruction Statistics</h3>
            <p className="text-sm text-[color:var(--primary-dim)] mb-3">
                Booms per successful run.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">Average</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.averageBooms.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">5th percentile</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.p5Booms}</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">50th percentile</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.p50Booms}</div>
                </div>
                <div className="p-3 bg-[color:var(--background)] rounded">
                    <div className="text-sm text-[color:var(--primary-dim)]">95th percentile</div>
                    <div className="text-lg font-semibold text-[color:var(--progress-red)]">{results.p95Booms}</div>
                </div>
            </div>

            {/* Spare Item Cost Stats */}
            {hasSpare && (
                <>
                    <h3 className="text-lg font-semibold mb-1 text-[color:var(--primary-bright)]">
                        Spare Item Cost
                        {spareLabel && (
                            <span className="ml-2 text-sm font-normal text-[color:var(--secondary)]">
                                - {spareLabel}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-[color:var(--primary-dim)] mb-3">
                        {formatCurrency(sparePrice, spareCurrency)} per spare × booms per success
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-3 bg-[color:var(--background)] rounded">
                            <div className="text-sm text-[color:var(--primary-dim)]">Average</div>
                            <div className="text-lg font-semibold text-[color:var(--secondary)]">
                                {formatCurrency(avgSpareCost, spareCurrency)}
                            </div>
                        </div>
                        <div className="p-3 bg-[color:var(--background)] rounded">
                            <div className="text-sm text-[color:var(--primary-dim)]">5th percentile</div>
                            <div className="text-lg font-semibold text-[color:var(--secondary)]">
                                {formatCurrency(p5SpareCost, spareCurrency)}
                            </div>
                        </div>
                        <div className="p-3 bg-[color:var(--background)] rounded">
                            <div className="text-sm text-[color:var(--primary-dim)]">50th percentile</div>
                            <div className="text-lg font-semibold text-[color:var(--secondary)]">
                                {formatCurrency(p50SpareCost, spareCurrency)}
                            </div>
                        </div>
                        <div className="p-3 bg-[color:var(--background)] rounded">
                            <div className="text-sm text-[color:var(--primary-dim)]">95th percentile</div>
                            <div className="text-lg font-semibold text-[color:var(--secondary)]">
                                {formatCurrency(p95SpareCost, spareCurrency)}
                            </div>
                        </div>
                    </div>

                    {spareCurrency === 'mesos' && (
                        <>
                            <h3 className="text-lg font-semibold mb-3 text-[color:var(--primary-bright)]">
                                Total Cost (Mesos + Spare)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-[color:var(--background)] rounded border border-[color:var(--secondary)]">
                                    <div className="text-sm text-[color:var(--primary-dim)]">Average</div>
                                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(avgTotalCost)} mesos</div>
                                </div>
                                <div className="p-3 bg-[color:var(--background)] rounded border border-[color:var(--secondary)]">
                                    <div className="text-sm text-[color:var(--primary-dim)]">5th percentile</div>
                                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(p5TotalCost)} mesos</div>
                                </div>
                                <div className="p-3 bg-[color:var(--background)] rounded border border-[color:var(--secondary)]">
                                    <div className="text-sm text-[color:var(--primary-dim)]">50th percentile</div>
                                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(p50TotalCost)} mesos</div>
                                </div>
                                <div className="p-3 bg-[color:var(--background)] rounded border border-[color:var(--secondary)]">
                                    <div className="text-sm text-[color:var(--primary-dim)]">95th percentile</div>
                                    <div className="text-lg font-semibold text-[color:var(--primary)]">{formatNumber(p95TotalCost)} mesos</div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
