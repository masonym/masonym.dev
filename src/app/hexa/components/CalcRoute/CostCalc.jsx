import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import { GoalInputGrid } from './GoalInputGrid';
import { formatSkillName } from '../../utils';

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

  const calculateSkillCost = (skill, costType) => {
    let totalCost = 0;
    const costTable = getCostTable(skill.type);
    const level = skill.level;

    for (let i = 1; i < level; i++) {
      const cost = costTable[i][i + 1][costType];
      totalCost += cost;
    }

    return totalCost;
  };

  const calculateCosts = (skillName) => {
    const currentSkill = skillLevels[skillName];
    const desiredSkill = desiredSkillLevels[skillName];

    if (!currentSkill || !desiredSkill) return { current: { solErda: 0, frags: 0 }, remaining: { solErda: 0, frags: 0 }, levels: { current: 0, desired: 0 } };

    const currentSolErdaSpent = calculateSkillCost(currentSkill, 'solErda');
    const currentFragSpent = calculateSkillCost(currentSkill, 'frags');
    const finalSolErdaCost = calculateSkillCost(desiredSkill, 'solErda');
    const finalFragCost = calculateSkillCost(desiredSkill, 'frags');

    return {
      current: { solErda: currentSolErdaSpent, frags: currentFragSpent },
      remaining: { solErda: finalSolErdaCost - currentSolErdaSpent, frags: finalFragCost - currentFragSpent },
      levels: { current: currentSkill.level, desired: desiredSkill.level }
    };
  };

  const getSkillImage = (skillName, skillType) => {
    if (skillType === 'common') {
      return `/common/${skillName}.png`;
    } else {
      return `/classImages/${selectedClass}/Skill_${skillName}.png`;
    }
  };

  return (
    <div className="flex flex-col">
      <GoalInputGrid
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
      />
      <div className="mt-4 flex items-center flex-col">
        <h2 className="text-xl font-bold mb-2">Skill Upgrade Costs:</h2>
        {Object.keys(desiredSkillLevels).map((skillName) => {
          const costs = calculateCosts(skillName);
          const skillType = desiredSkillLevels[skillName].type;
          return (
            <div key={skillName} className="mb-4 p-4 bg-gray-100 rounded-lg w-[75%]">
              <div className="flex items-center mb-2">
                <Image
                  src={getSkillImage(skillName, skillType)}
                  alt={skillName}
                  width={40}
                  height={40}
                  className="mr-3"
                />
                <span className="flex-1 font-semibold text-gray-600">{formatSkillName(skillName)}</span>
                <span className="text-sm font-medium text-gray-600">
                  Level: {costs.levels.current} → {costs.levels.desired}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Current Level Costs:</h3>
                  <p className="text-blue-600">{costs.current.solErda} Sol Erda</p>
                  <p className="text-green-600">{costs.current.frags} Fragments</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600">Remaining Costs:</h3>
                  <p className="text-blue-600">{costs.remaining.solErda} Sol Erda</p>
                  <p className="text-green-600">{costs.remaining.frags} Fragments</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CostCalc;