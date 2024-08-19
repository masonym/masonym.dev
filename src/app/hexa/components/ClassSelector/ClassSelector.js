"use client";

import React, { useState } from "react";
import { classes } from "@/data/classes";
import { InputGrid } from "../InputGrid/InputGrid";

const ClassSelector = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [query, setQuery] = useState("");

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleItemClick = (className) => {
    setSelectedClass(className);
    setQuery("");
  };

  const filteredClasses = Object.keys(classes).filter((className) =>
    className.toLowerCase().includes(query.toLowerCase())
  );

  const classDetails = selectedClass ? classes[selectedClass] : null;

  return (
    <div>
      <h2>Select your class</h2>
      <div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Type to search..."
          style={{
            width: "100%",
            padding: "8px",
            boxSizing: "border-box",
          }}
        />
        {query && filteredClasses.length > 0 && (
          <ul
            style={{
              position: "absolute",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "150px",
              overflowY: "auto",
              backgroundColor: "white",
              margin: 0,
              padding: 0,
              listStyleType: "none",
              zIndex: 1000,
            }}
          >
            {filteredClasses.map((className, index) => (
              <li
                key={index}
                onClick={() => handleItemClick(className)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  color: "var(--primary-dim)"
                }}
              >
                {className}
              </li>
            ))}
          </ul>
        )}
      </div>
      {classDetails && <InputGrid classDetails={classDetails}></InputGrid>}
    </div>
  );
};

export default ClassSelector;