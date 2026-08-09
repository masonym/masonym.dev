'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CLASSES } from '@/lib/equip/classes';
import {
  LEVEL_STEPS, byPower, filterItemsForSlot, levelFilterApplies, slotCandidates,
} from '@/lib/equip/itemFilter';
import { formatStat } from '@/lib/equip/stats';
import { maxStars, starCap } from '@/lib/equip/starforce';

/**
 * Modal item picker for one equipment slot.
 *
 * Candidates are the items that *fit* the slot, which is narrower than the
 * items that occupy it: a two-handed weapon covers the secondary slot but can
 * only be equipped into the weapon slot, so it must not appear in the Secondary
 * list. See equippableSlots() in the engine.
 *
 * Beyond that the list is unfiltered by default and ordered strongest-first —
 * see itemFilter.js for why nothing is hidden.
 */

/** Stats worth showing on a picker row, in the order they read best. */
const SUMMARY_KEYS = [
  ['att', 'ATT'], ['matt', 'MATT'],
  ['allStat', 'All Stat'], ['allStatP', 'All Stat'],
  ['str', 'STR'], ['dex', 'DEX'], ['int', 'INT'], ['luk', 'LUK'],
  ['boss', 'Boss'], ['ied', 'IED'],
];

const MAIN_STATS = ['str', 'dex', 'int', 'luk'];

const MAX_RESULTS = 200;

/**
 * The stats to print on a row.
 *
 * Gear that grants the same amount of every main stat is all-stat gear, and the
 * WZ writes it out one stat at a time. Printed literally, and then truncated to
 * the first few, the Eternal shoulder's 51 of everything read as "STR 51 DEX 51"
 * — which says the wrong thing twice. Equal main stats are folded back into the
 * All Stat line the game shows.
 */
function summaryStats(stats = {}) {
  const out = { ...stats };

  for (const suffix of ['', 'P']) {
    const keys = MAIN_STATS.map((k) => `${k}${suffix}`);
    const values = keys.map((k) => out[k] ?? 0);
    if (!values.every((v) => v > 0) || new Set(values).size !== 1) continue;

    const combined = `allStat${suffix}`;
    out[combined] = (out[combined] ?? 0) + values[0];
    for (const k of keys) delete out[k];
  }

  return out;
}

