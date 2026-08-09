'use client';

import React from 'react';
import { STAT_GROUPS, HIDDEN_DIFF_GROUPS, formatStat } from '@/lib/equip/stats';

const GROUP_LABELS = {
  stat: 'Stats',
  attack: 'Attack',
  damage: 'Damage',
  scaling: 'Level Scaling',
  utility: 'Utility',
};

/**
 * Per-stat deltas between the two loadouts, grouped, plus the set-effect
 * changes that explain deltas on gear the user did not touch.
 */
export default function DiffPanel({ result }) {
  if (!result) return null;

  const { setChanges, before, after } = result;

  // Defence and resistances resolve but are not shown — they never decide a swap.
  const rows = result.rows.filter((r) => !HIDDEN_DIFF_GROUPS.has(r.group));

  const byGroup = new Map();
  for (const row of rows) {
    if (!byGroup.has(row.group)) byGroup.set(row.group, []);
    byGroup.get(row.group).push(row);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-primary-bright">Difference</h2>
        <span className="text-xs text-primary-bright/50">
          {before.items.length} → {after.items.length} items equipped
        </span>
      </div>

      {setChanges.length > 0 && (
        <div className="p-3 rounded-lg border border-secondary/30 bg-secondary/10">
          <h3 className="text-xs uppercase tracking-wide text-secondary mb-2">Set changes</h3>
          <ul className="space-y-1">
            {setChanges.map((c) => (
              <li key={c.setId} className="text-sm text-primary-bright flex justify-between gap-3">
                <span className="truncate">{c.name}</span>
                <span className={c.delta > 0 ? 'text-progress-green shrink-0' : 'text-progress-red shrink-0'}>
                  {c.beforePieces} → {c.afterPieces} pc
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-primary-bright/50">
            Set bonuses count across the whole loadout, so these also change the stats contributed
            by pieces you did not swap.
          </p>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-primary-bright/50 py-6 text-center">
          No difference between the two loadouts yet.
        </p>
      ) : (
        <div className="space-y-4">
          {STAT_GROUPS.filter((g) => byGroup.has(g)).map((group) => (
            <div key={group}>
              <h3 className="text-xs uppercase tracking-wide text-primary-bright/50 mb-1">
                {GROUP_LABELS[group] ?? group}
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {byGroup.get(group).map((row) => (
                    <tr key={row.key} className="border-b border-primary-dim/40 last:border-0">
                      <td className="py-1 text-primary-bright/80">{row.label}</td>
                      <td className="py-1 text-right text-primary-bright/40 tabular-nums text-xs">
                        {formatStat(row.key, row.before)} → {formatStat(row.key, row.after)}
                      </td>
                      <td
                        className={`py-1 pl-3 text-right tabular-nums font-medium w-24 ${
                          row.delta > 0 ? 'text-progress-green' : 'text-progress-red'
                        }`}
                      >
                        {row.delta > 0 ? '+' : ''}
                        {formatStat(row.key, row.delta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
