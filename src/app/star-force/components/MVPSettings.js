'use client'

import React from 'react';

const mvpTypes = [
    { id: 'none', label: 'None' },
    { id: 'silver', label: 'MVP Silver (3% discount up to 17th star)' },
    { id: 'gold', label: 'MVP Gold (5% discount up to 17th star)' },
    { id: 'platinum', label: 'MVP Platinum (10% discount up to 17th star)' }
];

export default function MVPSettings({ settings, onChange }) {
    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--primary-bright)]">MVP Discount</h2>
            <div className="space-y-2">
                {mvpTypes.map(mvp => (
                    <label key={mvp.id} className="flex items-start">
                        <input
                            type="radio"
                            name="mvp"
                            value={mvp.id}
                            checked={settings.type === mvp.id}
                            onChange={(e) => onChange({ ...settings, type: e.target.value })}
                            className="mt-1 rounded-full border-[color:var(--primary-dim)] text-[color:var(--secondary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-[color:var(--primary)]">{mvp.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
