import React from 'react';
import styles from './InputGrid.module.css';
import masteryDesignation from '@/data/masteryDesignation'
import Image from 'next/image';
import { formatSkillPath } from '@/utils';

export const InputGrid = ({ classKey, classDetails }) => {
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
                    <div className={styles.item}>
                        <Image
                            src={`/classImages/${classKey}/Skill_${formatSkillPath(classDetails.originSkill)}.png`}
                            alt={classDetails.originSkill}
                            width={50} // or any other appropriate width and height
                            height={50} // or any other appropriate width and height
                        />
                        {classDetails.originSkill}
                    </div>
                    {/* map over mastery nodes */}
                    {/* might need to change this to account for only 2 masteries */}
                    {classDetails.masterySkills.map((skill, index) => (
                        <div className={styles.item} key={index}>
                            <Image
                                src={`/classImages/${classKey}/Skill_${formatSkillPath(skill)}.png`}
                                alt={skill}
                                width={50} // or any other appropriate width and height
                                height={50} // or any other appropriate width and height
                            />
                            {skill}
                            {/* {console.log(formatSkillPath(skill))} */}
                        </div>
                    ))}
                    {/* map over boost nodes */}
                    {classDetails.boostSkills.map((skill, index) => (
                        <div className={styles.item} key={index}>
                            <Image
                                src={`/classImages/${classKey}/Skill_${formatSkillPath(skill)}.png`}
                                alt={skill}
                                width={50} // or any other appropriate width and height
                                height={50} // or any other appropriate width and height
                            />
                            {skill}
                            {console.log(formatSkillPath(skill))}
                        </div>
                    ))}
                    {/* add janus */}
                </div>
            </div>
        </div>
    );
};
