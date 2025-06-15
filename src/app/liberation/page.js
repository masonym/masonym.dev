'use client'

import React from 'react';
import LiberationCalculator from './components/LiberationCalculator';

export default function Page() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary-bright">Liberation Schedule Calculator</h1>
      <h4 className="text-lg max-w-2xl mx-auto font-semibold mb-6 text-center text-primary-bright">This calculator was heavily inspired by <a className="text-blue-500 hover:underline" href="https://mapleroad.kr/utils/liberation" target="_blank" rel="noopener noreferrer">Maple Road's Liberation Schedule Calculator.</a> Please check out their calculator and support it if you find it useful!</h4>
      <LiberationCalculator />
    </div>
  );
}
