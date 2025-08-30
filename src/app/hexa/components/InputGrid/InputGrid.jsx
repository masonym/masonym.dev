import React from 'react';
import styles from './InputGrid.module.css';
import { masteryDesignation } from '@/data/masteryDesignation';
import { SkillGroup } from '../SkillGroup/SkillGroup';

export const InputGrid = ({ classKey, classDetails, skillLevels, updateSkillLevels }) => {
    const firstMasterySkills = masteryDesignation[classKey]?.firstMastery || [];
    const secondMasterySkills = masteryDesignation[classKey]?.secondMastery || [];
    const thirdMasterySkills = masteryDesignation[classKey]?.thirdMastery || [];
    const fourthMasterySkills = masteryDesignation[classKey]?.fourthMastery || [];

    return (
        <div>
            <div className={styles.container}>
                <div>
                    <h1 className="text-[32px]">{classKey}</h1>
                </div>
                <div className="my-4">
                    <p>Enter in your current Hexa levels:</p>
                </div>
                <div className={styles.gridHexaLevels}>
                    {/* Skill Nodes */}
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
