'use client'

import React from 'react';
import LiberationCalculator from './components/LiberationCalculator';

export default function Page() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary-bright">Liberation Schedule Calculator</h1>
      <LiberationCalculator />
    </div>
  );
}
