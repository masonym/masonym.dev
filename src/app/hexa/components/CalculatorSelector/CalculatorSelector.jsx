'use client';

import React, { useState } from 'react';
import ClassSelector from '../ClassSelector/ClassSelector';
import HexaStatCalculator from '../HexaStatCalculator/HexaStatCalculator';

const CalculatorSelector = () => {
    const [selectedCalculator, setSelectedCalculator] = useState('skill'); // 'skill' or 'stat'

    return (
        <div className="min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Hexa Calculator</h1>
            
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setSelectedCalculator('skill')}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                        selectedCalculator === 'skill'
                            ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)]'
                            : 'bg-[color:var(--background)] text-[color:var(--primary)]'
                    }`}
                >
                    Hexa Skill Calculator
                </button>
                <button
                    onClick={() => setSelectedCalculator('stat')}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                        selectedCalculator === 'stat'
                            ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)]'
                            : 'bg-[color:var(--background)] text-[color:var(--primary)]'
                    }`}
                >
                    Hexa Stat Calculator
                </button>
            </div>

            {selectedCalculator === 'skill' ? (
                <ClassSelector />
            ) : (
                <HexaStatCalculator />
            )}
        </div>
    );
};

export default CalculatorSelector;
