'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { makeChangeId, parseUTCDate } from './scheduleEngine';

// Modal for managing dated, incremental config changes.
//
// Each change has an effective date and a set of per-boss overrides. An override
// switches a boss to a new difficulty / party size from that date onward; bosses
// left as "No change" keep whatever was active before. Changes stack in date order.
export default function ScheduledChangesModal({ open, onClose, bossData, changes, onChange }) {
  // Close on Escape for convenience.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const today = (() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .toISOString()
      .split('T')[0];
  })();

  const sortedChanges = [...changes].sort((a, b) => parseUTCDate(a.date) - parseUTCDate(b.date));

  const addChange = () => {
    onChange([...changes, { id: makeChangeId(), date: today, overrides: {} }]);
  };

  const removeChange = (id) => {
    onChange(changes.filter((c) => c.id !== id));
  };

  const updateDate = (id, date) => {
    onChange(changes.map((c) => (c.id === id ? { ...c, date } : c)));
  };

  const setOverrideDifficulty = (changeId, bossId, difficulty) => {
    onChange(
      changes.map((c) => {
        if (c.id !== changeId) return c;
        const overrides = { ...c.overrides };
        if (!difficulty) {
          delete overrides[bossId];
        } else {
          overrides[bossId] = { difficulty, partySize: overrides[bossId]?.partySize || 1 };
        }
        return { ...c, overrides };
      })
    );
  };

  const setOverridePartySize = (changeId, bossId, partySize) => {
    onChange(
      changes.map((c) => {
        if (c.id !== changeId) return c;
        const overrides = { ...c.overrides };
        if (overrides[bossId]) overrides[bossId] = { ...overrides[bossId], partySize };
        return { ...c, overrides };
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-3xl rounded-2xl border border-primary-dim bg-primary-dark shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-primary-dim p-5">
          <div>
            <h2 className="text-2xl font-semibold text-primary-bright">Scheduled Changes</h2>
            <p className="mt-1 text-sm text-primary opacity-80">
              Plan future changes to what you clear. Each change applies from its date onward and stays in
              effect until a later change overrides it. Bosses left as &ldquo;No change&rdquo; keep their
              previous setting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-2xl leading-none text-primary-bright transition hover:bg-background-bright"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
          {sortedChanges.length === 0 && (
            <div className="rounded-xl border border-dashed border-primary-dim bg-background-bright p-6 text-center text-sm text-primary opacity-80">
              No scheduled changes yet. Add one to model an upcoming difficulty or party-size change.
            </div>
          )}

          {sortedChanges.map((change) => (
            <div key={change.id} className="rounded-xl border border-primary-dim bg-background-bright p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-primary-bright">Effective date (UTC)</label>
                  <input
                    type="date"
                    value={change.date}
                    onChange={(e) => updateDate(change.id, e.target.value)}
                    className="rounded border border-primary-dim bg-primary-dark p-2 text-primary-bright"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeChange(change.id)}
                  className="rounded-md border border-red-800/50 bg-progress-red px-3 py-1.5 text-sm text-white transition hover:border-red-600 hover:bg-red-900/60"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-1.5">
                {bossData.map((boss) => {
                  const override = change.overrides?.[boss.id];
                  const maxPartySize = boss.maxPartySize || 6;
                  return (
                    <div
                      key={boss.id}
                      className="grid grid-cols-1 items-center gap-2 rounded-lg bg-primary-dark/40 px-3 py-2 sm:grid-cols-12"
                    >
                      <div className="flex items-center gap-2 sm:col-span-5">
                        <Image
                          src={`/bossImages/largeIcons/${boss.id}.png`}
                          alt={boss.name}
                          width={28}
                          height={28}
                          className="rounded"
                        />
                        <span className="text-sm text-primary-bright">{boss.name}</span>
                      </div>

                      <div className="sm:col-span-4">
                        <select
                          value={override?.difficulty || ''}
                          onChange={(e) => setOverrideDifficulty(change.id, boss.id, e.target.value)}
                          className="w-full rounded border border-primary-dim bg-primary-dark p-1.5 text-sm text-primary-bright"
                        >
                          <option value="">No change</option>
                          {boss.difficulties.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.name === 'None' ? 'Skip (None)' : `${d.name} (${d.traces})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 sm:col-span-3">
                        <label className="text-xs text-primary opacity-80">Party</label>
                        <select
                          value={override?.partySize || 1}
                          disabled={!override || override.difficulty === 'None'}
                          onChange={(e) => setOverridePartySize(change.id, boss.id, Number(e.target.value))}
                          className="w-full rounded border border-primary-dim bg-primary-dark p-1.5 text-sm text-primary-bright disabled:opacity-40"
                        >
                          {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-primary-dim p-5">
          <button
            type="button"
            onClick={addChange}
            className="rounded-md border border-primary-dim bg-primary-dark px-4 py-2 text-sm font-semibold text-primary-bright transition hover:border-secondary hover:bg-secondary hover:text-primary-dark"
          >
            + Add scheduled change
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-secondary-bright"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
