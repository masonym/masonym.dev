"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useEquipData } from "./useEquipData";
import EquipWindow from "./EquipWindow";
import SlotEditor from "./SlotEditor";
import DiffPanel from "./DiffPanel";
import ItemTooltip from "./ItemTooltip";
import ItemPickerModal from "./ItemPickerModal";
import {
  diffItemSwap,
  diffLoadouts,
  exceptionalSlots,
  occupiedSlots,
} from "@/lib/equip/engine";
import {
  flameContext,
  flameLineValue,
  flameLinesFor,
  isFlameAdvantaged,
  migrateFlameLines,
} from "@/lib/equip/flames";
import { LAYOUT_BY_SLOT_KEY } from "@/lib/equip/uiLayout";
import { CLASSES, DEFAULT_CLASS } from "@/lib/equip/classes";
import { DEFAULT_FILTERS } from "@/lib/equip/itemFilter";
import { starCap, starFloor } from "@/lib/equip/starforce";
import { configForItem } from "@/lib/equip/specialItems";

const STORAGE_KEY = "equipCompareState";

/**
 * Bumped when a stored *preference* stops meaning what it used to.
 *
 * v2 turned the picker filters off by default, so a v1 state would silently
 * restore the narrowing that was removed for hiding real gear. Loadouts are
 * restored regardless of version - they are the user's data, not a preference.
 */
const STATE_VERSION = 2;

/**
 * Brings a restored loadout back inside what the current dataset allows.
 *
 * A saved config outlives the data it was entered against, and every rule it was
 * entered under has since changed: star ranges are per item now, so a saved 30★
 * can name a weapon fixed at 22; `flameType` is gone, so a stale advantaged flag
 * would keep quietly changing attack flames with nothing on screen to explain it;
 * flame lines are checked against what the item can actually roll; and
 * `exceptional` went from a stat bag to a hammer count.
 */
function reconcileLoadout(loadout, itemIndex) {
  const out = {};

  for (const [slotKey, config] of Object.entries(loadout || {})) {
    const item = config?.itemId ? itemIndex.get(config.itemId) : null;
    if (!item) continue;

    const next = { ...config };
    delete next.flameType;

    next.stars = Math.min(
      Math.max(next.stars ?? 0, starFloor(item)),
      starCap(item),
    );

    // An override is only worth keeping when it disagrees with the item's own
    // flag; otherwise it would pin a value the data may have since corrected.
    if (next.advantaged === isFlameAdvantaged(item)) delete next.advantaged;

    if (next.flames?.length) {
      const rollable = new Set(flameLinesFor(item, next));
      const ctx = flameContext(item, next);
      next.flames = migrateFlameLines(next.flames).filter(
        (f) => rollable.has(f.line) && flameLineValue(f.line, f.tier, ctx),
      );
    }

    const hammers = Number(next.exceptional);
    next.exceptional = Number.isFinite(hammers)
      ? Math.min(Math.max(hammers, 0), exceptionalSlots(item))
      : 0;

    out[slotKey] = next;
  }

  return out;
}

/**
 * Two equipment windows side by side, plus the stat difference between them.
 *
 * It is a loadout comparison rather than an item comparison on purpose: set
 * effects are counted across the whole equipped set, so swapping one piece
 * changes the bonuses granted by the pieces you keep.
 */
