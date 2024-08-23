import React, { useState, useEffect } from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';
import styles from './SkillGroup.module.css'; // New CSS module for SkillGroup

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1 }) => {
    const [inputValues, setInputValues] = useState({});

    // caching inputs
    const storageKey = `skillGroup_${classKey}`;

    // load cached data

    useEffect(() => {
        const savedValues = localStorage.getItem(storageKey);
        if (savedValues) {
            setInputValues(JSON.parse(savedValues));
        }
    }, [storageKey]);

    
    const handleInputChange = (skillName, value) => {
        const updatedValues = {
            ...inputValues,
            [skillName]: value,
        };
        setInputValues(updatedValues);
        localStorage.setItem(storageKey, JSON.stringify(updatedValues))
    };

    const calculateTotalPoints = () => {
        return Object.values(inputValues)
    };

    return (
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {skills.map((skillSet, index) => {
                const skillName = Array.isArray(skillSet) ? formatSkillPath(skillSet[0]) : formatSkillPath(skillSet);
                
                return (
                    <SkillItem
                        key={index}
                        skills={skillSet}
                        altText={skillName}
                        classKey={classKey}
                        isCommon={isCommon}
                        itemStyle={itemStyle}
                        inputValue={inputValues[skillName] || 0}
                        onInputChange={handleInputChange}
                    />
                );
            })}
            {/* <div>Total Points: {calculateTotalPoints()}</div> */}

        </div>
    );
};

