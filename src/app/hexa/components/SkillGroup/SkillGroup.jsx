import React from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';
import styles from './SkillGroup.module.css'; // New CSS module for SkillGroup

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1 }) => (
    <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {skills.map((skillSet, index) => (
            <SkillItem
                key={index}
                skills={skillSet} 
                altText={Array.isArray(skillSet) ? formatSkillPath(skillSet[0]) : formatSkillPath(skillSet)}
                classKey={classKey}
                isCommon={isCommon}
                itemStyle={itemStyle}
            />
        ))}
    </div>
);