import React from 'react';
import Image from 'next/image';
import styles from './SkillItem.module.css'; // New CSS module for SkillItem

export const SkillItem = ({ skills, altText, classKey, isCommon, itemStyle }) => {
    // Determine the correct image path
    const imagePath = isCommon
        ? `/common/${altText}.png`
        : `/classImages/${classKey}/Skill_${altText}.png`;

    return (
        <div className={`${styles.item} ${itemStyle}`}>
            <Image
                src={imagePath}
                alt={altText}
                width={50}
                height={50}
            />
            <span style={{ whiteSpace: 'pre-line' }}>
                <p>{Array.isArray(skills) ? skills.join('\n') : skills}</p>
            </span>
        </div>
    );
};