'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, List } from 'lucide-react';
import FamiliarsClient from './FamiliarsClient';
import FamiliarLinesClient from './FamiliarLinesClient';

const TABS = [
  { id: 'directory', label: 'Familiar Directory', icon: BookOpen, component: FamiliarsClient },
  { id: 'lines', label: 'Familiar Lines', icon: List, component: FamiliarLinesClient },
];

const STORAGE_KEY = 'masonym-familiars-tab';

const FamiliarsPageClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'directory'
  );

  // On mount, fall back to the last-used tab from localStorage if the URL didn't specify one.
  useEffect(() => {
    if (tabFromUrl) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TABS.some((t) => t.id === saved)) {
        setActiveTab(saved);
      }
    } catch {
      // localStorage may be unavailable in some environments
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync with back/forward navigation.
  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeTab);
    } catch {
      // ignore storage errors
    }
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || FamiliarsClient;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                  border transition-all
                  ${isActive
                    ? 'bg-[var(--secondary)]/20 border-[var(--secondary)]/60 text-[var(--secondary)]'
                    : 'bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)] hover:text-[var(--primary-bright)] hover:border-[var(--secondary)]/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <ActiveComponent />
    </div>
  );
};

export default FamiliarsPageClient;
