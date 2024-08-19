import React from 'react';
import styles from './InputGrid.module.css';

export const InputGrid = ({ classDetails }) => {
    return (
        <div>
            <div className={styles.container}>
                <div style={{marginBottom: "10px"}}>
                    Enter in your current Hexa Levels:
                </div>
                <div className={styles.gridHexaLevels}>
                    {/* origin */}``7788787
                    <div className={styles.item}>
                        {classDetails.originSkill}
                    </div>
                    {/* map over mastery nodes */}
                    {/* might need to change this to account for only 2 masteries */}
                    {classDetails.masterySkills.map((skill, index) => (
                        <div className={styles.item} key={index}>
                            {skill}
                        </div>
                    ))}
                    {/* map over boost nodes */}
                    {classDetails.boostSkills.map((skill, index) => (
                        <div className={styles.item} key={index}>
                            {skill}
                        </div>
                    ))}
                    {/* add janus */}
                </div>
            </div>
        </div>
    );
};
