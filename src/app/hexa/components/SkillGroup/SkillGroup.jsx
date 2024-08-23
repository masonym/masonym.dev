import React from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';
import styles from './SkillGroup.module.css';

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1, skillLevels, updateSkillLevels, skillType }) => {
    const handleInputChange = (skillName, value) => {
        updateSkillLevels({ [skillName]: value }, skillType);
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
                        inputValue={skillLevels[skillName]?.level || 0}
                        onInputChange={handleInputChange}
                    />
                );
            })}
        </div>
    );
};