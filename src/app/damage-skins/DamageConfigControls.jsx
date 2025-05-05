"use client";
import React from 'react';

export default function DamageConfigControls({ minDamage, maxDamage, linesCount, critRate, fadeDuration, onChange, onFadeChange }) {
  return (
    <div className="space-y-6 p-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Damage Range</label>
        <div className="flex items-center space-x-2 mt-1">
          <div className="flex items-center border rounded overflow-hidden bg-white dark:bg-gray-700">
            <button onClick={() => onChange({ min: minDamage - 10000, max: maxDamage, lines: linesCount, crit: critRate })} className="px-2 text-gray-600 dark:text-gray-300">-</button>
            <input
              type="number"
              className="w-24 text-center p-1 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={minDamage}
              onChange={e => onChange({ min: Number(e.target.value), max: maxDamage, lines: linesCount, crit: critRate })}
            />
            <button onClick={() => onChange({ min: minDamage + 10000, max: maxDamage, lines: linesCount, crit: critRate })} className="px-2 text-gray-600 dark:text-gray-300">+</button>
          </div>
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <div className="flex items-center border rounded overflow-hidden bg-white dark:bg-gray-700">
            <button onClick={() => onChange({ min: minDamage, max: maxDamage - 10000, lines: linesCount, crit: critRate })} className="px-2 text-gray-600 dark:text-gray-300">-</button>
            <input
              type="number"
              className="w-24 text-center p-1 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={maxDamage}
              onChange={e => onChange({ min: minDamage, max: Number(e.target.value), lines: linesCount, crit: critRate })}
            />
            <button onClick={() => onChange({ min: minDamage, max: maxDamage + 10000, lines: linesCount, crit: critRate })} className="px-2 text-gray-600 dark:text-gray-300">+</button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Lines</label>
        <div className="flex items-center space-x-2 mt-1">
          <button onClick={() => onChange({ min: minDamage, max: maxDamage, lines: linesCount - 1, crit: critRate })} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">-</button>
          <input
            type="number"
            className="w-24 text-center p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
            value={linesCount}
            onChange={e => onChange({ min: minDamage, max: maxDamage, lines: Number(e.target.value), crit: critRate })}
          />
          <button onClick={() => onChange({ min: minDamage, max: maxDamage, lines: linesCount + 1, crit: critRate })} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">+</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Crit Rate (%)</label>
        <div className="flex items-center space-x-2 mt-1">
          <button onClick={() => onChange({ min: minDamage, max: maxDamage, lines: linesCount, crit: critRate - 1 })} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">-</button>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-24 text-center p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
            value={critRate}
            onChange={e => onChange({ min: minDamage, max: maxDamage, lines: linesCount, crit: Number(e.target.value) })}
          />
          <button onClick={() => onChange({ min: minDamage, max: maxDamage, lines: linesCount, crit: critRate + 1 })} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">+</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Fade Duration (ms)</label>
        <div className="flex items-center space-x-2 mt-1">
          <button onClick={() => onFadeChange(Math.max(0, fadeDuration - 500))} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">-</button>
          <input
            type="number"
            className="w-24 text-center p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
            value={fadeDuration}
            onChange={e => onFadeChange(Number(e.target.value))}
          />
          <button onClick={() => onFadeChange(fadeDuration + 500)} className="px-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">+</button>
        </div>
      </div>
    </div>
  );
}
