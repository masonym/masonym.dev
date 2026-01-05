'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import FamiliarCard from './FamiliarCard';

const LEVEL_RANGES = [
  { label: 'All Levels', min: 0, max: Infinity },
  { label: '1-50', min: 1, max: 50 },
  { label: '51-100', min: 51, max: 100 },
  { label: '101-150', min: 101, max: 150 },
  { label: '151-199', min: 151, max: 199 },
  { label: '200-259', min: 200, max: 259 },
  { label: '260+', min: 260, max: Infinity },
];

const ELEMENTS = [
  { code: 'all', name: 'All Elements', image: null },
  { code: 'N', name: 'None', image: '/familiar_data/familiars/types/none.png' },
  { code: 'F', name: 'Fire', image: '/familiar_data/familiars/types/fire.png' },
  { code: 'I', name: 'Ice', image: '/familiar_data/familiars/types/ice.png' },
  { code: 'P', name: 'Poison', image: '/familiar_data/familiars/types/poison.png' },
  { code: 'D', name: 'Dark', image: '/familiar_data/familiars/types/dark.png' },
  { code: 'H', name: 'Holy', image: '/familiar_data/familiars/types/holy.png' },
  { code: 'L', name: 'Light', image: '/familiar_data/familiars/types/lightning.png' },
];

