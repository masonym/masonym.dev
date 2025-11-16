'use client'

import React from 'react';

const events = [
    { id: 'twoStars', label: '2 stars for 10-Star-Force-Enhancements and lower' },
    { id: 'thirtyOff', label: '30% off Star Force Enhancements' },
    { id: 'destructionReduction', label: '30% Destruction Reduction (to 21 stars)' }
];

export default function EventSettings({ settings, onChange }) {
    const toggleEvent = (eventId) => {
        const newTypes = settings.types.includes(eventId)
            ? settings.types.filter(id => id !== eventId)
            : [...settings.types, eventId];
        onChange({ ...settings, types: newTypes });
    };

    const selectAll = () => {
        onChange({ ...settings, types: events.map(e => e.id) });
    };

    const clearAll = () => {
        onChange({ ...settings, types: [] });
    };

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[color:var(--primary-bright)]">Star Force Events</h2>
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
            <div className="space-y-2">
                {events.map(event => (
                    <label key={event.id} className="flex items-start">
                        <input
                            type="checkbox"
                            value={event.id}
                            checked={settings.types.includes(event.id)}
                            onChange={() => toggleEvent(event.id)}
                            className="mt-1 rounded border-[color:var(--primary-dim)] text-[color:var(--secondary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-[color:var(--primary)]">{event.label}</span>
                    </label>
                ))}
            </div>
            {settings.types.length > 0 && (
                <p className="mt-4 text-sm text-[color:var(--primary-dim)]">
                    {settings.types.length} event{settings.types.length > 1 ? 's' : ''} active
                </p>
            )}
        </div>
    );
}
