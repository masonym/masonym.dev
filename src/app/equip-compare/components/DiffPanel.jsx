"use client";

import React, { useState } from "react";
import { STAT_GROUPS, HIDDEN_DIFF_GROUPS, formatStat } from "@/lib/equip/stats";
import { statsFitClass } from "@/lib/equip/classes";
import { STAT_SOURCES } from "@/lib/equip/engine";

const GROUP_LABELS = {
  stat: "Stats",
  attack: "Attack",
  damage: "Damage",
  scaling: "Level Scaling",
};

const SOURCE_LABELS = {
  potential: "Potential",
  flame: "Bonus Stats",
  starforce: "Star Force",
  items: "Item Swaps & Set Effects",
};

/**
 * Per-stat deltas between the two loadouts, grouped, plus the set-effect
 * changes that explain deltas on gear the user did not touch.
 *
 * `slotResult`, when given, is the same comparison narrowed to the selected
 * slot: what changes if only that one piece is swapped. It is a separate
 * calculation rather than a filter over `rows`, because the question is not
 * "which of these deltas came from the hat" - set effects mean a delta need not
 * belong to any single slot - but "what do I gain by changing only the hat".
 *
 * Rows are narrowed to the stats `classKey` scales off, the same rule the bonus
 * stat and potential pickers use, so a warrior is not shown INT, LUK or Magic
 * ATT. "All classes" shows everything.
 *
 * The "By source" view splits the same deltas by the system that produced them,
 * so an upgrade that is mostly star force reads differently from one that is
 * mostly a better base item.
 */
export default function DiffPanel({
  result,
  slotResult = null,
  slotName = null,
  classKey,
}) {
  const [slotOnly, setSlotOnly] = useState(false);
  const [bySource, setBySource] = useState(false);

  if (!result) return null;

  // The preference is kept while the scope it names comes and goes: deselecting
  // a slot falls back to the whole loadout without forgetting that the narrow
  // view was wanted, so selecting the next slot lands straight back in it.
  const scoped = slotOnly && slotResult && slotName ? slotResult : result;
  const narrowed = scoped !== result;
  const { setChanges, before, after } = scoped;

  // Defence, resistances and utility resolve but are not shown - they never
  // decide a swap. Nor does a stat the class does not use.
  const visible = (list) =>
    list.filter(
      (r) =>
        !HIDDEN_DIFF_GROUPS.has(r.group) && statsFitClass([r.key], classKey),
    );
  const rows = visible(scoped.rows);
  const sources = STAT_SOURCES.map((key) => ({
    key,
    rows: visible(scoped.bySource[key]),
  })).filter((s) => s.rows.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-primary-bright">
          Difference
        </h2>
        <span className="text-xs text-primary-bright/50 text-right">
          {narrowed
            ? "this slot only"
            : `${before.items.length} → ${after.items.length} items equipped`}
        </span>
      </div>

      {slotResult && slotName && (
        <Toggle
          options={[
            ["Whole loadout", false],
            [slotName, true],
          ]}
          value={slotOnly}
          onChange={setSlotOnly}
        />
      )}

      <Toggle
        options={[
          ["Total", false],
          ["By source", true],
        ]}
        value={bySource}
        onChange={setBySource}
      />

      {narrowed && (
        <p className="-mt-2 text-[11px] text-primary-bright/40">
          Planned&rsquo;s {slotName.toLowerCase()} moved into Current,
          everything else left alone. Set bonuses the swap makes or breaks are
          counted.
        </p>
      )}

      {setChanges.length > 0 && (
        <div className="p-3 rounded-lg border border-secondary/30 bg-secondary/10">
          <h3 className="text-xs uppercase tracking-wide text-secondary mb-2">
            Set changes
          </h3>
          <ul className="space-y-1">
            {setChanges.map((c) => (
              <li
                key={c.setId}
                className="text-sm text-primary-bright flex justify-between gap-3"
              >
                <span className="truncate">{c.name}</span>
                <span
                  className={
                    c.delta > 0
                      ? "text-progress-green shrink-0"
                      : "text-progress-red shrink-0"
                  }
                >
                  {c.beforePieces} → {c.afterPieces} pc
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-primary-bright/50">
            Set bonuses count across the whole loadout, so these also change the
            stats contributed by pieces you did not swap.
          </p>
        </div>
      )}

      {(bySource ? sources.length : rows.length) === 0 ? (
        <p className="text-sm text-primary-bright/50 py-6 text-center">
          {narrowed
            ? "This slot is the same on both sides."
            : "No difference between the two loadouts yet."}
        </p>
      ) : bySource ? (
        <div className="space-y-4">
          {sources.map((source) => (
            <Section key={source.key} title={SOURCE_LABELS[source.key]}>
              <StatRows rows={source.rows} />
            </Section>
          ))}
          {rows.some((r) => r.key === "ied") && (
            <p className="text-[11px] text-primary-bright/40">
              Ignore DEF stacks multiplicatively, so each source&rsquo;s share
              does not add up to the total.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {STAT_GROUPS.map((group) => {
            const inGroup = rows.filter((r) => r.group === group);
            if (!inGroup.length) return null;
            return (
              <Section key={group} title={GROUP_LABELS[group] ?? group}>
                <StatRows rows={inGroup} />
              </Section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** A two-way segmented switch. `options` is [[label, value], ...]. */
function Toggle({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(([label, option]) => (
        <button
          key={label}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`flex-1 min-w-0 truncate px-2 py-1 text-[11px] rounded-lg border transition-colors ${
            value === option
              ? "border-secondary bg-secondary/20 text-secondary font-semibold"
              : "border-primary-dim text-primary-bright/60 hover:text-primary-bright hover:border-secondary/50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-primary-bright/50 mb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

/** One row per stat: its label, before → after, and the signed change. */
function StatRows({ rows }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.key}
            className="border-b border-primary-dim/40 last:border-0"
          >
            <td className="py-1 text-primary-bright/80">{row.label}</td>
            <td className="py-1 text-right text-primary-bright/40 tabular-nums text-xs">
              {formatStat(row.key, row.before)} →{" "}
              {formatStat(row.key, row.after)}
            </td>
            <td
              className={`py-1 pl-3 text-right tabular-nums font-medium w-24 ${
                row.delta > 0 ? "text-progress-green" : "text-progress-red"
              }`}
            >
              {row.delta > 0 ? "+" : ""}
              {formatStat(row.key, row.delta)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
