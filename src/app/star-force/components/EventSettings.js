'use client'

import React from 'react';

const events = [
    { id: 'none', label: 'No Event' },
    { id: 'twoStars', label: '2 stars for 10-Star-Force-Enhancements and lower' },
    { id: 'thirtyOff', label: '30% off Star Force Enhancements' },
    { id: 'hundredSuccess', label: '100% success rate for Star Force 5, 10, and 15 enhancements' },
    { id: 'shiningStarForce', label: 'Shining Star Force (30% off + 100% success)' }
];

export default function EventSettings({ settings, onChange }) {
    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--primary-bright)]">Star Force Event</h2>
            <div className="space-y-2">
                {events.map(event => (
                    <label key={event.id} className="flex items-start">
                        <input
                            type="radio"
                            name="event"
                            value={event.id}
                            checked={settings.type === event.id}
                            onChange={(e) => onChange({ ...settings, type: e.target.value })}
                            className="mt-1 rounded-full border-[color:var(--primary-dim)] text-[color:var(--secondary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-[color:var(--primary)]">{event.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
