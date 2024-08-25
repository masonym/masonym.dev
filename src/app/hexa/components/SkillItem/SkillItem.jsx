import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const SkillItem = ({ skills, altText, classKey, isCommon, inputValue: initialInputValue, itemStyle, onInputChange }) => {
    const [inputValue, setInputValue] = useState(initialInputValue);

    useEffect(() => {
        setInputValue(initialInputValue);
    }, [initialInputValue]);

    const imagePath = isCommon
        ? `/common/${altText}.png`
        : `/classImages/${classKey}/Skill_${altText}.png`;

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
        <div className={`text-center p-2.5 rounded-md flex flex-col items-center gap-[5%] w-full h-auto justify-between ${itemStyle}`}>
            <Image
                src={imagePath}
                alt={altText}
                width={50}
                height={50}
            />
            <span className="whitespace-pre-line">
                <p className="mt-2 mb-0">{Array.isArray(skills) ? skills.join('\n') : skills}</p>
            </span>
            <input
                value={inputValue}
                onChange={handleInputChange}
                min={0}
                max={30}
                className="font-inherit text-black mt-1 rounded text-center w-10 bg-[#cecece] cursor-[var(--cursorClick)]"
            />
        </div>
    );
};