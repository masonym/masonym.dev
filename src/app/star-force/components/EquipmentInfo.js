'use client'

import React from 'react';
import { getMaxStars } from '../utils';

export default function EquipmentInfo({ info, onChange }) {
    const handleChange = (field, value) => {
        // Allow empty string for better UX while typing
        if (value === '') {
            onChange({ ...info, [field]: '' });
            return;
        }

        const newValue = parseInt(value) || 0;
        const updates = { ...info };

        if (field === 'level') {
            // Restrict equipment level to 0-250
            updates.level = Math.min(Math.max(newValue, 0), 250);
            
            // Adjust current and target stars if they exceed the new max
            const maxStars = getMaxStars(updates.level);
            updates.currentStars = Math.min(updates.currentStars, maxStars);
            updates.targetStars = Math.min(updates.targetStars, maxStars);
        } else {
            const maxStars = getMaxStars(info.level);
            updates[field] = Math.min(Math.max(newValue, 0), maxStars);
        }

        onChange(updates);
    };

    const maxStars = getMaxStars(info.level);

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[color:var(--primary-bright)]">Equipment Information</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[color:var(--primary)]">
                        Equipment Level
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="250"
                        placeholder='0'
                        value={info.level === 0 ? '' : info.level}
                        onChange={(e) => handleChange('level', e.target.value)}
                        className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                    />
                    <p className="mt-1 text-sm text-[color:var(--primary-dim)]">
                        Level 0-250
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[color:var(--primary)]">
                        Current Star Force
                    </label>
                    <input
                        type="number"
                        min="0"
                        max={maxStars}
                        value={info.currentStars === 0 ? '' : info.currentStars}
                        placeholder='0'
                        onChange={(e) => handleChange('currentStars', e.target.value)}
                        className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                    />
                    <p className="mt-1 text-sm text-[color:var(--primary-dim)]">
                        {info.level > 0 ? `0-${maxStars} stars available` : 'Enter equipment level first'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[color:var(--primary)]">
                        Target Star Force
                    </label>
                    <input
                        type="number"
                        min="0"
                        max={maxStars}
                        value={info.targetStars === 0 ? '' : info.targetStars}
                        placeholder='0'
                        onChange={(e) => handleChange('targetStars', e.target.value)}
                        className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                    />
                    <p className="mt-1 text-sm text-[color:var(--primary-dim)]">
                        {info.level > 0 ? `0-${maxStars} stars available` : 'Enter equipment level first'}
                    </p>
                </div>
            </div>
        </div>
    );
}
