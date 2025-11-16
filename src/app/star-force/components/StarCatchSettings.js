'use client'

import React from 'react';

export default function StarCatchSettings({ settings, onChange }) {
    const toggleStar = (star) => {
        const newStars = settings.stars.includes(star)
            ? settings.stars.filter(s => s !== star)
            : [...settings.stars, star].sort((a, b) => a - b);
        onChange({ ...settings, stars: newStars });
    };

    const selectAll = () => {
        onChange({ ...settings, stars: Array.from({ length: 30 }, (_, i) => i) });
    };

    const clearAll = () => {
        onChange({ ...settings, stars: [] });
    };

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[color:var(--primary-bright)]">Star Catch Settings</h2>
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 bg-[color:var(--secondary)] text-[color:var(--primary-dark)] rounded-lg hover:bg-[color:var(--secondary-bright)] text-sm transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 bg-[color:var(--background)] text-[color:var(--primary)] rounded-lg hover:bg-[color:var(--primary-dim)] text-sm transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => toggleStar(i)}
                        className={`p-2 rounded-lg text-center transition-colors ${
                            settings.stars.includes(i)
                                ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)] hover:bg-[color:var(--secondary-bright)]'
                                : 'bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--primary-dim)]'
                        }`}
                    >
                        {i}★
                    </button>
                ))}
            </div>
        </div>
    );
}
