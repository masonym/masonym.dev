import React from 'react';
import styles from '../InputGrid/InputGrid.module.css';
import { masteryDesignation } from '@/data/masteryDesignation';
import { SkillGroup } from '../SkillGroup/SkillGroup';

export const GoalInputGrid = ({ classKey, classDetails, skillLevels, updateSkillLevels }) => {
    const firstMasterySkills = masteryDesignation[classKey]?.firstMastery || [];
    const secondMasterySkills = masteryDesignation[classKey]?.secondMastery || [];
    const thirdMasterySkills = masteryDesignation[classKey]?.thirdMastery || [];
    const fourthMasterySkills = masteryDesignation[classKey]?.fourthMastery || [];

    return (
        <div>
            <div className={styles.container}>
                <div className="text-2xl font-bold text-center mb-4">
                    Cost Calculator
                </div>
                <div className="my-4">
                    <p>Enter in your desired Hexa levels:</p>
                </div>
                <div className={styles.gridHexaLevels}>
                    {/* Origin Skill */}
                    <SkillGroup
                        skills={[classDetails.originSkill, classDetails.ascentSkill]}
                        classKey={classKey}
                        itemStyle={styles.originItem}
                        columns={2}
                        skillLevels={skillLevels}
                        updateSkillLevels={updateSkillLevels}
                        skillType="skill"
                    />

                    <SkillGroup
                        skills={[firstMasterySkills, secondMasterySkills, thirdMasterySkills, fourthMasterySkills]}
                        classKey={classKey}
                        itemStyle={styles.masteryItem}
                        columns={4}
                        skillLevels={skillLevels}
                        updateSkillLevels={updateSkillLevels}
                        skillType="mastery"
                    />

                    <SkillGroup
                        skills={classDetails.boostSkills}
                        classKey={classKey}
                        itemStyle={styles.boostItem}
                        columns={4}
                        skillLevels={skillLevels}
                        updateSkillLevels={updateSkillLevels}
                        skillType="enhancement"
                    />

                    <SkillGroup
                        skills={classDetails.commonSkills}
                        classKey={classKey}
                        isCommon={true}
                        itemStyle={styles.commonItem}
                        skillLevels={skillLevels}
                        updateSkillLevels={updateSkillLevels}
                        skillType="common"
                    />
                </div>
            </div>
        </div>
    );
};
