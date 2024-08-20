"use client";

import React, { useState, useRef, useEffect } from "react";
import { classes } from "@/data/classes";
import { InputGrid } from "../InputGrid/InputGrid";
import styles from './ClassSelector.module.css';

const ClassSelector = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleItemClick = (className) => {
    setSelectedClass(className);
    setQuery(className);
    setIsOpen(false);
  };

  const filteredClasses = Object.keys(classes).filter((className) =>
    className.toLowerCase().includes(query.toLowerCase())
  );

  const classDetails = selectedClass ? classes[selectedClass] : null;

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

  return (
    <div className={styles.container}>
      <h2>Select your class</h2>
      <div className={styles.dropdownContainer}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(true)}
          placeholder="Search..."
          className={styles.input}
        />
        {isOpen && (
          <ul ref={dropdownRef} className={styles.dropdown}>
            {filteredClasses.map((className, index) => (
              <li
                key={index}
                onClick={() => handleItemClick(className)}
                className={`${styles.dropdownItem} ${index === highlightedIndex ? styles.highlighted : ''}`}
              >
                {className}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        {classDetails && <InputGrid classKey={selectedClass} classDetails={classDetails} />}

      </div>
    </div>
  );
};

export default ClassSelector;