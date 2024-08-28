import React, { useEffect, useState } from 'react'
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import { GoalInputGrid } from './GoalInputGrid';

const CostCalc = ({ selectedClass, classDetails, skillLevels }) => {
  // skillLevels is an object of objects(?)
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
      console.log("Local storage: ",localStorage)
      console.log("Updated levels: ", updatedLevels)
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
        return "";
    }
  };

  const calculateSkillFragCost = (skill) => {
    let totalFrags = 0;
    const costTable = getCostTable(skill[1].type);
    const level = skill[1].level

    for (let i = 0; i < level; i++) {
      const cost = costTable[i][i + 1].frags;
      totalFrags += cost;
    }
    
    return totalFrags
  }

  const calculateCostDiff = ({skill, goalSkill}) => {
    const finalCost = calculateSkillFragCost(goalSkill)
    const currentSpent = calculateSkillFragCost(skill)

    return (finalCost - currentSpent)
  }

  return (
    <div className="flex flex-col">
      <GoalInputGrid
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
      />
      {/* <p>{Object.entries(skillLevels)}</p> */}
      {console.log("Current skill levels: \n", skillLevels)}
      {console.log("Desired skill levels: \n",desiredSkillLevels)}
    </div>
  )
}

export default CostCalc