import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import { formatSkillName, formatSkillPath } from '../../utils';

const SkillIcon = ({ skill, level, classKey, masterySkills, upgrade }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const iconRef = useRef(null);
    const tooltipRef = useRef(null);

    let iconPath;
    if (skill.type === 'Mastery') {
        const categorySkills = masterySkills[skill.category];
        const firstSkillInCategory = categorySkills[0];
        iconPath = `/classImages/${classKey}/Skill_${formatSkillPath(firstSkillInCategory)}.png`;
    } else {
        iconPath = `/classImages/${classKey}/Skill_${formatSkillPath(skill.skill)}.png`;
    }

    useEffect(() => {
        const handleMouseEnter = () => setShowTooltip(true);
        const handleMouseLeave = () => setShowTooltip(false);

        const iconElement = iconRef.current;
        if (iconElement) {
            iconElement.addEventListener('mouseenter', handleMouseEnter);
            iconElement.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (iconElement) {
                iconElement.removeEventListener('mouseenter', handleMouseEnter);
                iconElement.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    useEffect(() => {
        if (showTooltip && tooltipRef.current && iconRef.current) {
            const iconRect = iconRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            tooltipRef.current.style.left = `${iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2)}px`;
            tooltipRef.current.style.top = `${iconRect.top - tooltipRect.height - 10}px`;
        }
    }, [showTooltip]);

    return (
        <div className="flex flex-col items-center m-1 relative">
            <div ref={iconRef} className="relative w-12 h-12">
                <Image
                    src={iconPath}
                    alt={skill.skill}
                    fill
                    sizes='(max-width: 768px) 32px, (max-width: 1200px) 64px, 64px'
                />
            </div>
            <span className="text-xs mt-1">{level}</span>
            {showTooltip && upgrade && (
                <div
                    ref={tooltipRef}
                    className="fixed bg-gray-800 text-white p-2 rounded z-50 w-64 text-xs"
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="flex justify-between">
                        <span>Levels:</span>
                        <span>{upgrade.startLevel} → {upgrade.newLevel}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Damage Increase:</span>
                        <span>{(upgrade.relativeIncrease * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cost:</span>
                        <span>{upgrade.cost.toLocaleString()} fragments</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span>{(upgrade.efficiency * 100).toFixed(4)} per 100 fragments</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillIcon