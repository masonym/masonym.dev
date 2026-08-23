"use client";

import React, { useMemo } from "react";
import {
  FLAME_LINES,
  FLAME_TIERS,
  acceptsFlames,
  flameContext,
  flameLineValue,
  flameLinesFor,
  flameTierRange,
  isFlameAdvantaged,
  isWeaponSlot,
} from "@/lib/equip/flames";
import {
  starCap,
  starFloor,
  starForceGains,
  gainsStarForceAttack,
} from "@/lib/equip/starforce";
import { getClass } from "@/lib/equip/classes";
import { hasPreset } from "@/lib/equip/specialItems";
import {
  exceptionalGains,
  exceptionalSlots,
  potentialAllowedOn,
  potentialIslot,
  potentialLevelIndex,
} from "@/lib/equip/engine";
import { potentialLabel, potentialOptions } from "@/lib/equip/potentialText";
import { STAT_META, formatStat } from "@/lib/equip/stats";

const MAX_FLAME_LINES = 4;
const POTENTIAL_LINES = 3;

const POT_GRADES = [
  { value: 4, label: "Legendary" },
  { value: 3, label: "Unique" },
  { value: 2, label: "Epic" },
  { value: 1, label: "Rare" },
];

/**
 * Editor for the selected slot: the item plus its star force, flames and
 * potential.
 *
 * Each of those is its own panel rather than another row in one long stack,
 * because they are answered independently - "how many stars" has nothing to do
 * with "which potential lines" - and a flat stack made the boundaries invisible.
 */
