"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Clock,
  Palette,
} from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import MultiSelectFilter from "./MultiSelectFilter";
import { highlightDescription, HIGHLIGHT_LEGEND } from "./highlightDescription";

const RARITY_ORDER = ["Common", "Rare", "Epic", "Unique", "Legendary", "Item"];
const SYSTEM_ORDER = ["Familiar", "Mystic Frontier", "Mystic Frontier Item"];

const ITEMS_PER_PAGE = 50;
const HIGHLIGHT_STORAGE_KEY = "masonym-familiar-lines-highlight";

const getCategoryLabel = (line) => {
  if (line.system === "Mystic Frontier Item") return "Mystic Frontier Item";
  return `${line.rarity} ${line.system}`;
};

const categorySortKey = (line) => {
  const systemIndex = SYSTEM_ORDER.indexOf(line.system);
  const rarityIndex = RARITY_ORDER.indexOf(line.rarity);
  return (
    (systemIndex < 0 ? 99 : systemIndex) * 100 +
    (rarityIndex < 0 ? 99 : rarityIndex)
  );
};

const formatEndTime = (endTime) => {
  if (!endTime || endTime.length !== 12) return null;
  const year = endTime.slice(0, 4);
  const month = endTime.slice(4, 6);
  const day = endTime.slice(6, 8);
  const hour = endTime.slice(8, 10);
  const minute = endTime.slice(10, 12);
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

// Event lines are flagged either by an expiry timestamp or an [EVENT] tag in the text.
const isEventLine = (line) =>
  Boolean(line.endTime) || (line.description || "").includes("[EVENT]");

const PLACEHOLDER_ALIASES = {
  mulx: "mul",
};

const formatValue = (value) => {
  if (typeof value !== "number") return value;
  if (Number.isInteger(value)) return value.toString();
  return value.toString();
};

const formatDescription = (description, stats) => {
  if (!description || description === "???") return "???";
  const hasStats = stats && Object.keys(stats).length > 0;
  if (!hasStats) return description;

  return description.replace(/#([A-Za-z0-9_]+)/g, (match, key) => {
    const statKey = stats[key] !== undefined ? key : PLACEHOLDER_ALIASES[key];
    if (statKey !== undefined && stats[statKey] !== undefined) {
      const suffix = key === "mulx" ? "x" : "";
      return `${formatValue(stats[statKey])}${suffix}`;
    }
    return match;
  });
};

