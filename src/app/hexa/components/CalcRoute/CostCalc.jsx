import React, { useEffect, useState } from 'react'
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import { GoalInputGrid } from './GoalInputGrid';

const CostCalc = ({ selectedClass, classDetails, skillLevels }) => {
  const [desiredSkillLevels, setDesiredSkillLevels] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedSkillLevels = localStorage.getItem(`desiredSkillLevels_${selectedClass}`);
      setDesiredSkillLevels(savedSkillLevels ? JSON.parse(savedSkillLevels) : {});
    }
  }, [selectedClass, isClient]);

  const updateSkillLevels = (newLevels, skillType) => {
    setDesiredSkillLevels(prevLevels => {
      const updatedLevels = Object.keys(newLevels).reduce((acc, skillName) => {
        acc[skillName] = {
          level: newLevels[skillName],
          type: skillType
        };
        return acc;
      }, { ...prevLevels });

      if (isClient) {
        localStorage.setItem(`desiredSkillLevels_${selectedClass}`, JSON.stringify(updatedLevels));
      }
      return updatedLevels;
    });
  };

  const getCostTable = (skillType) => {
    switch (skillType) {
      case 'origin':
        return originUpgradeCost;
      case 'mastery':
        return masteryUpgradeCost;
      case 'common':
        return commonUpgradeCost;
      case 'enhancement':
        return enhancementUpgradeCost;
      default:
        console.error('Unknown skill type');
        return [];
    }
  };

  const calculateSkillFragCost = (skill) => {
    let totalFrags = 0;
    const costTable = getCostTable(skill.type);
    const level = skill.level;

    for (let i = 0; i < level; i++) {
      const cost = costTable[i][i + 1].frags;
      totalFrags += cost;
    }

    return totalFrags;
  };

  const calculateCostDiff = (skillName) => {
    const currentSkill = skillLevels[skillName];
    const desiredSkill = desiredSkillLevels[skillName];

    if (!currentSkill || !desiredSkill) return 0;

    const finalCost = calculateSkillFragCost(desiredSkill);
    const currentSpent = calculateSkillFragCost(currentSkill);

    return finalCost - currentSpent;
  };

  return (
    <div className="flex flex-col">
      <GoalInputGrid
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
      />
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Skill Upgrade Costs:</h2>
        {Object.keys(desiredSkillLevels).map((skillName) => (
          <div key={skillName} className="mb-2">
            <span className="font-semibold">{skillName}:</span> {calculateCostDiff(skillName)} fragments
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostCalc;