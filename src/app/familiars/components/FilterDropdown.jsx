'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

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
          rounded-lg shadow-xl overflow-hidden min-w-full w-max
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
                <Image src={option.image} alt="" width={16} height={16} className="w-4 h-4 shrink-0" />
              )}
              <span className="min-w-0 truncate">{option[labelKey]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
