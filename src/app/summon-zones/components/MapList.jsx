"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { STATUS } from "./colors";

const ORDER = ["hides", "unknown", "safe"];

// median of a list of numbers, for ordering areas by their typical level: an area's minimum can
// be one odd low map (Tenebris starts at 200 but is a 250s area)
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

/**
 * Map browser: search (name, street, region, monster, id), category tabs and status chips.
 * A search looks across every status, since someone typing a map name wants that map whatever
 * its verdict; the chips only narrow browsing. Areas and maps are listed in level order.
 */
export default function MapList({ data, selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [shown, setShown] = useState(() => new Set(["hides", "unknown"]));
  const selectedRef = useRef(null);
  const scrollRef = useRef(null);

  const counts = useMemo(() => {
    const c = { hides: 0, unknown: 0, safe: 0 };
    for (const m of data.maps) if (!category || m.category === category) c[m.status]++;
    return c;
  }, [data, category]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data.maps.filter(
      (m) =>
        (!category || m.category === category) &&
        // the selected map stays listed even when its status is filtered out
        (q ? m._haystack.includes(q) : shown.has(m.status) || m.id === selectedId),
    );
    // region -> street -> maps; regions in category order, then everything by level
    const catOrder = new Map(data.categories.map((c, i) => [c, i]));
    const lv = (m) => m.minLv ?? 0;
    const regions = new Map();
    for (const m of list) {
      if (!regions.has(m.region)) regions.set(m.region, new Map());
      const streets = regions.get(m.region);
      if (!streets.has(m.street)) streets.set(m.street, []);
      streets.get(m.street).push(m);
    }
    const byRegion = [...regions]
      .map(([r, streets]) => {
        const sorted = [...streets]
          .map(([st, maps]) => [st, maps.sort((a, b) => lv(a) - lv(b) || a.id - b.id)])
          .sort((a, b) => median(a[1].map(lv)) - median(b[1].map(lv)));
        const all = sorted.flatMap(([, maps]) => maps);
        return { region: r, category: all[0].category, streets: sorted, level: median(all.map(lv)) };
      })
      .sort((a, b) => catOrder.get(a.category) - catOrder.get(b.category) || a.level - b.level);
    return { total: list.length, byRegion };
  }, [data, query, category, shown, selectedId]);

  // keep the selected map in view when the page opens on a linked map. Scrolls only the list:
  // scrollIntoView would scroll the window too and push the page header out of view.
  useEffect(() => {
    const list = scrollRef.current;
    const row = selectedRef.current;
    if (!list || !row) return;
    list.scrollTop = row.offsetTop - list.clientHeight / 3; // the list is the row's offsetParent
  }, []);

  const toggle = (s) =>
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <aside className="rounded-lg border border-primary-dim/40 bg-background-bright p-3 lg:sticky lg:top-4">
      <label className="flex items-center gap-2 rounded-md border border-primary-dim/50 bg-background px-2 py-1.5">
        <Search className="w-4 h-4 text-primary-dim shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Map, area, monster or id"
          className="w-full bg-transparent text-primary-bright placeholder:text-primary-dim outline-none"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-1" role="tablist">
        {["", ...data.categories].map((c) => (
          <button
            key={c || "all"}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`rounded-md px-2.5 py-1 text-sm ${
              category === c
                ? "bg-background text-primary-bright"
                : "text-primary-dim hover:text-primary-bright"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {ORDER.filter((s) => counts[s] > 0).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            disabled={!!query.trim()}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm transition-colors disabled:opacity-50 ${
              shown.has(s)
                ? "border-secondary text-primary-bright"
                : "border-primary-dim/50 text-primary-dim"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${STATUS[s].dot}`} />
            {STATUS[s].short} <span className="text-primary-dim">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="relative mt-3 max-h-[60vh] lg:max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 -mr-1">
        {groups.total === 0 && <p className="px-1 py-4 text-sm text-primary-dim">No maps match.</p>}
        {groups.byRegion.map(({ region: r, category: c, streets }) => (
          <div key={r} className="mb-3">
            <h3 className="sticky top-0 z-10 flex items-baseline gap-2 bg-background-bright px-1 py-1 text-xs uppercase tracking-wide text-secondary">
              {r}
              {!category && <span className="normal-case tracking-normal text-primary-dim">{c}</span>}
            </h3>
            {streets.map(([street, maps]) => (
              <div key={street} className="mb-1.5">
                <div className="px-1 text-xs text-primary-dim">{street}</div>
                {maps.map((m) => {
                  const sel = m.id === selectedId;
                  return (
                    <button
                      key={m.id}
                      ref={sel ? selectedRef : null}
                      type="button"
                      onClick={() => onSelect(m.id)}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm ${
                        sel ? "bg-background text-primary-bright" : "text-primary hover:bg-background/60"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS[m.status].dot}`} title={STATUS[m.status].label} />
                      <span className="truncate">{m.name}</span>
                      {m.minLv != null && (
                        <span className="ml-auto shrink-0 text-xs text-primary-dim">Lv {m.minLv}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
