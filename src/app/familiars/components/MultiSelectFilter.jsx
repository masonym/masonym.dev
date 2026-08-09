'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const MultiSelectFilter = ({ label, allLabel, values, options, onChange, valueKey = 'value', labelKey = 'label', imageFor = null }) => {
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

  const toggleValue = (val) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const buttonLabel = values.length === 0
    ? allLabel
    : values.length === 1
      ? options.find(o => o[valueKey] === values[0])?.[labelKey] || allLabel
      : `${label} (${values.length})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          border transition-all text-sm min-w-[140px] justify-between
          ${values.length > 0
            ? 'bg-[var(--secondary)]/10 border-[var(--secondary)]/50 text-[var(--secondary)]'
            : 'bg-[var(--background-bright)] border-[var(--primary-dim)]/30 text-[var(--primary)] hover:text-[var(--primary-bright)] hover:border-[var(--secondary)]/50'
          }
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {values.length === 1 && imageFor && imageFor(values[0]) && (
            <Image src={imageFor(values[0])} alt="" width={16} height={16} className="w-4 h-4" />
          )}
          {buttonLabel}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 mt-1 z-50
          bg-[var(--background-dim)] border border-[var(--primary-dim)]/50
          rounded-lg shadow-xl overflow-hidden min-w-full w-max
          max-h-[50vh] overflow-y-auto
        ">
          <button
            onClick={() => onChange([])}
            className={`
              w-full px-3 py-2 text-left text-sm
              hover:bg-[var(--background-bright)]
              transition-colors flex items-center gap-2
              ${values.length === 0
                ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]'
                : 'text-[var(--primary)]'
              }
            `}
          >
            <span className="min-w-0 truncate">{allLabel}</span>
          </button>
          {options.map((option) => {
            const val = option[valueKey];
            const checked = values.includes(val);
            const img = imageFor ? imageFor(val) : option.image;
            return (
              <button
                key={val}
                onClick={() => toggleValue(val)}
                className={`
                  w-full px-3 py-2 text-left text-sm
                  hover:bg-[var(--background-bright)]
                  transition-colors flex items-center gap-2
                  ${checked
                    ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]'
                    : 'text-[var(--primary)]'
                  }
                `}
              >
                <span className={`
                  w-4 h-4 rounded border flex items-center justify-center shrink-0
                  ${checked ? 'bg-[var(--secondary)] border-[var(--secondary)]' : 'border-[var(--primary-dim)]/50'}
                `}>
                  {checked && <span className="w-2 h-2 rounded-sm bg-[var(--background-dim)]" />}
                </span>
                {img && (
                  <Image src={img} alt="" width={16} height={16} className="w-4 h-4 shrink-0" />
                )}
                <span className="min-w-0 truncate">{option[labelKey]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
