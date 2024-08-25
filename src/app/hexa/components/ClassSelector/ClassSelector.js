"use client";

import React, { useState, useRef, useEffect } from "react";
import { classes } from "@/data/classes";
import { InputGrid } from "../InputGrid/InputGrid";
import styles from './ClassSelector.module.css';
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import Image from "next/image";

import sol_erda_fragment from "../../assets/sol_erda_fragment.png"
import sol_erda from '../../assets/sol_erda.png'



const ClassSelector = () => {

  // localStorage.clear()

  // Initialize selectedClass from localStorage or as an empty string
  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem('selectedClass') || "";
  });
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Save the selected class to localStorage whenever it changes
    localStorage.setItem('selectedClass', selectedClass);
  }, [selectedClass]);

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

  const [skillLevels, setSkillLevels] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSkillLevels = localStorage.getItem(`skillLevels_${selectedClass}`);
      setSkillLevels(savedSkillLevels ? JSON.parse(savedSkillLevels) : {});
    }
  }, [selectedClass]);

  const updateSkillLevels = (newLevels, skillType) => {
    setSkillLevels(prevLevels => {
      const updatedLevels = Object.keys(newLevels).reduce((acc, skillName) => {
        acc[skillName] = {
          level: newLevels[skillName],
          type: skillType
        };
        return acc;
      }, { ...prevLevels });

      localStorage.setItem(`skillLevels_${selectedClass}`, JSON.stringify(updatedLevels));
      return updatedLevels;
    });
  };

  const calculateTotalSolErda = () => {
    let totalSolErda = 0;

    Object.values(skillLevels).forEach(({ level, type }) => {
      const costTable = getCostTable(type);

      for (let i = 0; i < level; i++) {
        const cost = costTable[i][i + 1].solErda;
        totalSolErda += cost;
      }
    });

    return totalSolErda;
  };

  const calculateTotalFrags = () => {
    let totalFrags = 0;

    Object.values(skillLevels).forEach(({ level, type }) => {
      const costTable = getCostTable(type);

      for (let i = 0; i < level; i++) {
        const cost = costTable[i][i + 1].frags;
        totalFrags += cost;
      }
    });

    return totalFrags;
  };

  const getCostTable = (skillType) => {
    switch (skillType) {
      case 'origin':
        return originUpgradeCost;
      case 'mastery':
        return masteryUpgradeCost;
      case 'common':
        return commonUpgradeCost;
      case 'enhancement':
        return enhancementUpgradeCost;
      default:
        console.error('Unknown skill type');
        return ""
    }
  };


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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {classDetails && (
          <>
            <InputGrid
              classKey={selectedClass}
              classDetails={classDetails}
              skillLevels={skillLevels}
              updateSkillLevels={updateSkillLevels}
            />
            <h2>Total Costs:</h2>
            <div className={styles.costContainer}>
              <div>
                <Image
                  src={sol_erda}
                  width={64}
                  height={64}
                  alt={"Sol Erda Energy"}
                />

                <h3>{calculateTotalSolErda()}</h3>
              </div>
              <div>

                <Image
                  src={sol_erda_fragment}
                  width={64}
                  height={64}
                  alt={"Sol Erda Fragment"}
                />
                <h3>{calculateTotalFrags()}</h3>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassSelector;