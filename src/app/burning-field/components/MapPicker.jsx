"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import {
  MAX_RESULTS,
  describeMap,
  formatLevelRange,
  loadMapCatalog,
  searchMaps,
} from "@/lib/maps/catalog";

/**
 * Modal map picker.
 *
 * Browsing is by area (street name) in the left column, searching cuts across
 * every area at once - typing narrows both, so "geardock" leaves one area
 * selected and its maps listed, while "combatron" finds the same maps by the
 * monster standing in them.
 *
 * A group's map used to be free text, which meant two groups on the same map
 * could spell it differently and 300 map names in the game are ambiguous on
 * their own ("Labyrinth of Suffering Core" names four different maps). The
 * picker hands back the map id, and that is what gets stored.
 */

export default function MapPicker({ currentMapId, onPick, onClose }) {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [street, setStreet] = useState(null);
  const [minLv, setMinLv] = useState(0);
  const [maxLv, setMaxLv] = useState(0);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadMapCatalog().then(
      (c) => {
        if (cancelled) return;
        setCatalog(c);
        // Open on the area the group is already using, so re-picking a map
        // starts where the last pick left off instead of at the top of Aqua Road.
        const current = c.maps.find((m) => m.id === currentMapId);
        if (current) setStreet(current.street);
      },
      (e) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [currentMapId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [catalog]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const withinLevels = useMemo(() => {
    if (!minLv && !maxLv) return () => true;
    return (m) =>
      (!minLv || (m.maxLv ?? 0) >= minLv) &&
      (!maxLv || (m.minLv ?? Infinity) <= maxLv);
  }, [minLv, maxLv]);

  const areas = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.areas
      .map((area) => {
        const maps = area.maps.filter(withinLevels);
        if (!maps.length) return null;
        if (q && !area._haystack.includes(q) && !maps.some((m) => m._haystack.includes(q)))
          return null;
        return { ...area, maps };
      })
      .filter(Boolean);
  }, [catalog, query, withinLevels]);

  // With a query the right column ignores the selected area: a search that only
  // ever looked inside one street would be a worse version of the street list.
  const results = useMemo(() => {
    if (!catalog) return [];
    if (query.trim()) {
      return searchMaps(catalog.maps, query).filter(withinLevels).slice(0, MAX_RESULTS);
    }
    const area = areas.find((a) => a.street === street) || areas[0];
    return area ? area.maps : [];
  }, [catalog, query, street, areas, withinLevels]);

  useEffect(() => {
    setCursor(0);
    listRef.current?.scrollTo({ top: 0 });
  }, [query, street, minLv, maxLv]);

  const onListKey = (e) => {
    // The level dropdowns need their own arrow keys.
    if (e.target instanceof HTMLSelectElement) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => {
        const next = Math.min(
          results.length - 1,
          Math.max(0, c + (e.key === "ArrowDown" ? 1 : -1)),
        );
        document
          .getElementById(`map-row-${next}`)
          ?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      onPick(results[cursor]);
    }
  };

  const activeStreet = query.trim()
    ? null
    : (areas.find((a) => a.street === street) || areas[0])?.street;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a map"
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-primary-dim bg-primary-dark shadow-2xl overflow-hidden"
        onKeyDown={onListKey}
      >
        <div className="p-3 border-b border-primary-dim space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary-bright">
              Choose the <span className="text-secondary">map</span>
              {catalog?.regions.length === 1 && (
                <span className="ml-2 font-normal text-primary-bright/40">
                  {catalog.regions[0]}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-primary-bright/50 hover:text-primary-bright"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 shrink-0 text-primary-bright/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                catalog
                  ? `Search ${catalog.maps.length} maps by name, area or monster…`
                  : "Loading maps…"
              }
              className="flex-1 px-2.5 py-2 text-sm rounded-lg bg-background-bright border border-primary-dim text-primary-bright placeholder:text-primary-bright/30 focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-primary-bright/50">
            <span className="flex items-center gap-1">
              Lv
              <LevelSelect
                value={minLv}
                onChange={setMinLv}
                steps={catalog?.levelSteps || []}
              />
              to
              <LevelSelect
                value={maxLv}
                onChange={setMaxLv}
                steps={catalog?.levelSteps || []}
              />
            </span>
            <span className="text-primary-bright/30">
              {results.length}
              {results.length === MAX_RESULTS ? "+" : ""} map
              {results.length === 1 ? "" : "s"}
              {activeStreet ? ` in ${activeStreet}` : ""}
            </span>
          </div>

          {/* The area column has nowhere to go on a phone. */}
          <select
            value={activeStreet || ""}
            onChange={(e) => {
              setQuery("");
              setStreet(e.target.value);
            }}
            className="sm:hidden w-full px-2 py-1.5 text-xs rounded-lg bg-background-bright border border-primary-dim text-primary-bright focus:outline-none"
          >
            {areas.map((a) => (
              <option key={a.street} value={a.street}>
                {a.street} ({a.maps.length})
              </option>
            ))}
          </select>
        </div>

        {error && <p className="p-4 text-sm text-progress-red">{error}</p>}

        {!catalog && !error && (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary-dim" />
          </div>
        )}

        {catalog && (
          <div className="flex-1 min-h-0 flex">
            <div className="hidden sm:block w-56 shrink-0 overflow-y-auto border-r border-primary-dim/60">
              {areas.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-primary-bright/40">
                  No areas match.
                </p>
              )}
              {areas.map((area) => (
                <button
                  key={area.street}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStreet(area.street);
                  }}
                  className={`w-full text-left px-3 py-1.5 border-b border-primary-dim/20 last:border-0 hover:bg-primary-dim/40 ${
                    area.street === activeStreet ? "bg-secondary/10" : ""
                  }`}
                >
                  <span
                    className={`block truncate text-xs ${
                      area.street === activeStreet
                        ? "text-secondary"
                        : "text-primary-bright"
                    }`}
                  >
                    {area.street}
                  </span>
                  <span className="block truncate text-[10px] text-primary-bright/40 tabular-nums">
                    {area.maps.length} map{area.maps.length === 1 ? "" : "s"}
                    {area.minLv != null &&
                      ` · Lv ${area.minLv}${area.maxLv !== area.minLv ? `-${area.maxLv}` : ""}`}
                  </span>
                </button>
              ))}
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-primary-bright/40">
                  Nothing matches. Try a shorter search or a wider level range.
                </p>
              )}
              {results.map((map, i) => (
                <MapRow
                  key={map.id}
                  id={`map-row-${i}`}
                  map={map}
                  omitStreet={Boolean(activeStreet)}
                  omitRegion={catalog.regions.length === 1}
                  selected={map.id === currentMapId}
                  active={i === cursor}
                  onPick={onPick}
                />
              ))}
              {results.length === MAX_RESULTS && (
                <p className="px-3 py-2 text-center text-[11px] text-primary-bright/30">
                  First {MAX_RESULTS} shown - keep typing to narrow it down.
                </p>
              )}
            </div>
          </div>
        )}

        <p className="px-3 py-2 border-t border-primary-dim/60 text-[11px] text-primary-bright/30">
          ↑↓ to move, Enter to choose, Esc to close.
        </p>
      </div>
    </div>
  );
}

function LevelSelect({ value, onChange, steps }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-1 py-0.5 rounded border border-primary-dim bg-background-bright text-primary-bright focus:outline-none"
    >
      <option value={0}>any</option>
      {steps.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}

function MapRow({ id, map, omitStreet, omitRegion, selected, active, onPick }) {
  const level = formatLevelRange(map);
  return (
    <button
      id={id}
      type="button"
      onClick={() => onPick(map)}
      className={`w-full text-left px-3 py-1.5 flex items-center gap-3 border-b border-primary-dim/30 last:border-0 hover:bg-primary-dim/40 ${
        selected ? "bg-secondary/10" : ""
      } ${active ? "ring-1 ring-inset ring-secondary/60" : ""}`}
    >
      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-bright/30" />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm ${selected ? "text-secondary" : "text-primary-bright"}`}
        >
          {map.name}
        </span>
        <span className="block truncate text-[11px] text-primary-bright/40">
          {describeMap(map, { omitStreet, omitRegion })}
        </span>
      </span>
      <span className="shrink-0 text-right text-[11px] text-primary-bright/40 tabular-nums">
        {level && <span className="block">{level}</span>}
        <span className="block text-primary-bright/25">{map.spawns} spawns</span>
      </span>
    </button>
  );
}
