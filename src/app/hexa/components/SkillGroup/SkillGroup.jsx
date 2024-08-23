import React, { useState, useEffect } from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';
import styles from './SkillGroup.module.css'; // New CSS module for SkillGroup

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1 }) => {
    // localStorage.clear()
    const [inputValues, setInputValues] = useState({});
    // Caching inputs
    const storageKey = `skillGroup_${classKey}_${isCommon ? 'common' : 'specific'}`;
    // console.log(storageKey)

    // Load cached data
    useEffect(() => {
        const savedValues = localStorage.getItem(storageKey);
        // console.log(savedValues)
        const defaultValues = skills.reduce((acc, skillSet) => {
            const skillName = Array.isArray(skillSet) ? formatSkillPath(skillSet[0]) : formatSkillPath(skillSet);
            acc[skillName] = 0; // Default to zero
            return acc;
        }, {});

        // Merge cached values with default values
        if (savedValues) {
            setInputValues({
                ...defaultValues,
                ...JSON.parse(savedValues)
            });
        } else {
            setInputValues(defaultValues);
        }
    }, [storageKey, skills]);

    const handleInputChange = (skillName, value) => {
        const updatedValues = {
            ...inputValues,
            [skillName]: value,
        };
        setInputValues(updatedValues);
        localStorage.setItem(storageKey, JSON.stringify(updatedValues));
    };

    const calculateTotalPoints = () => {
        return Object.values(inputValues).reduce((total, value) => total + Number(value), 0);
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