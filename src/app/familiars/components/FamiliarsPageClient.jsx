'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, List } from 'lucide-react';
import FamiliarsClient from './FamiliarsClient';
import FamiliarLinesClient from './FamiliarLinesClient';

const TABS = [
  { id: 'directory', label: 'Familiar Directory', icon: BookOpen, component: FamiliarsClient },
  { id: 'lines', label: 'Familiar Lines', icon: List, component: FamiliarLinesClient },
];

const STORAGE_KEY = 'masonym-familiars-tab';

const FamiliarsPageClient = () => {
  const [activeTab, setActiveTab] = useState('directory');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TABS.some((t) => t.id === saved)) {
        setActiveTab(saved);
      }
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeTab);
    } catch {
      // ignore storage errors
    }
  }, [activeTab]);

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
                onClick={() => setActiveTab(tab.id)}
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
