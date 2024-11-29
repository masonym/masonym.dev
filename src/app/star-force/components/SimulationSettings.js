'use client'

import React, { useState } from 'react';

export default function SimulationSettings({ settings, onChange }) {
    // Keep track of the display value separately for formatting
    const [displayValue, setDisplayValue] = useState(settings.numSimulations.toLocaleString());

    const handleChange = (value) => {
        // Remove any non-digit characters for parsing
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // Allow empty input
        if (numericValue === '') {
            setDisplayValue('');
            onChange({
                ...settings,
                numSimulations: 10000 // Default value if empty
            });
            return;
        }

        // Parse the numeric value
        const parsedValue = parseInt(numericValue);
        
        // Clamp the value between 1 and 100,000
        const clampedValue = Math.min(Math.max(parsedValue, 1), 100000);
        
        // Update the display value with thousand separators
        setDisplayValue(clampedValue.toLocaleString());
        
        // Update the actual value in the parent component
        onChange({
            ...settings,
            numSimulations: clampedValue
        });
    };

    // Handle blur to ensure the display value is properly formatted
    const handleBlur = () => {
        if (displayValue === '') {
            setDisplayValue('10,000');
            onChange({
                ...settings,
                numSimulations: 10000
            });
        }
    };

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--primary-bright)]">Simulation Settings</h2>
            <div>
                <label className="block text-sm font-medium text-[color:var(--primary)]">
                    Number of Successful Simulations
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9,]*"
                    value={displayValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                />
                <p className="mt-1 text-sm text-[color:var(--primary-dim)]">
                    Default: 10,000 simulations (max: 100,000)
                </p>
            </div>
        </div>
    );
}