const ActiveFilters = ({ filters, onClear, onClearAll, options }) => {
  const activeFilters = [];

  if (filters.search) {
    activeFilters.push({ key: "search", label: `Search: "${filters.search}"` });
  }

  filters.systems.forEach((val) => {
    activeFilters.push({
      key: `system:${val}`,
      group: "system",
      value: val,
      label: `System: ${val}`,
    });
  });

  if (filters.eventOnly) {
    activeFilters.push({ key: "eventOnly", label: "Event lines only" });
  }

  filters.rarities.forEach((val) => {
    activeFilters.push({
      key: `rarity:${val}`,
      group: "rarity",
      value: val,
      label: `Rarity: ${val}`,
    });
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      <span className="text-xs text-[var(--primary-dim)]">Active filters:</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onClear(filter)}
          className="
            inline-flex items-center gap-1 px-2 py-1 rounded-full
            bg-[var(--secondary)]/20 text-[var(--secondary)]
            text-xs hover:bg-[var(--secondary)]/30 transition-colors
          "
        >
          {filter.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-[var(--primary-dim)] hover:text-[var(--primary)] underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

const FamiliarLinesClient = () => {
  const [lines, setLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState({});
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [eventOnly, setEventOnly] = useState(false);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const loadLines = async () => {
      try {
        const response = await fetch("/familiar_data/familiar_options.json");
        if (!response.ok) throw new Error("Failed to load familiar line data");
        const data = await response.json();
        setLines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLines();
  }, []);

  // Highlighting is on by default; remember the user's choice across visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
      if (saved !== null) setHighlightEnabled(saved === "true");
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  const toggleHighlight = () => {
    setHighlightEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HIGHLIGHT_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const systemOptions = useMemo(() => {
    const values = [...new Set(lines.map((l) => l.system))].sort();
    return values.map((v) => ({ value: v, label: v }));
  }, [lines]);

  const rarityOptions = useMemo(() => {
    const values = [...new Set(lines.map((l) => l.rarity))].sort(
      (a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b),
    );
    return values.map((v) => ({ value: v, label: v }));
  }, [lines]);

  const filteredAndSorted = useMemo(() => {
    let result = [...lines];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((l) =>
        (l.description || "").toLowerCase().includes(search),
      );
    }

    if (selectedSystems.length > 0) {
      result = result.filter((l) => selectedSystems.includes(l.system));
    }

    if (selectedRarities.length > 0) {
      result = result.filter((l) => selectedRarities.includes(l.rarity));
    }

    if (eventOnly) {
      result = result.filter(isEventLine);
    }

    result.sort((a, b) => {
      const ka = categorySortKey(a);
      const kb = categorySortKey(b);
      let cmp = ka - kb;
      if (cmp === 0) cmp = a.numericId - b.numericId;
      return cmp;
    });

    return result;
  }, [lines, searchTerm, selectedSystems, selectedRarities, eventOnly]);

  const groupedRows = useMemo(() => {
    const groups = new Map();
    filteredAndSorted.forEach((line) => {
      const label = getCategoryLabel(line);
      if (!groups.has(label)) {
        groups.set(label, { lines: [], sortKey: categorySortKey(line) });
      }
      groups.get(label).lines.push(line);
    });

    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      return a[1].sortKey - b[1].sortKey;
    });

    const rows = [];
    sortedGroups.forEach(([label, group]) => {
      rows.push({
        type: "header",
        label,
        count: group.lines.length,
        sortKey: group.sortKey,
      });
      group.lines.forEach((line) => {
        rows.push({ type: "line", key: line.id, line });
      });
    });
    return rows;
  }, [filteredAndSorted]);

  const displayedRows = useMemo(() => {
    return groupedRows.slice(0, displayCount);
  }, [groupedRows, displayCount]);

  const hasMore = displayCount < groupedRows.length;

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedSystems, selectedRarities, eventOnly]);

  useEffect(() => {
    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, groupedRows.length),
          );
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, groupedRows.length]);

  const handleClearFilter = (filter) => {
    if (filter.key === "search") {
      setSearchTerm("");
    } else if (filter.key === "eventOnly") {
      setEventOnly(false);
    } else if (filter.group === "system") {
      setSelectedSystems((prev) => prev.filter((v) => v !== filter.value));
    } else if (filter.group === "rarity") {
      setSelectedRarities((prev) => prev.filter((v) => v !== filter.value));
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedSystems([]);
    setSelectedRarities([]);
    setEventOnly(false);
  };

  const rarityStyle = (rarity) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Rare":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Epic":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Unique":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Legendary":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Legacy":
        return "bg-stone-500/20 text-stone-300 border-stone-500/30";
      case "Item":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const renderLine = (line) => {
    const levels = line.levels || {};
    const levelKeys = Object.keys(levels).sort((a, b) => Number(a) - Number(b));
    const levelOptions = levelKeys.map((k) => ({
      value: Number(k),
      label: `Level ${k}`,
    }));
    const currentLevel =
      selectedLevels[line.id] ?? (levelOptions[0] ? levelOptions[0].value : 1);
    const stats = levels[currentLevel] || {};
    const hasStats = Object.keys(stats).length > 0;
    const endTimeFormatted = formatEndTime(line.endTime);
    const description = formatDescription(line.description, stats);

    return (
      <div
        key={line.id}
        className="
          bg-[var(--background-dim)] rounded-lg p-3 border border-[var(--primary-dim)]/20
          hover:border-[var(--secondary)]/30 transition-colors
        "
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <p className="text-[var(--primary-bright)] text-base leading-snug min-w-0 flex-1">
            {highlightEnabled ? highlightDescription(description) : description}
          </p>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {endTimeFormatted && (
              <div
                className="
                  inline-flex items-center gap-1.5 px-2 py-0.5 rounded
                  bg-amber-500/10 text-amber-400 border border-amber-500/30
                  text-[10px] font-medium uppercase tracking-wider whitespace-nowrap
                "
                title={`Ends ${endTimeFormatted}`}
              >
                <Clock className="w-3 h-3" />
                <span>EVENT</span>
                <span className="normal-case text-amber-200">
                  · Ends {endTimeFormatted}
                </span>
              </div>
            )}
            <span
              className={`
                px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border
                ${rarityStyle(line.rarity)}
              `}
            >
              {line.rarity}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--background-bright)] text-[var(--primary-dim)] border border-[var(--primary-dim)]/20">
              {line.system}
            </span>
          </div>
        </div>

        {levelOptions.length > 1 && (
          <div className="mt-2 flex items-center gap-2">
            <FilterDropdown
              label="Level"
              value={currentLevel}
              options={levelOptions}
              onChange={(val) =>
                setSelectedLevels((prev) => ({ ...prev, [line.id]: val }))
              }
              valueKey="value"
              labelKey="label"
            />
            {!hasStats && (
              <span className="text-xs text-[var(--primary-dim)]">
                No level data
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[var(--primary-bright)] tracking-tight mb-4">
            Familiar Lines
          </h1>
          <div className="flex items-center justify-center gap-3 text-[var(--primary)]">
            <div className="w-5 h-5 border-2 border-[var(--secondary)] border-t-transparent rounded-full animate-spin" />
            Loading familiar lines...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[var(--primary-bright)] tracking-tight mb-4">
            Familiar Lines
          </h1>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const allCount = lines.length;
  const filteredCount = filteredAndSorted.length;
  const showingCount = displayedRows.filter((r) => r.type === "line").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-[var(--primary-bright)] tracking-tight">
          Familiar Lines Directory
        </h1>
        <p className="text-lg text-[var(--primary)] mt-2 max-w-2xl mx-auto">
          Browse familiar potentials and Mystic Frontier lines by rarity and
          system.
        </p>
      </div>

      <div className="bg-[var(--background-dim)] rounded-xl p-4 mb-6 border border-[var(--primary-dim)]/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary-dim)]" />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2 rounded-lg
                bg-[var(--background-bright)] border border-[var(--primary-dim)]/30
                text-[var(--primary-bright)] placeholder-[var(--primary-dim)]
                focus:outline-none focus:border-[var(--secondary)]/50
                transition-colors
              "
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              lg:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              border transition-all
              ${
                showFilters
                  ? "bg-[var(--secondary)]/20 border-[var(--secondary)]/50 text-[var(--secondary)]"
                  : "bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)]"
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div
            className={`
            flex flex-wrap gap-3
            ${showFilters ? "flex" : "hidden lg:flex"}
          `}
          >
            <MultiSelectFilter
              label="System"
              allLabel="All Systems"
              values={selectedSystems}
              options={systemOptions}
              onChange={setSelectedSystems}
              valueKey="value"
              labelKey="label"
            />

            <MultiSelectFilter
              label="Rarity"
              allLabel="All Rarities"
              values={selectedRarities}
              options={rarityOptions}
              onChange={setSelectedRarities}
              valueKey="value"
              labelKey="label"
            />

            <button
              onClick={() => setEventOnly((prev) => !prev)}
              aria-pressed={eventOnly}
              title="Show only limited-time event lines"
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                border text-sm transition-all
                ${
                  eventOnly
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)] hover:text-[var(--primary-bright)]"
                }
              `}
            >
              <Clock className="w-4 h-4" />
              Event lines
            </button>

            <button
              onClick={toggleHighlight}
              aria-pressed={highlightEnabled}
              title="Color-code elements, types, buffs and penalties in line text"
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                border text-sm transition-all
                ${
                  highlightEnabled
                    ? "bg-[var(--secondary)]/20 border-[var(--secondary)]/50 text-[var(--secondary)]"
                    : "bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)] hover:text-[var(--primary-bright)]"
                }
              `}
            >
              <Palette className="w-4 h-4" />
              Highlight
            </button>
          </div>
        </div>

        <ActiveFilters
          filters={{
            search: searchTerm,
            systems: selectedSystems,
            rarities: selectedRarities,
            eventOnly,
          }}
          onClear={handleClearFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-[var(--primary)]">
        <span>
          Showing {showingCount.toLocaleString()} of{" "}
          {filteredCount.toLocaleString()} lines
        </span>
        {filteredCount !== allCount && (
          <span className="text-[var(--primary-dim)]">
            ({allCount.toLocaleString()} total)
          </span>
        )}
      </div>

      {displayedRows.length > 0 ? (
        <>
          <div className="space-y-3">
            {displayedRows.map((row) =>
              row.type === "header" ? (
                <div
                  key={`header-${row.label}`}
                  className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur rounded-lg border border-[var(--primary-dim)]/20 p-3 mt-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--secondary)]">
                      {row.label}
                    </h2>
                    <span className="text-xs text-[var(--primary-dim)]">
                      {row.count} lines
                    </span>
                  </div>
                </div>
              ) : (
                renderLine(row.line)
              ),
            )}
          </div>

          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8 text-[var(--primary)]"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[var(--secondary)] border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 text-[var(--primary-dim)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--primary)] text-lg">
            No lines match your filters
          </p>
          <button
            onClick={handleClearAllFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--primary-dark)] text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      <footer className="text-center mt-12 text-[var(--primary-dim)] text-sm">
        <p>
          Familiar line data is extracted from game files. Placeholder values
          are filled from per-level stats when available.
        </p>
      </footer>
    </div>
  );
};

export default FamiliarLinesClient;
