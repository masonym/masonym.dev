'use client';

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_REWARD } from './mysticFrontierUiConstants';

export default function RewardOptionSelectable({ label, optionNum, option, onChange, knownItems, isSelected, onSelect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(!!option.reward && option.reward !== DEFAULT_REWARD);
  const [searchTerm, setSearchTerm] = useState(option.reward || DEFAULT_REWARD);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (option.reward) {
      setSearchTerm(option.reward);
      setHasBeenEdited(option.reward !== DEFAULT_REWARD);
    }
  }, [option.reward]);

  const filteredItems = searchTerm && searchTerm !== DEFAULT_REWARD
    ? knownItems.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : knownItems;

  const selectItem = (item) => {
    setSearchTerm(item);
    onChange('reward', item);
    setShowDropdown(false);
    setHighlightedIndex(0);
    setHasBeenEdited(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      inputRef.current?.blur();
      return;
    }

    if (!showDropdown || filteredItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
      case 'Tab':
        if (hasBeenEdited && filteredItems[highlightedIndex]) {
          selectItem(filteredItems[highlightedIndex]);
        }
        setShowDropdown(false);
        break;
    }
  };

  return (
    <div
      className={`p-2 rounded border-2 transition cursor-pointer ${
        isSelected
          ? 'border-green-500 bg-green-900/20'
          : 'border-[var(--primary-dim)]/50 hover:border-[var(--primary-dim)]'
      }`}
      onClick={(e) => {
        if (e.target.tagName !== 'INPUT') {
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--primary-dim)]">{label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!option.reward) {
              onChange('reward', DEFAULT_REWARD);
            }
            onSelect();
          }}
          tabIndex={-1}
          className={`px-2 py-0.5 rounded text-xs font-bold transition ${
            isSelected
              ? 'bg-green-500 text-white'
              : 'bg-[var(--background-bright)] text-[var(--primary-dim)] hover:bg-[var(--background-dim)]'
          }`}
        >
          {isSelected ? '✓' : 'Select'}
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange('reward', e.target.value);
              setShowDropdown(true);
              setHighlightedIndex(0);
              setHasBeenEdited(true);
            }}
            onFocus={() => {
              setShowDropdown(true);
              setHighlightedIndex(0);
            }}
            onBlur={() => {
              if (!searchTerm && !hasBeenEdited) {
                setSearchTerm(DEFAULT_REWARD);
                onChange('reward', DEFAULT_REWARD);
              }
              setTimeout(() => setShowDropdown(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Select reward..."
            className="w-full p-1.5 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] text-sm"
          />
          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-[var(--background)] border border-[var(--primary-dim)] rounded shadow-lg">
              {filteredItems.map((item, idx) => (
                <button
                  key={item}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectItem(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-2 py-1.5 text-[var(--primary)] text-xs ${
                    idx === highlightedIndex
                      ? 'bg-[var(--secondary)] text-[var(--primary-dark)]'
                      : 'hover:bg-[var(--background-bright)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          pattern="[0-9]*"
          value={option.apCost || ''}
          onChange={(e) => {
            if (!e.target.value) {
              onChange('apCost', null);
              return;
            }
            const parsed = parseInt(e.target.value);
            if (Number.isNaN(parsed)) {
              onChange('apCost', null);
              return;
            }
            onChange('apCost', Math.max(0, parsed));
          }}
          onKeyDown={(e) => {
            const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
            const isDigit = e.key >= '0' && e.key <= '9';
            if (!isDigit && !allowedKeys.includes(e.key)) {
              e.preventDefault();
            }
          }}
          placeholder="AP"
          className="w-16 p-1.5 rounded bg-[var(--background-bright)] border border-[var(--primary-dim)] text-[var(--primary)] text-sm text-center"
        />
      </div>
    </div>
  );
}
