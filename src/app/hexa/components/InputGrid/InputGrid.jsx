import React from 'react';
import styles from './InputGrid.module.css';
import { masteryDesignation } from '@/data/masteryDesignation';
import Image from 'next/image';
import { formatSkillPath } from '@/utils';

export const InputGrid = ({ classKey, classDetails }) => {
    const firstMasterySkills = masteryDesignation[classKey]?.firstMastery;
    const secondMasterySkills = masteryDesignation[classKey]?.secondMastery;

    const formatMasterySkills = (skills) => {
        if (Array.isArray(skills)) {
            return skills.join('\n');
        }
        return skills || '';
    };

    const getFirstSkill = (skills) => {
        if (Array.isArray(skills)) {
            return skills[0];
        }
        return skills;
    };

    return (
        <div>
            <div className={styles.container}>
                <div>
                    <h1>{classKey}</h1>
                </div>
                <div style={{ marginBottom: "30px" }}>
                    Enter in your current Hexa Levels:
                </div>
                <div className={styles.gridHexaLevels}>
                    {/* origin */}
                    <div className={styles.gridOriginLevels}>
                        <div className={styles.item}>
                            <Image
                                src={`/classImages/${classKey}/Skill_${formatSkillPath(classDetails.originSkill)}.png`}
                                alt={classDetails.originSkill}
                                width={50}
                                height={50}
                            />
                            {classDetails.originSkill}
                        </div>
                    </div>
                    {/* mastery nodes */}
                    <div className={styles.gridMasteryLevels}>
                        {[firstMasterySkills, secondMasterySkills].map((skills, index) => (
                            skills && (
                                <div className={styles.item} key={index}>
                                    <Image
                                        src={`/classImages/${classKey}/Skill_${formatSkillPath(getFirstSkill(skills))}.png`}
                                        alt={getFirstSkill(skills)}
                                        width={50}
                                        height={50}
                                    />
                                    {console.log(formatSkillPath(getFirstSkill(skills)))}
                                    <span style={{ whiteSpace: 'pre-line' }}>
                                        {formatMasterySkills(skills)}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>
                    {/* boost nodes */}
                    <div className={styles.gridBoostLevels}>
                        {classDetails.boostSkills.map((skill, index) => (
                            <div className={styles.item} key={index}>
                                <Image
                                    src={`/classImages/${classKey}/Skill_${formatSkillPath(skill)}.png`}
                                    alt={skill}
                                    width={50}
                                    height={50}
                                />
                                {skill}
                            </div>
                        ))}
                    </div>
                    {/* common cores (janus) */}
                    <div className={styles.gridCommonLevels}>
                        <div className={styles.item}>
                            <Image
                                src="/common/janus.png"
                                alt="Sol Janus"
                                width={50}
                                height={50}
                            />
                            Sol Janus
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};