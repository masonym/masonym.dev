import React from 'react';
import { SkillItem } from '../SkillItem/SkillItem';
import { formatSkillPath } from '../../utils';

export const SkillGroup = ({ skills, classKey, isCommon = false, itemStyle, columns = 1, skillLevels, updateSkillLevels, skillType }) => {
    const handleInputChange = (skillName, value) => {
        updateSkillLevels({ [skillName]: value }, skillType);
    };

    const gridColumns = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
    };

    return (
        <div className={`grid ${gridColumns[columns]} gap-4`}>
            {skills
                .filter(skillSet => skillSet && skillSet.length > 0)
                .map((skillSet, index) => {
                    console.log(skillSet)
                    const skillName = Array.isArray(skillSet) ? formatSkillPath(skillSet[0]) : formatSkillPath(skillSet);

                    return (
                        <div key={index} className={`w-full ${columns === 1 ? 'col-span-full' : ''}`}>
                            <SkillItem
                                skills={skillSet}
                                altText={skillName}
                                classKey={classKey}
                                isCommon={isCommon}
                                itemStyle={`${itemStyle} p-4 rounded-lg shadow-md h-full`}
                                inputValue={skillLevels[skillName]?.level || ''}
                                onInputChange={handleInputChange}
                            />
                        </div>
                    );
                })}
        </div>
    );
};
