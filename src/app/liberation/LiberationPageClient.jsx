'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import GenesisLiberationCalculator from './components/GenesisLiberationCalculator';
import DestinyLiberationCalculator from './components/DestinyLiberationCalculator';

const tabs = [
  { key: 'genesis', label: 'Genesis Liberation' },
  { key: 'destiny', label: 'Destiny Liberation' },
];

const STORAGE_KEY = 'liberationActiveTab';

export default function LiberationPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get('tab');
  const [active, setActive] = useState(
    tabs.some(t => t.key === tabFromUrl) ? tabFromUrl : 'genesis'
  );

  // Initialize from localStorage on mount if the URL didn't specify a tab
  useEffect(() => {
    if (tabFromUrl) return;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved && tabs.some(t => t.key === saved)) {
        setActive(saved);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync with back/forward navigation
  useEffect(() => {
    if (tabFromUrl && tabs.some(t => t.key === tabFromUrl) && tabFromUrl !== active) {
      setActive(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

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

  const handleTabChange = useCallback((key) => {
    setActive(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

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
            onClick={() => handleTabChange(t.key)}
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
