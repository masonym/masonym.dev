"use client";

import React, { useState, useRef, useEffect } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { classes } from "@/data/classes";
import HexaSkillCalculator from "../HexaSkillCalculator/HexaSkillCalculator";
import ShineCalculator, { SHINE_CLASSES } from "../ShineCalculator/ShineCalculator";

const ClassSelector = () => {
  const isClient = useHydrated();
  const [restored, setRestored] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Restore the last class once, on the client. Everything below renders only
  // after this, so the children can read their own saved state directly.
  if (isClient && !restored) {
    setRestored(true);
    const savedClass = localStorage.getItem('selectedClass');
    if (savedClass) setSelectedClass(savedClass);
  }

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleItemClick = (className) => {
    setSelectedClass(className);
    localStorage.setItem('selectedClass', className);
    setQuery(className);
    setIsOpen(false);
  };

  const filteredClasses = Object.keys(classes).filter((className) =>
    className.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredClasses.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredClasses.length) {
        handleItemClick(filteredClasses[highlightedIndex]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="bold-20 my-4">Select your class</h2>
      <div className="relative w-1/3 z-10">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)}
          placeholder="Search..."
          className="w-full p-2 box-border border border-primary-dim rounded bg-primary-dark text-primary"
        />
        {isOpen && (
          <ul ref={dropdownRef} className="w-full border border-gray-300 rounded max-h-[150px] overflow-y-auto bg-primary-dark m-0 p-0 list-none z-50">
            {filteredClasses.map((className, index) => (
              <li
                key={className}
                onClick={() => handleItemClick(className)}
                className={`p-2 cursor-pointer border-b border-primary-dim text-primary-bright ${
                  highlightedIndex === index ? 'bg-background-bright' : ''
                }`}
              >
                {className}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex w-full flex-col items-center">
        {selectedClass && classes[selectedClass] && (
          <>
            {SHINE_CLASSES.has(selectedClass) ? (
              <ShineCalculator selectedClass={selectedClass} />
            ) : (
              <HexaSkillCalculator
                key={selectedClass}
                classKey={selectedClass}
                classDetails={classes[selectedClass]}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;