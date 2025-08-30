'use client';

import React, { useEffect, useState } from 'react';
import GenesisLiberationCalculator from './components/GenesisLiberationCalculator';
import DestinyLiberationCalculator from './components/DestinyLiberationCalculator';

const tabs = [
  { key: 'genesis', label: 'Genesis Liberation' },
  { key: 'destiny', label: 'Destiny Liberation' },
];

const STORAGE_KEY = 'liberationActiveTab';

export default function LiberationPageClient() {
  const [active, setActive] = useState('genesis');

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved && tabs.some(t => t.key === saved)) {
        setActive(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, active);
      }
    } catch {
      // ignore storage errors
    }
  }, [active]);

  const baseBtn = 'inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold transition shadow-lg ring-1 ring-black/5';
  const activeBtn = 'bg-secondary text-primary-dark hover:bg-secondary-bright scale-[1.02]';
  const inactiveBtn = 'bg-background-bright text-primary-bright hover:bg-primary-dark';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            aria-pressed={active === t.key}
            onClick={() => setActive(t.key)}
            className={`${baseBtn} ${active === t.key ? activeBtn : inactiveBtn}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {active === 'genesis' ? (
          <GenesisLiberationCalculator />
        ) : (
          <DestinyLiberationCalculator />
        )}
      </div>
    </div>
  );
}