export default function ItemPickerModal({
  slotKey,
  slotName,
  items,
  setIndex,
  currentId,
  classKey,
  onClassChange,
  filters,
  onFiltersChange,
  onPick,
  onClear,
  onClose,
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const levelApplies = levelFilterApplies(slotKey);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const candidates = useMemo(
    () => filterItemsForSlot(items, { slotKey, classKey, currentId, ...filters }),
    [items, slotKey, classKey, currentId, filters],
  );

  const hiddenCount = useMemo(
    () => slotCandidates(items, slotKey, classKey).length - candidates.length,
    [items, slotKey, classKey, candidates.length],
  );

  // Strongest first, always. The list is not filtered down to what someone
  // decided is worth comparing, so the ordering is what has to do that work.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? candidates.filter((i) => i.name.toLowerCase().includes(q))
      : [...candidates];

    // Within a search, an item whose name *starts* with the query is what was
    // being looked for; power orders each group.
    const strongestFirst = byPower(classKey, setIndex);
    matches.sort((a, b) => {
      if (q) {
        const rank = (i) => (i.name.toLowerCase().startsWith(q) ? 0 : 1);
        const d = rank(a) - rank(b);
        if (d !== 0) return d;
      }
      return strongestFirst(a, b);
    });

    return matches.slice(0, MAX_RESULTS);
  }, [candidates, query, classKey, setIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Choose ${slotName}`}
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-primary-dim bg-primary-dark shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-primary-dim space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary-bright">
              Choose <span className="text-secondary">{slotName}</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-primary-bright/50 hover:text-primary-bright"
            >
              Close
            </button>
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${candidates.length} items…`}
            className="w-full px-2.5 py-2 text-sm rounded-lg bg-background-bright border border-primary-dim text-primary-bright placeholder:text-primary-bright/30 focus:outline-none focus:border-secondary"
          />

          <div className="flex flex-wrap gap-1">
            {CLASSES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => onClassChange(c.key)}
                className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                  c.key === classKey
                    ? 'border-secondary text-secondary bg-secondary/10'
                    : 'border-primary-dim text-primary-bright/50 hover:text-primary-bright'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-primary-bright/50">
            <label className="flex items-center gap-1 cursor-pointer hover:text-primary-bright">
              <input
                type="checkbox"
                checked={filters.notableOnly}
                onChange={(e) => onFiltersChange({ notableOnly: e.target.checked })}
                className="accent-[color:var(--secondary)]"
              />
              Boss drops and set gear only
            </label>
            {filters.notableOnly && (
              <span className="text-progress-orange/70">misses some gear</span>
            )}

            {levelApplies && (
              <span className="flex items-center gap-1">
                Lv
                <select
                  value={filters.minLevel}
                  onChange={(e) => onFiltersChange({ minLevel: Number(e.target.value) })}
                  className="px-1 py-0.5 rounded border border-primary-dim bg-background-bright text-primary-bright focus:outline-none"
                >
                  {LEVEL_STEPS.map((l) => (
                    <option key={l} value={l}>{l === 0 ? 'any' : `${l}+`}</option>
                  ))}
                </select>
              </span>
            )}

            {hiddenCount > 0 && (
              <span className="text-primary-bright/30">{hiddenCount} hidden</span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {currentId && (
            <button
              type="button"
              onClick={onClear}
              className="w-full text-left px-3 py-2 text-xs text-progress-red/80 hover:bg-primary-dim/40 border-b border-primary-dim/60"
            >
              Remove the equipped item
            </button>
          )}

          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-primary-bright/40">
              {hiddenCount > 0
                ? 'Nothing matches. Try widening the filters above.'
                : 'Nothing fits this slot for the selected class.'}
            </p>
          )}

          {results.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              selected={item.id === currentId}
              onPick={onPick}
            />
          ))}

          {results.length === MAX_RESULTS && (
            <p className="px-3 py-2 text-center text-[11px] text-primary-bright/30">
              Strongest {MAX_RESULTS} shown — search to reach the rest.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, selected, onPick }) {
  const stats = summaryStats(item.stats);
  const summary = SUMMARY_KEYS
    .filter(([k]) => stats[k])
    .slice(0, 4)
    .map(([k, label]) => `${label} ${formatStat(k, stats[k])}`)
    .join(' · ');

  // Only stated when the item disagrees with its level: it is the one thing
  // telling the three Astra grades, or a Genesis weapon and its Destiny upgrade,
  // apart in a list where they otherwise share a name.
  const cap = starCap(item);
  const capNote = cap === maxStars(item.reqLevel, Boolean(item.superior))
    ? null
    : (cap === 0 ? 'no ★' : `${cap}★ max`);

  return (
    <button
      type="button"
      onClick={() => onPick(item.id)}
      className={`w-full text-left px-3 py-1.5 flex items-center gap-3 hover:bg-primary-dim/40 border-b border-primary-dim/30 last:border-0 ${
        selected ? 'bg-secondary/10' : ''
      }`}
    >
      <span className="w-9 h-9 shrink-0 flex items-center justify-center">
        {item.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/equip-icons/${item.icon}`}
            alt=""
            loading="lazy"
            className="max-w-9 max-h-9"
            draggable={false}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${selected ? 'text-secondary' : 'text-primary-bright'}`}>
          {item.name}
        </span>
        {summary && (
          <span className="block truncate text-[11px] text-primary-bright/40">{summary}</span>
        )}
      </span>

      <span className="shrink-0 text-right text-[11px] text-primary-bright/40 tabular-nums">
        <span className="block">Lv {item.reqLevel}</span>
        {capNote && <span className="block text-primary-bright/30">{capNote}</span>}
      </span>
    </button>
  );
}
