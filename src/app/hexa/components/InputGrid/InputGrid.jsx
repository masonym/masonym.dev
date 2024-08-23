import React from 'react';
import styles from './InputGrid.module.css';
import { masteryDesignation } from '@/data/masteryDesignation';
import { SkillGroup } from '../SkillGroup/SkillGroup';

export const InputGrid = ({ classKey, classDetails }) => {
    const firstMasterySkills = masteryDesignation[classKey]?.firstMastery || [];
    const secondMasterySkills = masteryDesignation[classKey]?.secondMastery || [];

    return (
        <div>
            <div className={styles.container}>
                <div>
                    <h1>{classKey}</h1>
                </div>
                <div style={{ marginBottom: "30px" }}>
                    <p>Enter in your current Hexa Levels:</p>
                </div>
                <div className={styles.gridHexaLevels}>
                    {/* Origin Skill */}
                    <SkillGroup 
                        skills={[classDetails.originSkill]} 
                        classKey={classKey} 
                        itemStyle={styles.originItem} 
                    />

                    {/* Mastery Skills - Pass all skills but only render the first skill's image */}
                    <SkillGroup 
                        skills={[firstMasterySkills, secondMasterySkills]} 
                        classKey={classKey} 
                        itemStyle={styles.masteryItem} 
                        columns={2} 
                    />

                    {/* Boost Skills */}
                    <SkillGroup 
                        skills={classDetails.boostSkills} 
                        classKey={classKey} 
                        itemStyle={styles.boostItem} 
                        columns={4} 
                    />


                    {/* Common Core (Janus) - Use the isCommon prop */}
                    <SkillGroup 
                        skills={classDetails.commonSkills} 
                        classKey={classKey}
                        isCommon={true} 
                        itemStyle={styles.commonItem} 
                    />
                </div>
            </div>
        </div>
    );
};