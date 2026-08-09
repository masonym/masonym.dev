'use client';

import React from 'react';
import EquipCompare from './components/EquipCompare';

export default function Page() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-1 text-center">Equipment Comparison</h1>
      <p className="text-center text-sm text-primary-bright/50 mb-6">
        Compare two loadouts and see exactly which stats you gain or lose, set effects included.
      </p>
      <EquipCompare />
    </div>
  );
}