export default function SlotEditor({
  slotName,
  config,
  item,
  data,
  classKey,
  onChange,
  onOpenPicker,
}) {
  const update = (patch) => onChange({ ...(config || {}), ...patch });

  const cap = starCap(item);
  const floor = starFloor(item);
  const levelIndex = item ? potentialLevelIndex(item.reqLevel) : 1;

  if (!item) {
    return (
      <div className="space-y-3">
        <ItemBar item={null} onOpenPicker={onOpenPicker} onChange={onChange} />
        <p className="text-xs text-primary-bright/40">
          Pick an item for the {slotName.toLowerCase()} slot to configure it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ItemBar item={item} onOpenPicker={onOpenPicker} onChange={onChange} />

      <ItemNotes item={item} cap={cap} floor={floor} classKey={classKey} />

      <div className="grid gap-3 items-start xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <StarForce
              config={config}
              update={update}
              item={item}
              cap={cap}
              floor={floor}
            />
            {exceptionalSlots(item) > 0 && (
              <Exceptional config={config} update={update} item={item} />
            )}
          </div>

          {acceptsFlames(item) ? (
            <FlameMatrix config={config} update={update} item={item} />
          ) : (
            <Panel title="Bonus Stats">
              <p className="text-[11px] text-primary-bright/40">
                A Rebirth Flame cannot be used on this slot, so it carries no
                bonus stats.
              </p>
            </Panel>
          )}
        </div>

        {item.noPotential ? (
          <Panel title="Potential">
            <p className="text-[11px] text-primary-bright/40">
              This item cannot receive potential.
            </p>
          </Panel>
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
    </div>
  );
}

/** A titled section. `aside` sits opposite the title, for per-panel controls. */
function Panel({ title, aside, children }) {
  return (
    <section className="min-w-0 rounded-xl border border-primary-dim/70 bg-primary-dark/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
        <h4 className="text-[11px] uppercase tracking-wide text-primary-bright/50">
          {title}
        </h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** The equipped item, and the two things you can do to it. */
function ItemBar({ item, onOpenPicker, onChange }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-primary-dim/70 bg-primary-dark/40 px-3 py-2">
      <span className="w-8 h-8 shrink-0 flex items-center justify-center">
        {item?.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/equip-icons/${item.icon}`}
            alt=""
            className="max-w-8 max-h-8"
            draggable={false}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-primary-bright">
          {item ? (
            item.name
          ) : (
            <span className="text-primary-bright/40">Empty</span>
          )}
        </span>
        {item && (
          <span className="block text-[11px] text-primary-bright/40 tabular-nums">
            REQ LEV {item.reqLevel}
            {item.setId ? " · set item" : ""}
            {item.bossDrop ? " · boss drop" : ""}
          </span>
        )}
      </span>

      <button
        type="button"
        onClick={onOpenPicker}
        className="shrink-0 px-2 py-1 text-xs rounded border border-primary-dim text-primary-bright/70 hover:text-primary-bright hover:border-secondary/50 transition-colors"
      >
        {item ? "Change" : "Choose"}
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
  );
}

/**
 * Star counts worth one click.
 *
 * The ones people actually stop at: the safeguard boundaries (10, 15), the
 * points where the cost curve turns (17, 20, 22), and the ends of the item's own
 * range. Dragging a slider to exactly 17 is a fiddly way to enter a number that
 * only ever takes a handful of values.
 */
const STAR_STEPS = [0, 5, 10, 12, 15, 17, 18, 20, 21, 22, 25, 30];

function starPresets(floor, cap) {
  const inside = STAR_STEPS.filter((s) => s > floor && s < cap);
  return [...new Set([floor, ...inside, cap])].sort((a, b) => a - b);
}

/**
 * What a star count is worth, in the terms the rest of the tool uses.
 *
 * Star force adds the same amount to all four main stats, so printing them one
 * at a time says the same thing four times.
 */
function starSummary(gains) {
  if (!gains) return null;

  const parts = [];
  const main = ["str", "dex", "int", "luk"].map((k) => gains[k] ?? 0);
  if (main[0] && main.every((v) => v === main[0])) {
    parts.push(`+${main[0]} all stats`);
  } else {
    for (const [i, key] of ["str", "dex", "int", "luk"].entries()) {
      if (main[i]) parts.push(`+${main[i]} ${STAT_META[key].label}`);
    }
  }

  if (gains.att && gains.att === gains.matt)
    parts.push(`+${gains.att} ATT / MATT`);
  else {
    if (gains.att) parts.push(`+${gains.att} ATT`);
    if (gains.matt) parts.push(`+${gains.matt} MATT`);
  }
  if (gains.hp) parts.push(`+${gains.hp} Max HP`);

  return parts.join(" · ");
}

/**
 * Star force control.
 *
 * The range is the item's own, not the level table's: Genesis weapons are handed
 * over at 22★ and stop there, Red Beryl at 20★, and a medal cannot be starred at
 * all. Where the floor meets the cap there is nothing to choose, so the control
 * states the star count instead of offering a slider that cannot move.
 */
function StarForce({ config, update, item, cap, floor }) {
  const stars = Math.min(Math.max(config?.stars ?? 0, floor), cap);
  const fixed = cap <= floor;

  const presets = useMemo(() => starPresets(floor, cap), [floor, cap]);

  const summary = useMemo(() => {
    if (stars <= 0) return null;
    return starSummary(
      starForceGains({
        level: item.reqLevel,
        stars,
        slot: item.slot,
        superior: Boolean(item.superior),
        gainsAtt: gainsStarForceAttack(item.slot),
        baseAttack: item.stats?.att ?? 0,
        baseMagic: item.stats?.matt ?? 0,
      }),
    );
  }, [item, stars]);

  const setStars = (n) => update({ stars: Math.max(floor, Math.min(cap, n)) });

  return (
    <Panel
      title="Star Force"
      aside={
        <span className="text-sm font-semibold tabular-nums text-secondary">
          {stars}★
          <span className="text-[11px] font-normal text-primary-bright/40">
            {" "}
            / {cap}
          </span>
        </span>
      }
    >
      {fixed ? (
        <p className="text-xs text-primary-bright/60">
          {cap === 0
            ? "This item cannot be star forced."
            : "Fixed by the item."}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {presets.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={stars === n}
                onClick={() => setStars(n)}
                className={`px-1.5 py-0.5 text-[11px] rounded border tabular-nums transition-colors ${
                  stars === n
                    ? "border-secondary bg-secondary/20 text-secondary font-semibold"
                    : "border-primary-dim text-primary-bright/60 hover:text-primary-bright hover:border-secondary/50"
                }`}
              >
                {n}★
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Stepper
              label="One star fewer"
              onClick={() => setStars(stars - 1)}
              disabled={stars <= floor}
            >
              −
            </Stepper>
            <input
              type="range"
              min={floor}
              max={cap}
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              className="flex-1 min-w-0 accent-[color:var(--secondary)]"
              aria-label="Star force"
            />
            <Stepper
              label="One star more"
              onClick={() => setStars(stars + 1)}
              disabled={stars >= cap}
            >
              +
            </Stepper>
          </div>
        </div>
      )}

      {summary && (
        <p className="mt-2 text-[10px] text-primary-bright/40">
          Grants {summary}
        </p>
      )}
    </Panel>
  );
}

function Stepper({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-6 h-6 shrink-0 rounded border border-primary-dim text-primary-bright/60 leading-none disabled:opacity-30 disabled:cursor-default hover:enabled:text-primary-bright hover:enabled:border-secondary/50 transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Exceptional Enhancement.
 *
 * Six items in the game accept an Exceptional Hammer, and each application adds
 * the same block of stats - so the only thing to enter is how many have been
 * used. What one is worth comes from Item/Consume via the build; see
 * `docs/equip-compare-data.md`.
 */
function Exceptional({ config, update, item }) {
  const max = exceptionalSlots(item);
  const applied = Math.min(Math.max(config?.exceptional ?? 0, 0), max);

  // What one hammer is worth, so the control says what it is doing. Defence and
  // MP are dropped as noise; they are still counted in the difference.
  const each = Object.entries(exceptionalGains(item, 1) ?? {})
    .filter(([key]) => ["stat", "attack"].includes(STAT_META[key]?.group))
    .map(([key, value]) => `${STAT_META[key].label} +${formatStat(key, value)}`)
    .join(", ");

  return (
    <Panel
      title="Exceptional"
      aside={
        <span className="text-[11px] text-primary-bright/40 tabular-nums">
          {applied} / {max} hammer{max === 1 ? "" : "s"}
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-1">
        {Array.from({ length: max + 1 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-pressed={applied === n}
            onClick={() => update({ exceptional: n })}
            className={`w-8 py-1 text-xs rounded border tabular-nums transition-colors ${
              applied === n
                ? "border-secondary bg-secondary/20 text-secondary font-semibold"
                : "border-primary-dim text-primary-bright/60 hover:text-primary-bright hover:border-secondary/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {each && (
        <p className="mt-2 text-[10px] text-primary-bright/40">Each: {each}</p>
      )}
    </Panel>
  );
}

/** The item's quirks, stated only when it has any. */
function ItemNotes({ item, cap, floor, classKey }) {
  const notes = [];

  if (floor > 0) {
    notes.push([
      "granted",
      `Comes at ${floor}★${cap > floor ? `, and can be taken to ${cap}★` : " and cannot be enhanced further"}.`,
    ]);
  }

  if (hasPreset(item) && !getClass(classKey).mainStat) {
    notes.push([
      "preset",
      "This item is granted with a fixed potential and bonus stats. Pick a class above and" +
        " re-select it to have those filled in.",
    ]);
  } else if (item.fixedPotential && !item.presetPotential && !hasPreset(item)) {
    // The WZ records only that the potential is fixed, not which lines it rolls -
    // those are chosen per job when the item is granted.
    notes.push([
      "fixed",
      "Comes with a fixed potential that is not in the game files, so enter it from the item's" +
        " own description.",
    ]);
  }

  if (item.superior) {
    notes.push([
      "superior",
      "Superior equipment - caps at 15★ and uses a different star force table.",
    ]);
  }
  if (item.growth) {
    notes.push([
      "growth",
      "Growth equip: stats are rolled randomly as it levels, so the base values here are the" +
        " unleveled ones.",
    ]);
  }
  if (cap > 0 && !gainsStarForceAttack(item.slot)) {
    notes.push([
      "noattack",
      "This slot takes stat from star force but never attack.",
    ]);
  }

  if (!notes.length) return null;

  return (
    <ul className="space-y-0.5">
      {notes.map(([key, text]) => (
        <li key={key} className="text-[11px] text-primary-bright/50">
          {text}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bonus stats as a stat × tier grid.
 *
 * A flame roll is two facts - which line, and what tier - and the pair of
 * dropdowns per line made entering four of them eight interactions with no view
 * of what any of it was worth. The grid shows every value at once and takes one
 * click per line, which is the same shape whackybeanz uses.
 *
 * Only the lines that can actually roll on this item are listed - boss damage is
 * weapons-only, speed and jump are not - and only the tiers each line can reach
 * are clickable. On a weapon that second rule is doing real work: the attack line
 * runs 1-5 on an ordinary weapon and 3-7 on a flame advantaged one, and the two
 * are worth different amounts at the tiers they share.
 */
function FlameMatrix({ config, update, item }) {
  const flames = config?.flames ?? [];
  const weapon = isWeaponSlot(item.slot);

  const ctx = useMemo(() => flameContext(item, config), [item, config]);

  const rows = useMemo(
    () =>
      flameLinesFor(item, config)
        .map((line) => ({
          line,
          label: FLAME_LINES[line].label,
          cells: FLAME_TIERS.map((tier) => flameLineValue(line, tier, ctx)),
        }))
        .filter((row) => row.cells.some(Boolean)),
    [item, config, ctx],
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
      update({
        flames: flames.map((f) => (f.line === line ? { line, tier } : f)),
      });
      return;
    }
    if (flames.length < MAX_FLAME_LINES)
      update({ flames: [...flames, { line, tier }] });
  };

  // Switching curves moves the tiers the attack line can reach, so an existing
  // roll is brought into the new range rather than left pointing at a tier that
  // no longer exists - which would show as a selected cell with no value in it.
  const setAdvantaged = (advantaged) => {
    const next = { ...(config || {}), advantaged };
    const nextCtx = flameContext(item, next);
    update({
      advantaged,
      flames: flames.map((f) => {
        const [min, max] = flameTierRange(f.line, nextCtx);
        return { line: f.line, tier: Math.min(Math.max(f.tier, min), max) };
      }),
    });
  };

  return (
    <Panel
      title="Bonus Stats"
      aside={
        <span className="flex items-center gap-2 text-[11px] text-primary-bright/40">
          <span className="tabular-nums">
            {flames.length} / {MAX_FLAME_LINES} lines
          </span>
          {flames.length > 0 && (
            <button
              type="button"
              onClick={() => update({ flames: [] })}
              className="text-primary-bright/50 hover:text-progress-red"
            >
              clear
            </button>
          )}
        </span>
      }
    >
      {weapon && (
        <AdvantageToggle item={item} ctx={ctx} onChange={setAdvantaged} />
      )}

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
              return (
                <tr key={line}>
                  <th
                    scope="row"
                    className={`pr-2 text-right font-normal whitespace-nowrap ${
                      selected ? "text-secondary" : "text-primary-bright/60"
                    }`}
                  >
                    {label}
                  </th>
                  {cells.map((cell, idx) => {
                    const tier = FLAME_TIERS[idx];
                    const active = selected === tier;
                    // A line you have not taken yet is unreachable once all four
                    // are used, but the tiers of the ones you have stay live.
                    const locked = !cell || (full && !selected);

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
                              ? "border-secondary bg-secondary/20 text-secondary font-semibold"
                              : locked
                                ? "border-transparent text-primary-bright/15 cursor-default"
                                : "border-primary-dim/60 text-primary-bright/70 hover:border-secondary/60 hover:text-primary-bright"
                          }`}
                        >
                          {cell
                            ? `${cell.value}${cell.percent ? "%" : ""}`
                            : "–"}
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
    </Panel>
  );
}

/**
 * Which of the two weapon attack tables this weapon rolls on.
 *
 * Read off the item's boss-drop flag, which is the game's own record of flame
 * advantage. Shown rather than hidden because it changes what the attack row is
 * worth and which tiers it reaches, and it stays clickable so a wrong row in the
 * dump costs a click instead of the whole weapon.
 */
function AdvantageToggle({ item, ctx, onChange }) {
  const fromData = isFlameAdvantaged(item);
  const overridden = ctx.advantaged !== fromData;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-primary-bright/40">
        Attack flame table
      </span>
      <span className="flex gap-1">
        {[
          ["Advantaged", true],
          ["Ordinary", false],
        ].map(([label, value]) => (
          <button
            key={label}
            type="button"
            aria-pressed={ctx.advantaged === value}
            onClick={() => onChange(value)}
            className={`px-1.5 py-0.5 text-[11px] rounded border transition-colors ${
              ctx.advantaged === value
                ? "border-secondary bg-secondary/20 text-secondary font-semibold"
                : "border-primary-dim text-primary-bright/60 hover:text-primary-bright hover:border-secondary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </span>
      <span
        className={`text-[10px] ${overridden ? "text-progress-orange/70" : "text-primary-bright/30"}`}
      >
        {overridden
          ? `overridden - the game files call this ${fromData ? "a boss drop" : "ordinary gear"}`
          : "from the game files"}
      </span>
    </div>
  );
}

/**
 * The item's three potential lines.
 *
 * Every grade is offered in one list rather than behind a grade filter, because
 * a real potential mixes them - a Unique item rolls one unique line and two epic
 * ones, which a filtered list could not represent.
 *
 * The lines themselves are resolved to the values *this* item would get and
 * deduplicated; see potentialText.js for why both were needed.
 */
function PotentialColumn({ lines, onLines, preset, item, data, levelIndex }) {
  // A preset is only *shown* as fixed while the user has entered nothing. The
  // first override seeds the selects from it rather than starting blank.
  const showingPreset = Boolean(preset?.length) && lines.length === 0;

  const byGrade = useMemo(() => {
    const usable = data.potentials.filter(
      (p) =>
        p.kind === "regular" && potentialAllowedOn(p, potentialIslot(item)),
    );

    return POT_GRADES.map((grade) => ({
      ...grade,
      options: potentialOptions(
        usable.filter((p) => p.grade === grade.value),
        levelIndex,
      ),
    })).filter((g) => g.options.length > 0);
  }, [data.potentials, item, levelIndex]);

  // Indices are positions, so clearing the middle line must leave a hole rather
  // than pull the third line up into the select the user just emptied.
  const setLine = (idx, optionId) => {
    const next = Array.from(
      { length: POTENTIAL_LINES },
      (_, i) => lines[i] ?? null,
    );
    next[idx] = optionId ? { optionId } : null;
    while (next.length && !next[next.length - 1]) next.pop();
    onLines(next);
  };

  const chosen = lines.filter(Boolean).length;

  if (showingPreset) {
    return (
      <Panel
        title="Potential"
        aside={
          <button
            type="button"
            onClick={() =>
              onLines(preset.map(({ optionId }) => ({ optionId })))
            }
            className="text-[11px] text-primary-bright/50 hover:text-secondary"
          >
            Override
          </button>
        }
      >
        <ul className="space-y-1">
          {preset.map(({ optionId }, idx) => (
            <li
              key={`${optionId}-${idx}`}
              className="px-2 py-1 text-xs rounded border border-primary-dim/50 bg-background-bright/40 text-primary-bright/70 truncate"
            >
              {potentialLabel(data.lineIndex, optionId, levelIndex)}
            </li>
          ))}
        </ul>

        <p className="mt-2 text-[10px] text-primary-bright/40">
          Fixed by the item - already counted in the difference.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Potential"
      aside={
        chosen > 0 ? (
          <button
            type="button"
            onClick={() => onLines([])}
            className="text-[11px] text-primary-bright/50 hover:text-progress-red"
          >
            clear
          </button>
        ) : null
      }
    >
      <div className="space-y-1">
        {Array.from({ length: POTENTIAL_LINES }, (_, idx) => (
          <select
            key={idx}
            value={lines[idx]?.optionId ?? ""}
            onChange={(e) =>
              setLine(idx, e.target.value ? Number(e.target.value) : null)
            }
            aria-label={`Potential line ${idx + 1}`}
            className={`w-full px-1.5 py-1 text-xs rounded border bg-background-bright focus:outline-none focus:border-secondary ${
              lines[idx]?.optionId
                ? "border-primary-dim text-primary-bright"
                : "border-primary-dim/60 text-primary-bright/40"
            }`}
          >
            <option value="">- line {idx + 1} -</option>
            {byGrade.map((grade) => (
              <optgroup key={grade.value} label={grade.label}>
                {grade.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-primary-bright/40">
        Values are what this item would get at level {item.reqLevel}.
      </p>
    </Panel>
  );
}
