import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { originUpgradeCost, masteryUpgradeCost, enhancementUpgradeCost, commonUpgradeCost } from "@/data/solErda";
import { GoalInputGrid } from './GoalInputGrid';
import { formatSkillName, formatSkillPath } from '../../utils';
import sol_erda_fragment from "../../assets/sol_erda_fragment.png";
import sol_erda from '../../assets/sol_erda.png';
import { masteryDesignation } from '@/data/masteryDesignation';

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

    for (let i = 0; i < level; i++) {
      const cost = costTable[i][i + 1][costType];
      totalCost += cost;
    }

    return totalCost;
  };

  const calculateCosts = (skillName) => {
    var currentSkill = skillLevels[skillName];
    const desiredSkill = desiredSkillLevels[skillName];

    if (!currentSkill) {
      currentSkill = { 'level': 0, type: desiredSkill.type }
    }

    if (!currentSkill || !desiredSkill) {
      return { current: { solErda: 0, frags: 0 }, remaining: { solErda: 0, frags: 0 }, levels: { current: 0, desired: 0 } };
    }

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

  const calculateTotal = () => {
    let totalRemainingSolErda = 0;
    let totalRemainingFrags = 0;

    Object.keys(desiredSkillLevels).forEach((skillName) => {
      const costs = calculateCosts(skillName);
      totalRemainingSolErda += costs.remaining.solErda;
      totalRemainingFrags += costs.remaining.frags;
    });

    return { solErda: totalRemainingSolErda, frags: totalRemainingFrags };
  };

  const getSkillImage = (skillName, skillType) => {
    if (skillType === 'common') {
      return `/common/${skillName}.png`;
    } else {
      return `/classImages/${selectedClass}/Skill_${skillName}.png`;
    }
  };
  
  const getOrderedSkills = (classDetails, desiredSkillLevels) => {
    if (!classDetails || !desiredSkillLevels) return [];
    
    const orderedSkills = [];
    const classMasteryDesignation = masteryDesignation[selectedClass];
    
    if (!classMasteryDesignation) return [];

    // Origin skill
    const formattedOriginSkill = formatSkillPath(classDetails.originSkill);
    if (desiredSkillLevels[formattedOriginSkill]) {
      orderedSkills.push(formattedOriginSkill);
    }

    // First Mastery skills
    classMasteryDesignation.firstMastery.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Second Mastery skills
    classMasteryDesignation.secondMastery.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Boost skills
    classDetails.boostSkills.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    // Common skills
    classDetails.commonSkills.forEach(skill => {
      const formattedSkill = formatSkillPath(skill);
      if (desiredSkillLevels[formattedSkill]) {
        orderedSkills.push(formattedSkill);
      }
    });

    return orderedSkills;
  };

  const totalRemaining = calculateTotal();
  const orderedSkills = getOrderedSkills(classDetails, desiredSkillLevels);

  if (!classDetails || !desiredSkillLevels || Object.keys(desiredSkillLevels).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <GoalInputGrid
        classKey={selectedClass}
        classDetails={classDetails}
        skillLevels={desiredSkillLevels}
        updateSkillLevels={updateSkillLevels}
      />
      <div className="mt-4 flex items-center flex-col">
        <h2 className="text-xl font-bold mb-2">Progress:</h2>
        {orderedSkills.map((skillName) => {
          const costs = calculateCosts(skillName);
          const skillType = desiredSkillLevels[skillName].type;
          return (
            <div key={skillName} className="mb-4 p-4 bg-primary-dark rounded-lg w-[75%]">
              <div className="flex items-center mb-2">
                <Image
                  src={getSkillImage(skillName, skillType)}
                  alt={skillName}
                  width={40}
                  height={40}
                  className="mr-3"
                />
                <span className="flex-1 font-semibold text-primary">{formatSkillName(skillName)}</span>
                <span className="text-sm font-medium text-primary">
                  Level: {costs.levels.current} → {costs.levels.desired}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="items-start flex flex-col">
                  <div className="flex flex-col items-center justify-center">
                    <h3 className="text-sm font-medium text-primary">Current Resources Spent:</h3>
                    <div className="items-center self-start flex flex-col">
                      <div className="flex flex-col items-center gap-2 w-fit my-2">
                        <Image
                          src={sol_erda}
                          width={32}
                          height={32}
                          alt={"Sol Erda Energy"}
                        />
                        <p className="text-blue-600">{costs.current.solErda}</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-fit my-2 ">
                        <Image
                          src={sol_erda_fragment}
                          width={32}
                          height={32}
                          alt={"Sol Erda Fragment"}
                        />
                        <p className="text-green-600">{costs.current.frags}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="items-end flex flex-col">
                  <div className="flex flex-col items-center justify-center">
                    <h3 className="text-sm font-medium text-primary">Remaining:</h3>
                    <div className="flex flex-col items-center gap-2 w-fit my-2">
                      <Image
                        src={sol_erda}
                        width={32}
                        height={32}
                        alt={"Sol Erda Energy"}
                      />
                      <p className="text-blue-600">{costs.remaining.solErda}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-fit my-2 ">
                      <Image
                        src={sol_erda_fragment}
                        width={32}
                        height={32}
                        alt={"Sol Erda Fragment"}
                      />
                      <p className="text-green-600">{costs.remaining.frags}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <h2 className="text-lg font-bold mb-2">Total Remaining:</h2>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">

            <Image
              src={sol_erda}
              width={48}
              height={48}
              alt={"Sol Erda Energy"}
            />
            <p className="text-blue-600 font-medium text-[24px]">{totalRemaining.solErda}</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={sol_erda_fragment}
              width={48}
              height={48}
              alt={"Sol Erda Fragment"}
            />
            <p className="text-green-600 font-medium text-[24px]">{totalRemaining.frags}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalc;