'use client'

import React, { useState } from 'react';
import Image from 'next/image';

const QUICK_REFERENCES = [
    {
        id: 'astra-secondary',
        label: 'Astra Secondary',
        cost: 1_000_000_000,
        currency: 'mesos',
        equipLevel: 200,
        imagePath: '/equipImages/astra-secondary.png',
    },
    {
        id: 'destiny-weapon',
        label: 'Destiny Weapon',
        cost: 10_000_000_000,
        currency: 'mesos',
        equipLevel: 250,
        imagePath: '/equipImages/destiny-weapon.png',
    },
    {
        id: 'eternal',
        label: 'Eternal Spare',
        cost: 10,
        currency: 'boss pieces',
        equipLevel: 250,
        imagePath: '/equipImages/eternal-hat.png',
    },
    {
        id: 'superior-gollux',
        label: 'Superior Gollux Item',
        cost: 700,
        currency: 'Gollux Coins',
        equipLevel: 150,
        imagePath: '/equipImages/superior-gollux.png',
    },
    {
        id: 'sweetwater-tattoo',
        label: 'Sweetwater Tattoo / Monocle',
        cost: 250,
        currency: 'Denaro',
        equipLevel: 160,
        imagePath: '/equipImages/sweetwater-monocle.png',
    },
    {
        id: 'sweetwater-pendant',
        label: 'Sweetwater Pendant',
        cost: 400,
        currency: 'Denaro',
        equipLevel: 160,
        imagePath: '/equipImages/sweetwater-pendant.png',
    },
];

const formatCost = (cost, currency) => {
    if (currency === 'mesos') {
        if (cost >= 1_000_000_000) return `${(cost / 1_000_000_000).toFixed(cost % 1_000_000_000 === 0 ? 0 : 1)}b meso`;
        if (cost >= 1_000_000) return `${(cost / 1_000_000).toFixed(cost % 1_000_000 === 0 ? 0 : 1)}m meso`;
        return new Intl.NumberFormat('en-US').format(cost);
    }
    return `${new Intl.NumberFormat('en-US').format(cost)} ${currency}`;
};

export default function SpareItemSettings({ settings, onChange, onEquipmentChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rawValue, setRawValue] = useState('');

    const handleCostChange = (value) => {
        const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
        setRawValue(isNaN(numeric) ? '' : new Intl.NumberFormat('en-US').format(numeric));
        onChange({
            ...settings,
            sparePrice: isNaN(numeric) ? 0 : numeric,
        });
    };

    const handleCurrencyChange = (currency) => {
        onChange({ ...settings, currency });
    };

    const applyPreset = (preset) => {
        setRawValue(new Intl.NumberFormat('en-US').format(preset.cost));
        onChange({
            ...settings,
            sparePrice: preset.cost,
            currency: preset.currency,
            label: preset.label,
        });
        if (onEquipmentChange && preset.equipLevel) {
            onEquipmentChange((prev) => ({ ...prev, level: preset.equipLevel }));
        }
    };

    const displayValue = rawValue !== '' ? rawValue : (settings.sparePrice > 0 ? new Intl.NumberFormat('en-US').format(settings.sparePrice) : '');

    return (
        <div className="p-4 bg-[color:var(--primary-dark)] rounded-lg shadow">
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="w-full flex items-center justify-between text-left"
            >
                <div>
                    <h2 className="text-xl font-semibold text-[color:var(--primary-bright)]">Spare Item Cost</h2>
                    {!isOpen && settings.sparePrice > 0 && (
                        <p className="text-sm text-[color:var(--secondary)] mt-0.5">
                            {formatCost(settings.sparePrice, settings.currency)} per spare
                            {settings.label ? ` - ${settings.label}` : ''}
                        </p>
                    )}
                </div>
                <span className="text-[color:var(--primary-dim)] text-lg select-none">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4">
                    {/* Manual entry */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[color:var(--primary)]">
                                Spare Price
                            </label>
                            <input
                                type="text"
                                min="0"
                                placeholder="0"
                                inputMode="numeric"
                                pattern="[0-9,]*"
                                value={displayValue}
                                onChange={(e) => handleCostChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[color:var(--primary)]">
                                Currency
                            </label>
                            <input
                                type="text"
                                placeholder="mesos"
                                value={settings.currency}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-[color:var(--primary-dim)] bg-[color:var(--background)] text-[color:var(--primary)] shadow-sm focus:border-[color:var(--secondary)] focus:ring focus:ring-[color:var(--secondary)] focus:ring-opacity-50"
                            />
                        </div>
                    </div>
                    {/* Quick references */}
                    <div>
                        <h3 className="text-sm font-semibold text-[color:var(--primary-bright)] mb-2">
                            Quick References
                        </h3>
                        <div className="space-y-2">
                            {QUICK_REFERENCES.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => applyPreset(preset)}
                                    className="w-full flex items-center gap-3 p-2 rounded bg-[color:var(--background)] hover:bg-[color:var(--primary-dim)] transition-colors text-left group"
                                >
                                    {preset.imagePath ? (
                                        <Image
                                            src={preset.imagePath}
                                            alt={preset.label}
                                            width={32}
                                            height={32}
                                            className="rounded object-contain flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-[color:var(--primary-dim)] flex-shrink-0 flex items-center justify-center text-[color:var(--primary)] text-xs font-bold">
                                            ?
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-[color:var(--primary)] truncate">
                                            {preset.label}
                                        </span>
                                        <span className="block text-xs text-[color:var(--secondary)]">
                                            {formatCost(preset.cost, preset.currency)}
                                            {preset.equipLevel && (
                                                <span className="text-[color:var(--primary-dim)] ml-1">· Lv. {preset.equipLevel}</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-xs text-[color:var(--primary-dim)] group-hover:text-[color:var(--primary)] transition-colors flex-shrink-0">
                                        Apply  
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {settings.sparePrice > 0 && (
                        <button
                            onClick={() => {
                                setRawValue('');
                                onChange({ ...settings, sparePrice: 0, label: '' });
                            }}
                            className="text-sm text-[color:var(--progress-red)] hover:underline"
                        >
                            Clear spare cost
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
