'use client';

import React, { useMemo } from 'react';
import {
  FLAME_LINES, FLAME_TIERS, acceptsFlames, conflictingFlameLine, flameContext,
  flameLineValue, flameLinesFor,
} from '@/lib/equip/flames';
import { starCap, starFloor, gainsStarForceAttack } from '@/lib/equip/starforce';
import { getClass } from '@/lib/equip/classes';
import { hasPreset } from '@/lib/equip/specialItems';
import {
  exceptionalGains, exceptionalSlots, potentialAllowedOn, potentialIslot,
  potentialLevelIndex, potentialValueAt,
} from '@/lib/equip/engine';
import { STAT_META, formatStat } from '@/lib/equip/stats';

const MAX_FLAME_LINES = 4;

const POT_GRADES = [
  { value: 4, label: 'Legendary' },
  { value: 3, label: 'Unique' },
  { value: 2, label: 'Epic' },
  { value: 1, label: 'Rare' },
];

/**
 * Editor for the selected slot: the item plus its star force, flames and
 * potential.
 */
export default function SlotEditor({ slotName, config, item, data, classKey, onChange, onOpenPicker }) {
  const update = (patch) => onChange({ ...(config || {}), ...patch });

  const cap = starCap(item);
  const floor = starFloor(item);
  const levelIndex = item ? potentialLevelIndex(item.reqLevel) : 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[16rem]">
          <label className="block text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">
            Item
          </label>
          <div className="flex items-center gap-2">
            {item?.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/equip-icons/${item.icon}`}
                alt=""
                className="max-w-8 max-h-8 shrink-0"
                draggable={false}
              />
            )}
            <span className="min-w-0 flex-1 truncate text-sm text-primary-bright">
              {item ? item.name : <span className="text-primary-bright/40">Empty</span>}
            </span>
            <button
              type="button"
              onClick={onOpenPicker}
              className="shrink-0 px-2 py-1 text-xs rounded border border-primary-dim text-primary-bright/70 hover:text-primary-bright hover:border-secondary/50 transition-colors"
            >
              {item ? 'Change' : 'Choose'}
            </button>
            {item && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="shrink-0 px-2 py-1 text-xs rounded border border-primary-dim text-primary-bright/50 hover:text-progress-red hover:border-progress-red/40 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {item && <StarForce config={config} update={update} cap={cap} floor={floor} />}

        {exceptionalSlots(item) > 0 && (
          <Exceptional config={config} update={update} item={item} />
        )}
      </div>

      {!item && (
        <p className="text-xs text-primary-bright/40">
          Pick an item for the {slotName.toLowerCase()} slot to configure it.
        </p>
      )}

      {item && (
        <>
          <ItemNotes item={item} cap={cap} floor={floor} classKey={classKey} />

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4">
            {acceptsFlames(item) ? (
              <FlameMatrix config={config} update={update} item={item} />
            ) : (
              <div>
                <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">
                  Bonus Stats
                </h4>
                <p className="text-[11px] text-primary-bright/40">
                  A Rebirth Flame cannot be used on this slot, so it carries no bonus stats.
                </p>
              </div>
            )}

            {item.noPotential ? (
              <div className="xl:w-[20rem]">
                <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">
                  Potential
                </h4>
                <p className="text-[11px] text-primary-bright/40">
                  This item cannot receive potential.
                </p>
              </div>
            ) : (
              <PotentialColumn
                lines={config?.potentials ?? []}
                onLines={(potentials) => update({ potentials })}
                preset={item.presetPotential}
                item={item}
                data={data}
                levelIndex={levelIndex}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Star force control.
 *
 * The range is the item's own, not the level table's: Genesis weapons are handed
 * over at 22★ and stop there, Red Beryl at 20★, and a medal cannot be starred at
 * all. Where the floor meets the cap there is nothing to choose, so the control
 * states the star count instead of offering a slider that cannot move.
 */
function StarForce({ config, update, cap, floor }) {
  const stars = Math.min(Math.max(config?.stars ?? 0, floor), cap);
  const fixed = cap <= floor;

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">
        Star Force
      </label>

      {fixed ? (
        <p className="text-sm text-primary-bright/70 py-1">
          {cap === 0
            ? 'Cannot be star forced'
            : <>Fixed at <span className="text-secondary">{cap}★</span></>}
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={floor}
            max={cap}
            value={stars}
            onChange={(e) => update({ stars: Number(e.target.value) })}
            className="w-40 accent-[color:var(--secondary)]"
            aria-label="Star force"
          />
          <input
            type="number"
            min={floor}
            max={cap}
            value={stars}
            onChange={(e) =>
              update({ stars: Math.max(floor, Math.min(cap, Number(e.target.value) || 0)) })
            }
            className="w-14 px-1 py-1 text-xs text-center rounded border border-primary-dim bg-background-bright text-primary-bright focus:outline-none focus:border-secondary"
          />
          <span className="text-[11px] text-primary-bright/40">/ {cap}★</span>
        </div>
      )}
    </div>
  );
}

/**
 * Exceptional Enhancement.
 *
 * Six items in the game accept an Exceptional Hammer, and each application adds
 * the same block of stats — so the only thing to enter is how many have been
 * used. What one is worth comes from Item/Consume via the build; see
 * `docs/equip-compare-data.md`.
 */
function Exceptional({ config, update, item }) {
  const max = exceptionalSlots(item);
  const applied = Math.min(Math.max(config?.exceptional ?? 0, 0), max);

  // What one hammer is worth, so the control says what it is doing. Defence and
  // MP are dropped as noise; they are still counted in the difference.
  const each = Object.entries(exceptionalGains(item, 1) ?? {})
    .filter(([key]) => ['stat', 'attack'].includes(STAT_META[key]?.group))
    .map(([key, value]) => `${STAT_META[key].label} +${formatStat(key, value)}`)
    .join(', ');

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">
        Exceptional
      </label>
      <div className="flex items-center gap-1">
        {Array.from({ length: max + 1 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-pressed={applied === n}
            onClick={() => update({ exceptional: n })}
            className={`w-8 py-1 text-xs rounded border tabular-nums transition-colors ${
              applied === n
                ? 'border-secondary bg-secondary/20 text-secondary font-semibold'
                : 'border-primary-dim text-primary-bright/60 hover:text-primary-bright hover:border-secondary/50'
            }`}
          >
            {n}
          </button>
        ))}
        <span className="ml-1 text-[11px] text-primary-bright/40">
          / {max} hammer{max === 1 ? '' : 's'}
        </span>
      </div>
      {each && <p className="mt-1 text-[10px] text-primary-bright/40">Each: {each}</p>}
    </div>
  );
}

/** The item's quirks, stated only when it has any. */
function ItemNotes({ item, cap, floor, classKey }) {
  const notes = [];

  if (floor > 0) {
    notes.push([
      'granted',
      `Comes at ${floor}★${cap > floor ? `, and can be taken to ${cap}★` : ' and cannot be enhanced further'}.`,
    ]);
  }

  if (hasPreset(item) && !getClass(classKey).mainStat) {
    notes.push([
      'preset',
      'This item is granted with a fixed potential and bonus stats. Pick a class above and'
      + ' re-select it to have those filled in.',
    ]);
  } else if (item.fixedPotential && !item.presetPotential && !hasPreset(item)) {
    // The WZ records only that the potential is fixed, not which lines it rolls —
    // those are chosen per job when the item is granted.
    notes.push([
      'fixed',
      "Comes with a fixed potential that is not in the game files, so enter it from the item's"
      + ' own description.',
    ]);
  }

  if (item.superior) {
    notes.push(['superior', 'Superior equipment — caps at 15★ and uses a different star force table.']);
  }
  if (item.growth) {
    notes.push([
      'growth',
      'Growth equip: stats are rolled randomly as it levels, so the base values here are the'
      + ' unleveled ones.',
    ]);
  }
  if (item.exceptionalSlots > 0) {
    notes.push([
      'exceptional',
      `Accepts ${item.exceptionalSlots} exceptional enhancement${item.exceptionalSlots === 1 ? '' : 's'}.`,
    ]);
  }
  if (cap > 0 && !gainsStarForceAttack(item.slot)) {
    notes.push(['noattack', 'This slot takes stat from star force but never attack.']);
  }

  if (!notes.length) return null;

  return (
    <div className="space-y-1">
      {notes.map(([key, text]) => (
        <p key={key} className="text-[11px] text-primary-bright/50">{text}</p>
      ))}
    </div>
  );
}

/**
 * Bonus stats as a stat × tier grid.
 *
 * A flame roll is two facts — which line, and what tier — and the pair of
 * dropdowns per line made entering four of them eight interactions with no view
 * of what any of it was worth. The grid shows every value at once and takes one
 * click per line, which is the same shape whackybeanz uses.
 *
 * Only the lines that can actually roll on this item are listed — boss damage
 * is weapons-only, speed and jump are not — and only the tiers each line can
 * reach are clickable, which is what makes the two weapon attack rows readable:
 * an ordinary weapon rolls attack at tiers 1-5, a flame advantaged one at 3-7,
 * and the two are worth different amounts at the tiers they share.
 */
function FlameMatrix({ config, update, item }) {
  const flames = config?.flames ?? [];

  const ctx = useMemo(() => flameContext(item), [item]);

  const rows = useMemo(
    () => flameLinesFor(item)
      .map((line) => ({
        line,
        label: FLAME_LINES[line].label,
        cells: FLAME_TIERS.map((tier) => flameLineValue(line, tier, ctx)),
      }))
      .filter((row) => row.cells.some(Boolean)),
    [item, ctx],
  );

  const tierOf = (line) => flames.find((f) => f.line === line)?.tier ?? 0;
  const full = flames.length >= MAX_FLAME_LINES;

  const toggle = (line, tier) => {
    const current = tierOf(line);
    if (current === tier) {
      update({ flames: flames.filter((f) => f.line !== line) });
      return;
    }
    if (current) {
      update({ flames: flames.map((f) => (f.line === line ? { line, tier } : f)) });
      return;
    }
    // Ordinary and boss-flame attack are one bonus stat rolled off two tables,
    // so taking one replaces the other rather than stacking with it.
    const conflict = conflictingFlameLine(line);
    const kept = conflict ? flames.filter((f) => f.line !== conflict) : flames;
    if (kept.length < MAX_FLAME_LINES) update({ flames: [...kept, { line, tier }] });
  };

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between mb-1 gap-2">
        <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50">Bonus Stats</h4>
        <span className="text-[11px] text-primary-bright/40">
          {flames.length} / {MAX_FLAME_LINES} lines
          {flames.length > 0 && (
            <button
              type="button"
              onClick={() => update({ flames: [] })}
              className="ml-2 text-primary-bright/50 hover:text-progress-red"
            >
              clear
            </button>
          )}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-[11px] border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="sr-only">Line</th>
              {FLAME_TIERS.map((tier) => (
                <th
                  key={tier}
                  className="w-9 pb-0.5 font-normal text-primary-bright/40 tabular-nums"
                >
                  T{tier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ line, label, cells }) => {
              const selected = tierOf(line);
              // Swapping to the line's counterpart frees a slot as it takes one,
              // so it stays reachable even with all four lines used.
              const swappable = Boolean(tierOf(conflictingFlameLine(line) ?? ''));
              return (
                <tr key={line}>
                  <th
                    scope="row"
                    className={`pr-2 text-right font-normal whitespace-nowrap ${
                      selected ? 'text-secondary' : 'text-primary-bright/60'
                    }`}
                  >
                    {label}
                  </th>
                  {cells.map((cell, idx) => {
                    const tier = FLAME_TIERS[idx];
                    const active = selected === tier;
                    // A line you have not taken yet is unreachable once all four
                    // are used, but the tiers of the ones you have stay live.
                    const locked = !cell || (full && !selected && !swappable);

                    return (
                      <td key={tier}>
                        <button
                          type="button"
                          disabled={locked}
                          aria-pressed={active}
                          aria-label={`${label} tier ${tier}`}
                          onClick={() => toggle(line, tier)}
                          className={`w-9 py-0.5 rounded border tabular-nums transition-colors ${
                            active
                              ? 'border-secondary bg-secondary/20 text-secondary font-semibold'
                              : locked
                                ? 'border-transparent text-primary-bright/15 cursor-default'
                                : 'border-primary-dim/60 text-primary-bright/70 hover:border-secondary/60 hover:text-primary-bright'
                          }`}
                        >
                          {cell ? `${cell.value}${cell.percent ? '%' : ''}` : '–'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * The item's three potential lines.
 *
 * Every grade is offered in one list rather than behind a grade filter, because
 * a real potential mixes them — a Unique item rolls one unique line and two epic
 * ones, which a filtered list could not represent.
 */
function PotentialColumn({ lines, onLines, preset, item, data, levelIndex }) {
  // A preset is only *shown* as fixed while the user has entered nothing. The
  // first override seeds the selects from it rather than starting blank.
  const showingPreset = Boolean(preset?.length) && lines.length === 0;

  const describe = (line) => {
    const stats = potentialValueAt(line, levelIndex) || {};
    const parts = Object.entries(stats).map(([k, v]) => `${k} +${v}`);
    return parts.length ? `${line.desc} (${parts.join(', ')})` : line.desc;
  };

  const byGrade = useMemo(() => {
    const usable = data.potentials
      .filter((p) => p.kind === 'regular' && potentialAllowedOn(p, potentialIslot(item)))
      // Drop lines that resolve to nothing at this item's level.
      .filter((p) => {
        const stats = potentialValueAt(p, levelIndex);
        return stats && Object.keys(stats).length > 0;
      });

    return POT_GRADES.map((grade) => ({
      ...grade,
      options: usable.filter((p) => p.grade === grade.value)
        .sort((a, b) => a.desc.localeCompare(b.desc)),
    })).filter((g) => g.options.length > 0);
  }, [data.potentials, item, levelIndex]);

  const setLine = (idx, optionId) => {
    const next = [...lines];
    next[idx] = optionId ? { optionId } : null;
    onLines(next.filter(Boolean));
  };

  if (showingPreset) {
    return (
      <div className="xl:w-[20rem]">
        <div className="flex items-center justify-between mb-1 gap-1">
          <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50">Potential</h4>
          <button
            type="button"
            onClick={() => onLines(preset.map(({ optionId }) => ({ optionId })))}
            className="shrink-0 text-[11px] text-primary-bright/50 hover:text-secondary"
          >
            Override
          </button>
        </div>

        <div className="space-y-1">
          {preset.map(({ optionId }, idx) => {
            const line = data.lineIndex.get(optionId);
            return (
              <p
                key={`${optionId}-${idx}`}
                className="px-1 py-1 text-xs rounded border border-primary-dim/50 bg-background-bright/40 text-primary-bright/70 truncate"
              >
                {line ? describe(line) : `Line ${optionId}`}
              </p>
            );
          })}
        </div>

        <p className="mt-1 text-[10px] text-primary-bright/40">
          Fixed by the item — already counted in the difference.
        </p>
      </div>
    );
  }

  return (
    <div className="xl:w-[20rem]">
      <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50 mb-1">Potential</h4>

      <div className="space-y-1">
        {[0, 1, 2].map((idx) => (
          <select
            key={idx}
            value={lines[idx]?.optionId ?? ''}
            onChange={(e) => setLine(idx, e.target.value ? Number(e.target.value) : null)}
            aria-label={`Potential line ${idx + 1}`}
            className="w-full px-1 py-1 text-xs rounded border border-primary-dim bg-background-bright text-primary-bright focus:outline-none focus:border-secondary"
          >
            <option value="">— line {idx + 1} —</option>
            {byGrade.map((grade) => (
              <optgroup key={grade.value} label={grade.label}>
                {grade.options.map((p) => (
                  <option key={p.id} value={p.id}>{describe(p)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}
