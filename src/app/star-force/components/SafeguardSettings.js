'use client'

import React from 'react';

export default function SafeguardSettings({ settings, onChange }) {
    const toggleStar = (star) => {
        const newStars = settings.stars.includes(star)
            ? settings.stars.filter(s => s !== star)
            : [...settings.stars, star].sort((a, b) => a - b);
        onChange({ ...settings, stars: newStars });
    };

    const selectAll = () => {
        onChange({ ...settings, stars: [15, 16] });
    };

    const clearAll = () => {
        onChange({ ...settings, stars: [] });
    };

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[color:var(--primary-bright)]">Safeguard</h2>
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
            <div className="flex gap-4">
                {[15, 16].map((star) => (
                    <button
                        key={star}
                        onClick={() => toggleStar(star)}
                        className={`flex-1 p-4 rounded-lg text-center transition-colors ${
                            settings.stars.includes(star)
                                ? 'bg-[color:var(--secondary)] text-[color:var(--primary-dark)] hover:bg-[color:var(--secondary-bright)]'
                                : 'bg-[color:var(--background)] text-[color:var(--primary)] hover:bg-[color:var(--primary-dim)]'
                        }`}
                    >
                        {star}★ → {star + 1}★
                    </button>
                ))}
            </div>
            <p className="mt-4 text-sm text-[color:var(--primary-dim)]">
                Click to toggle Safeguard for 15★ and 16★ enhancements
            </p>
        </div>
    );
}
