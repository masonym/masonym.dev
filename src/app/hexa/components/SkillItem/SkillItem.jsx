import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './SkillItem.module.css'; // New CSS module for SkillItem

export const SkillItem = ({ skills, altText, classKey, isCommon, inputValue: initialInputValue, itemStyle, onInputChange }) => {
    const [inputValue, setInputValue] = useState(initialInputValue);

    useEffect(() => {
        setInputValue(initialInputValue);
    }, [initialInputValue]);

    // image handling for common cores
    const imagePath = isCommon
        ? `/common/${altText}.png`
        : `/classImages/${classKey}/Skill_${altText}.png`;

    // input field
    const handleInputChange = (event) => {
        let value = parseInt(event.target.value, 10);

        if (isNaN(value)) {
            value = 0;
        } else if (value > 30) {
            value = 30;
        } else if (value < 0) {
            value = 0;
        }

        setInputValue(value);
        onInputChange && onInputChange(altText, value);
    };

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
            <input
                // type="number"
                value={inputValue}
                onChange={handleInputChange}
                min={0}
                max={30}
                className={styles.levelInput}
            />
        </div>
    );
};