const SORT_OPTIONS = [
  { value: 'level-asc', label: 'Level (Low to High)' },
  { value: 'level-desc', label: 'Level (High to Low)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'type', label: 'Type' },
];

const ITEMS_PER_PAGE = 100;

const FilterDropdown = ({ label, value, options, onChange, valueKey = 'value', labelKey = 'label' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt[valueKey] === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[var(--background-bright)] border border-[var(--primary-dim)]/30
          text-[var(--primary)] hover:text-[var(--primary-bright)]
          hover:border-[var(--secondary)]/50
          transition-all text-sm min-w-[140px] justify-between
        "
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.image && selectedOption?.image !== null && (
            <Image src={selectedOption.image} alt="" width={16} height={16} className="w-4 h-4" />
          )}
          {selectedOption?.[labelKey] || label}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 mt-1 z-50
          bg-[var(--background-dim)] border border-[var(--primary-dim)]/50
          rounded-lg shadow-xl overflow-hidden min-w-full
          max-h-[50vh] overflow-y-auto
        ">
          {options.map((option) => (
            <button
              key={option[valueKey]}
              onClick={() => {
                onChange(option[valueKey]);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-[var(--background-bright)]
                transition-colors flex items-center gap-2
                ${option[valueKey] === value 
                  ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]' 
                  : 'text-[var(--primary)]'
                }
              `}
            >
              {option.image && option.image !== null && (
                <Image src={option.image} alt="" width={16} height={16} className="w-4 h-4" />
              )}
              {option[labelKey]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TypeFilter = ({ types, selectedType, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTypeName = selectedType === 'all' 
    ? 'All Types' 
    : types.find(t => t.id === selectedType)?.name || 'All Types';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[var(--background-bright)] border border-[var(--primary-dim)]/30
          text-[var(--primary)] hover:text-[var(--primary-bright)]
          hover:border-[var(--secondary)]/50
          transition-all text-sm min-w-[140px] justify-between
        "
      >
        <span className="flex items-center gap-2 truncate">
          {selectedType === 'all' ? (
            'All Types'
          ) : (
            <>
              <Image 
                src={`/familiar_data/familiars/elements/${types.find(t => t.id === selectedType)?.name.toLowerCase()}.png`} 
                alt="" 
                width={16} 
                height={16} 
                className="w-4 h-4" 
              />
              {types.find(t => t.id === selectedType)?.name || 'All Types'}
            </>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 mt-1 z-50
          bg-[var(--background-dim)] border border-[var(--primary-dim)]/50
          rounded-lg shadow-xl overflow-hidden min-w-full
          max-h-[50vh] overflow-y-auto
        ">
          <button
            onClick={() => {
              onChange('all');
              setIsOpen(false);
            }}
            className={`
              w-full px-3 py-2 text-left text-sm
              hover:bg-[var(--background-bright)]
              transition-colors flex items-center gap-2
              ${selectedType === 'all' 
                ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]' 
                : 'text-[var(--primary)]'
              }
            `}
          >
            All Types
          </button>
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                onChange(type.id);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-[var(--background-bright)]
                transition-colors flex items-center gap-2
                ${type.id === selectedType 
                  ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]' 
                  : 'text-[var(--primary)]'
                }
              `}
            >
              <Image 
                src={`/familiar_data/familiars/elements/${type.name.toLowerCase()}.png`} 
                alt="" 
                width={16} 
                height={16} 
                className="w-4 h-4" 
              />
              {type.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveFilters = ({ filters, onClear, onClearAll }) => {
  const activeFilters = [];

  if (filters.levelRange.min !== 0 || filters.levelRange.max !== Infinity) {
    activeFilters.push({
      key: 'level',
      label: `Level: ${filters.levelRange.label}`,
    });
  }

  if (filters.element !== 'all') {
    const elementName = ELEMENTS.find(e => e.code === filters.element)?.name || filters.element;
    activeFilters.push({
      key: 'element',
      label: `Element: ${elementName}`,
    });
  }

  if (filters.type !== 'all') {
    activeFilters.push({
      key: 'type',
      label: `Type: ${filters.typeName}`,
    });
  }

  if (filters.search) {
    activeFilters.push({
      key: 'search',
      label: `Search: "${filters.search}"`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      <span className="text-xs text-[var(--primary-dim)]">Active filters:</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onClear(filter.key)}
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

const FamiliarsClient = () => {
  const [familiars, setFamiliars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelRange, setSelectedLevelRange] = useState(LEVEL_RANGES[0]);
  const [selectedElement, setSelectedElement] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOption, setSortOption] = useState('level-asc');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const loadFamiliars = async () => {
      try {
        const response = await fetch('/familiar_data/familiars.json');
        if (!response.ok) throw new Error('Failed to load familiar data');
        const data = await response.json();
        setFamiliars(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFamiliars();
  }, []);

  const uniqueTypes = useMemo(() => {
    const typeMap = new Map();
    familiars.forEach(f => {
      if (!typeMap.has(f.TypeId)) {
        typeMap.set(f.TypeId, { id: f.TypeId, name: f.TypeName });
      }
    });
    return Array.from(typeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [familiars]);

  const filteredAndSortedFamiliars = useMemo(() => {
    let result = [...familiars];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(f => 
        f.MobName.toLowerCase().includes(search) ||
        f.FamiliarId.toString().includes(search) ||
        f.MobId.toString().includes(search)
      );
    }

    if (selectedLevelRange.min !== 0 || selectedLevelRange.max !== Infinity) {
      result = result.filter(f => 
        f.Level >= selectedLevelRange.min && f.Level <= selectedLevelRange.max
      );
    }

    if (selectedElement !== 'all') {
      result = result.filter(f => f.ElementCode === selectedElement);
    }

    if (selectedType !== 'all') {
      result = result.filter(f => f.TypeId === selectedType);
    }

    const [sortKey, sortDir] = sortOption.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'level':
          comparison = a.Level - b.Level;
          break;
        case 'name':
          comparison = a.MobName.localeCompare(b.MobName);
          break;
        case 'type':
          comparison = a.TypeName.localeCompare(b.TypeName);
          break;
        default:
          comparison = 0;
      }
      return sortDir === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [familiars, searchTerm, selectedLevelRange, selectedElement, selectedType, sortOption]);

  const displayedFamiliars = useMemo(() => {
    return filteredAndSortedFamiliars.slice(0, displayCount);
  }, [filteredAndSortedFamiliars, displayCount]);

  const hasMore = displayCount < filteredAndSortedFamiliars.length;

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedLevelRange, selectedElement, selectedType, sortOption]);

  useEffect(() => {
    if (!hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedFamiliars.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, filteredAndSortedFamiliars.length]);

  const handleClearFilter = useCallback((filterKey) => {
    switch (filterKey) {
      case 'level':
        setSelectedLevelRange(LEVEL_RANGES[0]);
        break;
      case 'element':
        setSelectedElement('all');
        break;
      case 'type':
        setSelectedType('all');
        break;
      case 'search':
        setSearchTerm('');
        break;
    }
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLevelRange(LEVEL_RANGES[0]);
    setSelectedElement('all');
    setSelectedType('all');
  }, []);

  const selectedTypeName = selectedType === 'all' 
    ? '' 
    : uniqueTypes.find(t => t.id === selectedType)?.name || '';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[var(--primary-bright)] tracking-tight mb-4">
            Familiar Directory
          </h1>
          <div className="flex items-center justify-center gap-3 text-[var(--primary)]">
            <div className="w-5 h-5 border-2 border-[var(--secondary)] border-t-transparent rounded-full animate-spin" />
            Loading familiars...
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
            Familiar Directory
          </h1>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-[var(--primary-bright)] tracking-tight">
          Familiar Directory
        </h1>
        <p className="text-lg text-[var(--primary)] mt-2 max-w-2xl mx-auto">
          Browse all {familiars.length.toLocaleString()} familiars in MapleStory. Hover over cards for details.
        </p>
      </div>

      <div className="bg-[var(--background-dim)] rounded-xl p-4 mb-6 border border-[var(--primary-dim)]/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary-dim)]" />
            <input
              type="text"
              placeholder="Search by name or ID..."
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
              ${showFilters 
                ? 'bg-[var(--secondary)]/20 border-[var(--secondary)]/50 text-[var(--secondary)]'
                : 'bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)]'
              }
            `}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className={`
            flex flex-wrap gap-3
            ${showFilters ? 'flex' : 'hidden lg:flex'}
          `}>
            <FilterDropdown
              label="Level"
              value={selectedLevelRange.label}
              options={LEVEL_RANGES}
              onChange={(label) => setSelectedLevelRange(LEVEL_RANGES.find(r => r.label === label))}
              valueKey="label"
              labelKey="label"
            />

            <FilterDropdown
              label="Element"
              value={selectedElement}
              options={ELEMENTS}
              onChange={setSelectedElement}
              valueKey="code"
              labelKey="name"
            />

            <TypeFilter
              types={uniqueTypes}
              selectedType={selectedType}
              onChange={setSelectedType}
            />

            <FilterDropdown
              label="Sort"
              value={sortOption}
              options={SORT_OPTIONS}
              onChange={setSortOption}
            />
          </div>
        </div>

        <ActiveFilters
          filters={{
            levelRange: selectedLevelRange,
            element: selectedElement,
            type: selectedType,
            typeName: selectedTypeName,
            search: searchTerm,
          }}
          onClear={handleClearFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-[var(--primary)]">
        <span>
          Showing {displayedFamiliars.length.toLocaleString()} of {filteredAndSortedFamiliars.length.toLocaleString()} familiars
        </span>
        {filteredAndSortedFamiliars.length !== familiars.length && (
          <span className="text-[var(--primary-dim)]">
            ({familiars.length.toLocaleString()} total)
          </span>
        )}
      </div>

      {displayedFamiliars.length > 0 ? (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
            {displayedFamiliars.map((familiar) => (
              <FamiliarCard key={familiar.FamiliarId} familiar={familiar} />
            ))}
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
          <p className="text-[var(--primary)] text-lg">No familiars match your filters</p>
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
          Familiar data is extracted from game files. Images may not be available for all familiars.
        </p>
      </footer>
    </div>
  );
};

export default FamiliarsClient;
