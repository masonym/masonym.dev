import React, { useState } from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';
import styles from './SkillGroup.module.css'; // New CSS module for SkillGroup

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1 }) => {
    const [inputValues, setInputValues] = useState({});

    const handleInputChange = (skillName, value) => {
        setInputValues((prevValues) => ({
            ...prevValues,
            [skillName]: value,
        }));
    };

    const calculateTotalPoints = () => {
        return Object.values(inputValues).reduce((total, value) => total + value, 0);
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
                        onInputChange={handleInputChange}
                    />
                );
            })}
            <div>Total Points: {calculateTotalPoints()}</div>

        </div>
    );
};