export default function EquipCompare() {
  const { status, data, error } = useEquipData();

  const [loadouts, setLoadouts] = useState({ a: {}, b: {} });
  const [selected, setSelected] = useState(null); // { side, slotKey }
  const [picking, setPicking] = useState(null); // { side, slotKey }
  const [classKey, setClassKey] = useState(DEFAULT_CLASS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [hover, setHover] = useState(null);
  const [flash, setFlash] = useState(null); // { side, slotKey, id }
  const [hydrated, setHydrated] = useState(false);
  const [reconciled, setReconciled] = useState(false);

  // Only the user's configuration is persisted, never the dataset, so a data
  // rebuild can't leave stale stats behind.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.a && parsed?.b) setLoadouts({ a: parsed.a, b: parsed.b });
        if (parsed?.classKey) setClassKey(parsed.classKey);
        // Spread over the defaults so a filter added later still gets a value.
        if (parsed?.filters && parsed.v === STATE_VERSION) {
          setFilters({ ...DEFAULT_FILTERS, ...parsed.filters });
        }
      }
    } catch {
      // Ignore malformed saved state.
    }
    setHydrated(true);
  }, []);

  // Restoring happens before the dataset arrives, so the saved loadouts can only
  // be checked against it once, here.
  useEffect(() => {
    if (!hydrated || reconciled || status !== "ready") return;
    setLoadouts((prev) => ({
      a: reconcileLoadout(prev.a, data.itemIndex),
      b: reconcileLoadout(prev.b, data.itemIndex),
    }));
    setReconciled(true);
  }, [hydrated, reconciled, status, data]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: STATE_VERSION, ...loadouts, classKey, filters }),
      );
    } catch {
      // Storage may be unavailable (private mode, quota).
    }
  }, [loadouts, classKey, filters, hydrated]);

  const setSlot = (side, slotKey, config) => {
    setLoadouts((prev) => {
      const next = { ...prev[side] };

      if (!config?.itemId) delete next[slotKey];
      else next[slotKey] = config;

      // A two-hander clears the secondary, an overall clears the bottom.
      // Without this the displaced item would keep contributing stats.
      if (config?.itemId && data) {
        const item = data.itemIndex.get(config.itemId);
        for (const s of occupiedSlots(item, slotKey)) {
          if (s !== slotKey) delete next[s];
        }

        // And the same in reverse: filling a slot evicts whatever was covering
        // it. Only right-clicking a slot across can reach this - the windows do
        // not let a covered slot be clicked - but a shield left sitting under a
        // two-hander would still have counted towards the totals.
        for (const [key, other] of Object.entries(next)) {
          if (key === slotKey || !other?.itemId) continue;
          const covering = data.itemIndex.get(other.itemId);
          if (occupiedSlots(covering, key).includes(slotKey)) delete next[key];
        }
      }

      return { ...prev, [side]: next };
    });
  };

  // An empty slot has nothing to inspect, so a single click goes straight to
  // the picker. A filled slot's single click instead selects it, readying the
  // editor below for that piece's stars, flames and potential - the common
  // case is tweaking what's already equipped, not swapping it. Clicking an
  // already-selected slot, or double-clicking any slot, opens the picker.
  const selectSlot = (side, slotKey) => {
    if (!loadouts[side]?.[slotKey]?.itemId) {
      openSlot(side, slotKey);
      return;
    }
    setSelected((prev) => {
      if (prev?.side === side && prev?.slotKey === slotKey) {
        setPicking({ side, slotKey });
      }
      return { side, slotKey };
    });
  };

  const openSlot = (side, slotKey) => {
    setSelected({ side, slotKey });
    setPicking({ side, slotKey });
  };

  // Right-click: send one slot to the other window, configuration and all.
  //
  // The destination is flashed because the change is easy to miss - copying an
  // identical-looking item, or filling a slot the eye is not on, otherwise looks
  // like the right-click did nothing at all. A flash on the slot that received it
  // says where it went without a toast or a confirmation to dismiss.
  const copySlot = (side, slotKey) => {
    const other = side === "a" ? "b" : "a";
    const config = loadouts[side]?.[slotKey];
    setSlot(other, slotKey, config ? structuredClone(config) : null);
    setFlash({ side: other, slotKey, id: Date.now() });
  };

  // The flash is a one-shot CSS animation; clearing it keeps a stale marker from
  // replaying when the window re-renders for an unrelated reason.
  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(timer);
  }, [flash]);

  const result = useMemo(() => {
    if (status !== "ready") return null;
    return diffLoadouts(loadouts.a, loadouts.b, data);
  }, [status, data, loadouts]);

  /**
   * The difference from changing *only* the selected slot.
   *
   * Expressed as a swap into the current loadout rather than as one item minus
   * the other, so the set effects the swap makes or breaks are counted - which
   * is the whole reason the tool compares loadouts in the first place.
   */
  const slotResult = useMemo(() => {
    if (status !== "ready" || !selected) return null;
    const { slotKey } = selected;
    if (!loadouts.a[slotKey] && !loadouts.b[slotKey]) return null;
    return diffItemSwap(loadouts.a, slotKey, loadouts.b[slotKey] ?? null, data);
  }, [status, data, loadouts, selected]);

  // Slots that differ between the two sides, so the windows can highlight them.
  const changedSlots = useMemo(() => {
    const keys = new Set([
      ...Object.keys(loadouts.a),
      ...Object.keys(loadouts.b),
    ]);
    const changed = new Set();
    for (const k of keys) {
      if (
        JSON.stringify(loadouts.a[k] ?? null) !==
        JSON.stringify(loadouts.b[k] ?? null)
      ) {
        changed.add(k);
      }
    }
    return changed;
  }, [loadouts]);

  if (status === "loading") {
    return (
      <p className="text-center text-primary-bright/50 py-12">
        Loading equipment data…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-lg mx-auto p-4 rounded-lg border border-progress-red/40 bg-progress-red/10">
        <p className="text-sm text-primary-bright">
          Could not load the equipment dataset.
        </p>
        <p className="mt-1 text-xs text-primary-bright/50">
          {String(error?.message ?? error)}
        </p>
      </div>
    );
  }

  const selectedItem = selected
    ? data.itemIndex.get(loadouts[selected.side]?.[selected.slotKey]?.itemId)
    : null;

  return (
    <div className="max-w-[92rem] mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <label
            htmlFor="equip-class"
            className="text-xs text-primary-bright/50"
          >
            Class
          </label>
          <select
            id="equip-class"
            value={classKey}
            onChange={(e) => setClassKey(e.target.value)}
            className="px-2 py-1.5 text-sm rounded-lg border border-primary-dim bg-primary-dark text-primary-bright focus:outline-none focus:border-secondary"
          >
            {CLASSES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <ActionButton
          onClick={() =>
            setLoadouts((p) => ({ ...p, b: structuredClone(p.a) }))
          }
        >
          Copy Current → Planned
        </ActionButton>
        <ActionButton onClick={() => setLoadouts((p) => ({ a: p.b, b: p.a }))}>
          Swap sides
        </ActionButton>
        <ActionButton
          danger
          onClick={() => {
            setLoadouts({ a: {}, b: {} });
            setSelected(null);
            setPicking(null);
          }}
        >
          Reset both
        </ActionButton>
      </div>

      <p className="text-center text-xs text-primary-bright/40 max-w-2xl mx-auto">
        Pick your class to narrow the item lists, then click a slot to equip
        something and set its stars, flames and potential. Every item is listed,
        strongest first. Fill in what you have now, copy it across, then change
        the pieces you are considering - or right-click a single slot to send
        just that piece to the other window.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
          <EquipWindow
            title="CURRENT"
            loadout={loadouts.a}
            itemIndex={data.itemIndex}
            selectedSlot={selected?.side === "a" ? selected.slotKey : null}
            onSelectSlot={(slotKey) => selectSlot("a", slotKey)}
            onOpenSlot={(slotKey) => openSlot("a", slotKey)}
            onCopySlot={(slotKey) => copySlot("a", slotKey)}
            // The side rides along so the tooltip's set panel can count pieces
            // against the loadout the hovered slot is actually in.
            onHoverSlot={(next) => setHover(next && { ...next, side: "a" })}
            changedSlots={changedSlots}
            copyHint="copy it to Planned"
            flashSlot={flash?.side === "a" ? flash : null}
          />
          <EquipWindow
            title="PLANNED"
            loadout={loadouts.b}
            itemIndex={data.itemIndex}
            selectedSlot={selected?.side === "b" ? selected.slotKey : null}
            onSelectSlot={(slotKey) => selectSlot("b", slotKey)}
            onOpenSlot={(slotKey) => openSlot("b", slotKey)}
            onCopySlot={(slotKey) => copySlot("b", slotKey)}
            onHoverSlot={(next) => setHover(next && { ...next, side: "b" })}
            changedSlots={changedSlots}
            copyHint="copy it to Current"
            flashSlot={flash?.side === "b" ? flash : null}
          />
        </div>

        <div className="w-full lg:w-[22rem] p-4 rounded-2xl border border-primary-dim bg-primary-dark">
          <DiffPanel
            result={result}
            slotResult={slotResult}
            slotName={
              selected
                ? (LAYOUT_BY_SLOT_KEY[selected.slotKey]?.name ??
                  selected.slotKey)
                : null
            }
          />
        </div>
      </div>

      {selected && (
        <div className="p-4 rounded-2xl border border-primary-dim bg-background-bright/40">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-primary-bright">
              <span className="text-secondary">
                {selected.side === "a" ? "Current" : "Planned"}
              </span>
              {" · "}
              {LAYOUT_BY_SLOT_KEY[selected.slotKey]?.name ?? selected.slotKey}
            </h2>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-primary-bright/50 hover:text-primary-bright"
            >
              Close
            </button>
          </div>

          <SlotEditor
            slotName={
              LAYOUT_BY_SLOT_KEY[selected.slotKey]?.name ?? selected.slotKey
            }
            config={loadouts[selected.side]?.[selected.slotKey] ?? null}
            item={selectedItem}
            data={data}
            classKey={classKey}
            onChange={(next) => setSlot(selected.side, selected.slotKey, next)}
            onOpenPicker={() => setPicking(selected)}
          />
        </div>
      )}

      {picking && (
        <ItemPickerModal
          slotKey={picking.slotKey}
          slotName={
            LAYOUT_BY_SLOT_KEY[picking.slotKey]?.name ?? picking.slotKey
          }
          items={data.items}
          setIndex={data.setIndex}
          currentId={loadouts[picking.side]?.[picking.slotKey]?.itemId ?? null}
          classKey={classKey}
          onClassChange={setClassKey}
          filters={filters}
          onFiltersChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
          onPick={(itemId) => {
            const prev = loadouts[picking.side]?.[picking.slotKey];
            const item = data.itemIndex.get(itemId);
            setSlot(
              picking.side,
              picking.slotKey,
              configForItem(item, classKey, prev),
            );
            setSelected(picking);
            setPicking(null);
          }}
          onClear={() => {
            setSlot(picking.side, picking.slotKey, null);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}

      <ItemTooltip
        hover={hover}
        lineIndex={data.lineIndex}
        setIndex={data.setIndex}
        itemIndex={data.itemIndex}
        loadout={hover ? loadouts[hover.side] : null}
      />
    </div>
  );
}

function ActionButton({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg border border-primary-dim bg-primary-dark transition-colors ${
        danger
          ? "text-primary-bright/60 hover:text-progress-red hover:border-progress-red/40"
          : "text-primary-bright/80 hover:text-primary-bright hover:border-secondary/50"
      }`}
    >
      {children}
    </button>
  );
}
