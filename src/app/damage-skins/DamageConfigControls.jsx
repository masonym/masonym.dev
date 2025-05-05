"use client";
import React from 'react';

export default function DamageConfigControls({ minDamage, maxDamage, linesCount, critRate, onChange }) {
  return (
    <div className="flex space-x-4 mb-4">
      <div>
        <label className="block text-sm">Min Damage</label>
        <input
          type="number"
          value={minDamage}
          onChange={e => onChange({ min: Number(e.target.value), max: maxDamage, lines: linesCount, crit: critRate })}
          className="border rounded p-1 w-20"
        />
      </div>
      <div>
        <label className="block text-sm">Max Damage</label>
        <input
          type="number"
          value={maxDamage}
          onChange={e => onChange({ min: minDamage, max: Number(e.target.value), lines: linesCount, crit: critRate })}
          className="border rounded p-1 w-20"
        />
      </div>
      <div>
        <label className="block text-sm">Lines</label>
        <input
          type="number"
          value={linesCount}
          onChange={e => onChange({ min: minDamage, max: maxDamage, lines: Number(e.target.value), crit: critRate })}
          className="border rounded p-1 w-20"
        />
      </div>
      <div>
        <label className="block text-sm">Crit Rate</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={critRate}
          onChange={e => onChange({ min: minDamage, max: maxDamage, lines: linesCount, crit: Number(e.target.value) })}
          className="border rounded p-1 w-20"
        />
      </div>
    </div>
  );
}
